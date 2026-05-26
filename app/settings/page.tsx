import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Settings"
      subtitle="Brand and account. Widget settings live under Widgets."
    >
      <SettingsClient
        initialBrandName={profile.brand_name ?? ''}
        initialStoreUrl={profile.store_url ?? ''}
        userEmail={user.email ?? ''}
        userId={user.id}
      />
    </DashShell>
  );
}
