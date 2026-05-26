// ═══════════════════════════════════════════════════════════════════
// POST /api/billing/portal
// Returns the URL of the Lemon Squeezy customer portal for this user.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const svc = getServiceSupabase();
  const { data: sub } = await svc.from('subscriptions').select('lemon_subscription_id').eq('user_id', user.id).maybeSingle();
  if (!sub?.lemon_subscription_id) return NextResponse.json({ error: 'no_subscription' }, { status: 404 });

  // Lemon hosted portal URL pattern:
  //   https://{store}.lemonsqueezy.com/billing
  // For a per-subscription portal, query the subscription API:
  //   GET /v1/subscriptions/{id}/customer-portal
  // For v1 simplicity, we just send to the generic billing URL.
  const url = `https://${process.env.LEMONSQUEEZY_STORE_SLUG || 'sceneva'}.lemonsqueezy.com/billing`;
  return NextResponse.json({ url });
}
