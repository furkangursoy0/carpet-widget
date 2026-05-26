// ═══════════════════════════════════════════════════════════════════
// POST /api/lemon/webhook
// Handles Lemon Squeezy subscription lifecycle events.
// Signature verified via HMAC-SHA256 with LEMONSQUEEZY_WEBHOOK_SECRET.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase-server';
import { verifyLemonSignature, type LemonSubscriptionPayload, type LemonWebhookEvent } from '@/lib/lemon';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PaymentReceiptEmail from '@/emails/PaymentReceiptEmail';

export const runtime = 'nodejs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sceneva.com';

async function sendEmail(to: string, subject: string, react: any) {
  if (!process.env.RESEND_API_KEY) return; // skip in dev without key
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = await render(react);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'hello@sceneva.com',
    to,
    subject,
    html,
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-signature');
  if (!verifyLemonSignature(rawBody, sig)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonSubscriptionPayload;
  const eventName = payload.meta.event_name as LemonWebhookEvent;
  const userId = payload.meta.custom_data?.user_id;
  if (!userId) return NextResponse.json({ ok: true, skipped: 'no_user_id' });

  const supabase = getServiceSupabase();
  const attrs = payload.data.attributes;

  // Map Lemon status to our internal status enum
  const status =
    attrs.status === 'active' || attrs.status === 'on_trial' ? 'active' :
    attrs.status === 'past_due' || attrs.status === 'unpaid' ? 'past_due' :
    attrs.status === 'cancelled' ? 'cancelled' :
    attrs.status === 'paused' ? 'cancelled' :
    'expired';

  // Upsert subscription row
  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      lemon_subscription_id: payload.data.id,
      lemon_customer_id: String(attrs.customer_id),
      lemon_variant_id: String(attrs.variant_id),
      status,
      plan: 'growth',
      monthly_limit: Number(process.env.GROWTH_PLAN_MONTHLY_LIMIT ?? 1000),
      current_period_start: attrs.created_at,
      current_period_end: attrs.renews_at ?? attrs.ends_at,
      cancel_at: attrs.cancelled ? attrs.ends_at : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  // Fetch user profile for email personalization
  const { data: profile } = await supabase
    .from('users')
    .select('email, brand_name')
    .eq('id', userId)
    .single();

  const email = profile?.email;
  const brandName = profile?.brand_name ?? 'there';

  // Transactional emails based on event type
  if (email) {
    if (eventName === 'subscription_created') {
      // Fetch embed key for the welcome email snippet
      const { data: widget } = await supabase.from('widgets').select('embed_key').eq('user_id', userId).maybeSingle();
      const embedKey = widget?.embed_key ?? '';
      await sendEmail(
        email,
        '🎉 Welcome to Sceneva — your widget is ready',
        WelcomeEmail({ brandName, embedKey, appUrl }),
      );
    }

    if (eventName === 'subscription_payment_success') {
      // Payment receipt
      const amount = `$${((attrs as any).total ?? 9900) / 100}`;
      const periodEnd = attrs.renews_at
        ? new Date(attrs.renews_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'next billing date';
      const invoiceUrl = (attrs as any).urls?.invoice_url ?? `${appUrl}/billing`;
      await sendEmail(
        email,
        `Sceneva — Payment confirmed (${amount})`,
        PaymentReceiptEmail({ brandName, amount, invoiceUrl, periodEnd, appUrl }),
      );
    }
  }

  return NextResponse.json({ ok: true, event: eventName });
}
