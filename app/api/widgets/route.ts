// POST /api/widgets  — create a new widget for the authed user.

import { NextResponse } from 'next/server';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let name = 'New widget';
  try {
    const body = await req.json();
    if (typeof body?.name === 'string' && body.name.trim()) name = body.name.trim().slice(0, 80);
  } catch {}

  const svc = getServiceSupabase();
  const { data, error } = await svc
    .from('widgets')
    .insert({ user_id: user.id, name })
    .select('id, embed_key')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: data?.id, embed_key: data?.embed_key });
}
