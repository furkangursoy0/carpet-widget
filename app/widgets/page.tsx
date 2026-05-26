import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import WidgetsListClient from './WidgetsListClient';
import type { DbWidget } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function WidgetsPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  const svc = getServiceSupabase();
  const { data: widgets } = await svc
    .from('widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Widgets"
      subtitle="Each widget is its own embed key, appearance, and domain whitelist."
    >
      <WidgetsListClient widgets={(widgets ?? []) as DbWidget[]} />
    </DashShell>
  );
}
