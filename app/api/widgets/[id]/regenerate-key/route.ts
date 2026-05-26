// POST /api/widgets/:id/regenerate-key  — rotate a single widget's embed_key.

import { NextResponse } from 'next/server';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const newKey = crypto.randomBytes(16).toString('hex');
  const svc = getServiceSupabase();
  const { error } = await svc
    .from('widgets')
    .update({ embed_key: newKey })
    .eq('id', ctx.params.id)
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, embed_key: newKey });
}
