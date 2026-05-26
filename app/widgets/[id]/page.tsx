import { redirect, notFound } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import WidgetEditorClient from './WidgetEditorClient';
import type { DbWidget } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function WidgetEditorPage({ params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  const svc = getServiceSupabase();
  const { data: widget } = await svc
    .from('widgets')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!widget) notFound();

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title={widget.name || 'Widget'}
      subtitle="Edit appearance, domains, and embed code. Preview updates live."
    >
      <WidgetEditorClient widget={widget as DbWidget} />
    </DashShell>
  );
}
