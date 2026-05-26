import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import OverviewClient from './OverviewClient';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  // Pull last-30-day stats via service role
  const svc = getServiceSupabase();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await svc
    .from('usage_events')
    .select('event_type, page_url, product_title, device, created_at')
    .eq('user_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000);

  const { data: usage } = await svc.rpc('current_period_usage', { uid: user.id }).single();

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Overview"
      subtitle="Widget activity, top products, and live engagement across your storefront."
    >
      <OverviewClient
        events={events ?? []}
        used={(usage as any)?.used ?? 0}
        limit={(usage as any)?.limit_total ?? 1000}
        periodEnd={(usage as any)?.period_end_date ?? null}
      />
    </DashShell>
  );
}
