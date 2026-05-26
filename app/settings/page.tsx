import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  const svc = getServiceSupabase();
  const { data: widget } = await svc.from('widgets').select('*').eq('user_id', user.id).limit(1).maybeSingle();

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Settings"
      subtitle="Brand, widget appearance, embed code, and account."
    >
      <SettingsClient widget={widget} userId={user.id} />
    </DashShell>
  );
}
