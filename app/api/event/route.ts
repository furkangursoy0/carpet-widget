// ═══════════════════════════════════════════════════════════════════
// POST /api/event
// Body: { widget_key, event_type, page_url?, product_title?, product_image_url? }
// Logs widget interactions (opened, downloaded, shared, error) without
// hitting the AI pipeline. Fire-and-forget from the widget.
//
// Hardening:
//   • Origin must match widgets.allowed_domains
//   • page_url is sanitized to origin + pathname
//   • We never persist IP, User-Agent, or referrer
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';
import { parseDeviceFromUA, sanitizePageUrl, originAllowed } from '@/lib/utils';

export const runtime = 'edge';

const ALLOWED_TYPES = new Set(['opened', 'downloaded', 'shared', 'error']);

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? req.headers.get('referer');
  const body = await req.json().catch(() => null);
  if (!body?.widget_key || !body?.event_type || !ALLOWED_TYPES.has(body.event_type)) {
    return NextResponse.json({ ok: false }, { status: 400, headers: cors() });
  }

  const supabase = getServiceSupabase();
  const { data: widget } = await supabase
    .from('widgets')
    .select('id, user_id, allowed_domains, status')
    .eq('embed_key', body.widget_key)
    .maybeSingle();
  if (!widget) return NextResponse.json({ ok: false }, { status: 404, headers: cors() });
  if (widget.status === 'paused') return NextResponse.json({ ok: false }, { status: 403, headers: cors() });
  if (!originAllowed(origin, widget.allowed_domains ?? [])) {
    return NextResponse.json({ ok: false }, { status: 403, headers: cors() });
  }

  await supabase.from('usage_events').insert({
    widget_id: widget.id,
    user_id: widget.user_id,
    event_type: body.event_type,
    page_url: sanitizePageUrl(body.page_url),
    product_image_url: body.product_image_url ?? null,
    product_title: body.product_title ?? null,
    device: parseDeviceFromUA(req.headers.get('user-agent')),
    meta: body.meta ?? {},
  });

  return NextResponse.json({ ok: true }, { headers: cors() });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors() });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
