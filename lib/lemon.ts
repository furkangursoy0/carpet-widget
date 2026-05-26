// ═══════════════════════════════════════════════════════════════════
// Lemon Squeezy client + helpers
// https://docs.lemonsqueezy.com/api
// ═══════════════════════════════════════════════════════════════════

import { lemonSqueezySetup, createCheckout, getCustomer, listSubscriptions } from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';

let _configured = false;

function ensureLemon() {
  if (_configured) return;
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (err) => console.error('[lemon]', err),
  });
  _configured = true;
}

/**
 * Create a hosted Lemon Squeezy checkout for the Growth plan.
 * The user_id is passed via custom data so the webhook can link
 * the resulting subscription back to our user.
 */
export async function createGrowthCheckout(args: {
  userId: string;
  email: string;
  brandName?: string;
}) {
  ensureLemon();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = process.env.LEMONSQUEEZY_GROWTH_VARIANT_ID!;
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing?welcome=1`;

  const res = await createCheckout(storeId, variantId, {
    checkoutOptions: { embed: false, dark: false },
    checkoutData: {
      email: args.email,
      name: args.brandName,
      custom: { user_id: args.userId },
    },
    productOptions: {
      redirectUrl: successUrl,
      receiptThankYouNote: 'You can install your widget right away — check the dashboard!',
    },
  });

  if (res.error) throw new Error(`Lemon checkout failed: ${res.error.message}`);
  return res.data?.data.attributes.url as string;
}

/**
 * Verify Lemon webhook signature.
 * Lemon signs the raw request body with HMAC SHA256 using the webhook secret.
 */
export function verifyLemonSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody, 'utf8').digest('hex'), 'utf8');
  const incoming = Buffer.from(signatureHeader, 'utf8');
  if (digest.length !== incoming.length) return false;
  return crypto.timingSafeEqual(digest, incoming);
}

export type LemonWebhookEvent =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'subscription_payment_success'
  | 'subscription_payment_failed';

export type LemonSubscriptionPayload = {
  meta: { event_name: LemonWebhookEvent; custom_data?: { user_id?: string } };
  data: {
    id: string;
    type: 'subscriptions';
    attributes: {
      status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
      customer_id: number;
      variant_id: number;
      renews_at: string | null;
      ends_at: string | null;
      cancelled: boolean;
      user_email: string;
      created_at: string;
      updated_at: string;
    };
  };
};
