import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import BillingClient from './BillingClient';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  const svc = getServiceSupabase();
  const { data: sub } = await svc.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle();
  const { data: usage } = await svc.rpc('current_period_usage', { uid: user.id }).single();

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Billing"
      subtitle="Plan, room previews used, and invoices."
    >
      <BillingClient
        subscription={sub}
        used={(usage as any)?.used ?? 0}
        limit={(usage as any)?.limit_total ?? 1000}
        showWelcome={searchParams.welcome === '1'}
      />
    </DashShell>
  );
}
