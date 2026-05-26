// ═══════════════════════════════════════════════════════════════════
// POST /api/visualize
// Body: { widget_key, room_image_base64, product_image_url,
//         product_title?, page_url?, room_width?, room_height? }
// Returns: { ok: true, result_image_url, generation_id } | { ok: false, ... }
//
// Hardening:
//   1) Origin / Referer must be in widgets.allowed_domains (fail-closed)
//   2) Per-IP rate limit (10/min) via Postgres RPC
//   3) Hashed IP — raw IP never persisted
//   4) Quota check + atomic increment with one-shot "limit reached" email
//   5) Result stored in PRIVATE bucket, returned as 30-day signed URL
//   6) page_url is sanitized to origin + pathname before logging
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { getServiceSupabase } from '@/lib/supabase-server';
import { visualizeRoomWithRug } from '@/lib/openai';
import {
  parseDeviceFromUA,
  sanitizePageUrl,
  originAllowed,
  pickImageSize,
  hashIp,
  clientIp,
} from '@/lib/utils';
import type { VisualizeRequest, VisualizeResponse } from '@/lib/types';
import LimitReachedEmail from '@/emails/LimitReachedEmail';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sceneva.com';
const VISUALIZE_PER_MINUTE = 10;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? req.headers.get('referer');
  const body = (await req.json().catch(() => ({}))) as VisualizeRequest;
  const { widget_key, room_image_base64, product_image_url, product_title, page_url, room_width, room_height } = body ?? {};

  if (!widget_key || !room_image_base64 || !product_image_url) {
    return json({ ok: false, error: 'invalid_key', message: 'Missing required fields' }, 400);
  }

  const supabase = getServiceSupabase();

  const { data: widget } = await supabase
    .from('widgets')
    .select('id, user_id, status, allowed_domains')
    .eq('embed_key', widget_key)
    .maybeSingle();

  if (!widget) return json({ ok: false, error: 'invalid_key', message: 'Widget key not found' }, 404);
  if (widget.status === 'paused') return json({ ok: false, error: 'paused', message: 'This widget is paused' }, 403);

  if (!originAllowed(origin, widget.allowed_domains ?? [])) {
    return json(
      { ok: false, error: 'forbidden_origin', message: 'This widget is not authorized for this domain. Add the domain in Settings.' },
      403,
    );
  }

  // Rate limit (hashed IP, per-widget)
  const ipH = await hashIp(clientIp(req));
  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    w_id: widget.id,
    ip_h: ipH,
    bucket_name: 'visualize',
    per_minute: VISUALIZE_PER_MINUTE,
  });
  if (allowed === false) {
    return json({ ok: false, error: 'rate_limited', message: 'Too many previews from this device — try again in a minute.' }, 429);
  }

  // Quota check
  const { data: usage } = await supabase.rpc('current_period_usage', { uid: widget.user_id }).single();
  const usedCount = (usage as any)?.used ?? 0;
  const limitTotal = (usage as any)?.limit_total ?? 1000;
  if (usedCount >= limitTotal) {
    return json({ ok: false, error: 'limit_reached', message: 'Monthly preview limit reached. Please upgrade your plan.' }, 402);
  }

  // Log "uploaded" event so the dashboard sees traffic even if AI fails
  const ua = req.headers.get('user-agent');
  const device = parseDeviceFromUA(ua);
  const safePageUrl = sanitizePageUrl(page_url);
  await supabase.from('usage_events').insert({
    widget_id: widget.id,
    user_id: widget.user_id,
    event_type: 'uploaded',
    page_url: safePageUrl,
    product_image_url,
    product_title,
    device,
  });

  // Run the AI generation with an aspect-aware size
  const size = pickImageSize(room_width, room_height);
  let result;
  try {
    result = await visualizeRoomWithRug({
      roomImageBase64: room_image_base64,
      productImageUrl: product_image_url,
      productTitle: product_title,
      size,
    });
  } catch (err: any) {
    await supabase.from('usage_events').insert({
      widget_id: widget.id,
      user_id: widget.user_id,
      event_type: 'error',
      page_url: safePageUrl,
      product_image_url,
      device,
      error_code: 'openai_failed',
      meta: { message: String(err?.message ?? err) },
    });
    return json({ ok: false, error: 'generation_failed', message: 'AI generation failed — please try again' }, 500);
  }

  // Upload result to PRIVATE bucket, then mint a signed URL with TTL
  const resultPath = `${widget.user_id}/${Date.now()}.png`;
  const resultBuf = Buffer.from(result.imageBase64, 'base64');
  const { error: uploadErr } = await supabase.storage
    .from('previews')
    .upload(resultPath, resultBuf, { contentType: 'image/png', cacheControl: '604800' });
  if (uploadErr) {
    return json({ ok: false, error: 'generation_failed', message: 'Could not store result image' }, 500);
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from('previews')
    .createSignedUrl(resultPath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    return json({ ok: false, error: 'generation_failed', message: 'Could not prepare preview link' }, 500);
  }
  const resultUrl = signed.signedUrl;

  // Record success event (store path, not signed URL — we re-mint for dashboard views)
  const { data: ev } = await supabase
    .from('usage_events')
    .insert({
      widget_id: widget.id,
      user_id: widget.user_id,
      event_type: 'generated',
      page_url: safePageUrl,
      product_image_url,
      product_title,
      device,
      result_storage_path: resultPath,
      duration_ms: result.durationMs,
      meta: { model: result.model, size },
    })
    .select('id')
    .single();

  // Atomic increment — returns just_reached=true only on the single call
  // that crosses the limit AND hasn't already sent the email this period.
  const { data: incRows } = await supabase.rpc('increment_usage', { uid: widget.user_id });
  const justReached = Array.isArray(incRows) && incRows[0]?.just_reached === true;
  if (justReached && process.env.RESEND_API_KEY) {
    const { data: profile } = await supabase
      .from('users')
      .select('email, brand_name')
      .eq('id', widget.user_id)
      .single();
    if (profile?.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = await render(LimitReachedEmail({ brandName: profile.brand_name ?? 'there', limit: limitTotal, appUrl }));
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'hello@sceneva.com',
          to: profile.email,
          subject: 'Sceneva — Monthly limit reached',
          html,
        });
      } catch {
        // Email is best-effort — never block the response on it
      }
    }
  }

  return json({ ok: true, result_image_url: resultUrl, generation_id: ev?.id ?? '' }, 200);
}

function json(body: VisualizeResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Vary': 'Origin',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
