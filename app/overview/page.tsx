import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import OverviewClient from './OverviewClient';

export const dynamic = 'force-dynamic';

export default async function OverviewPage({ searchParams }: { searchParams?: { widget?: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  // Read the optional ?widget=<id> filter — defaults to "all" so single-
  // widget users see no change in behaviour.
  const widgetFilter = (typeof searchParams?.widget === 'string' ? searchParams.widget : null) ?? 'all';

  // Pull last-30-day stats via service role
  const svc = getServiceSupabase();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: widgets } = await svc
    .from('widgets')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  let eventsQuery = svc
    .from('usage_events')
    .select('event_type, page_url, product_title, device, created_at, widget_id')
    .eq('user_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000);
  if (widgetFilter !== 'all') eventsQuery = eventsQuery.eq('widget_id', widgetFilter);
  const { data: events } = await eventsQuery;

  // Usage RPC is always scoped to the subscription (quota is per-user,
  // not per-widget) — so we show it as-is regardless of the filter.
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
        widgets={(widgets ?? []) as { id: string; name: string }[]}
        selectedWidget={widgetFilter}
      />
    </DashShell>
  );
}
