// ═══════════════════════════════════════════════════════════════════
// POST /api/checkout
// Creates a Lemon Squeezy hosted checkout for the Growth plan.
// Returns { url } that the frontend redirects to.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { createGrowthCheckout } from '@/lib/lemon';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('brand_name').eq('id', user.id).single();

  try {
    const url = await createGrowthCheckout({
      userId: user.id,
      email: user.email!,
      brandName: profile?.brand_name ?? undefined,
    });
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: 'checkout_failed', message: e?.message ?? String(e) }, { status: 500 });
  }
}
