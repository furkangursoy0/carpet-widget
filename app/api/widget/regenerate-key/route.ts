// ═══════════════════════════════════════════════════════════════════
// POST /api/widget/regenerate-key
// Regenerates the embed_key for the user's widget (auth required).
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const newKey = crypto.randomBytes(16).toString('hex');
  const svc = getServiceSupabase();
  const { error } = await svc.from('widgets').update({ embed_key: newKey }).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, embed_key: newKey });
}
