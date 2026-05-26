// DELETE /api/widgets/:id  — delete a widget (must be owned by authed user).

import { NextResponse } from 'next/server';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const svc = getServiceSupabase();
  const { error } = await svc
    .from('widgets')
    .delete()
    .eq('id', ctx.params.id)
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
