import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import DashShell from '@/components/DashShell';
import OverviewClient from './OverviewClient';

export const dynamic = 'force-dynamic';

// Valid period selectors → number of days back.
const PERIODS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

export default async function OverviewPage({ searchParams }: { searchParams?: { widget?: string; period?: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.onboarded) redirect('/onboarding');

  const widgetFilter = (typeof searchParams?.widget === 'string' ? searchParams.widget : null) ?? 'all';
  const periodKey = typeof searchParams?.period === 'string' && PERIODS[searchParams.period] ? searchParams.period : '30d';
  const days = PERIODS[periodKey];

  const svc = getServiceSupabase();
  const now = Date.now();
  const sinceCurrent = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  const sincePrevious = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString();
  // Used to split the joined query back into "current" vs "previous"
  // for trend math without doing two round-trips.
  const splitAt = new Date(now - days * 24 * 60 * 60 * 1000).getTime();

  const { data: widgets } = await svc
    .from('widgets')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Single query covers both the displayed period AND the previous
  // window of equal length, so we can compute trend deltas without a
  // second DB hit. We cap at 5000 rows for safety on very busy stores;
  // analytics page will paginate properly later.
  let eventsQuery = svc
    .from('usage_events')
    .select('event_type, page_url, product_title, device, created_at, widget_id')
    .eq('user_id', user.id)
    .gte('created_at', sincePrevious)
    .order('created_at', { ascending: false })
    .limit(5000);
  if (widgetFilter !== 'all') eventsQuery = eventsQuery.eq('widget_id', widgetFilter);
  const { data: allEvents } = await eventsQuery;

  const events = (allEvents ?? []).filter((e) => new Date(e.created_at).getTime() >= splitAt);
  const previousEvents = (allEvents ?? []).filter((e) => new Date(e.created_at).getTime() < splitAt);

  const { data: usage } = await svc.rpc('current_period_usage', { uid: user.id }).single();

  return (
    <DashShell
      brandName={profile.brand_name ?? ''}
      userEmail={user.email ?? ''}
      title="Overview"
      subtitle="Widget activity, top products, and live engagement across your storefront."
    >
      <OverviewClient
        events={events}
        previousEvents={previousEvents}
        used={(usage as any)?.used ?? 0}
        limit={(usage as any)?.limit_total ?? 1000}
        periodEnd={(usage as any)?.period_end_date ?? null}
        widgets={(widgets ?? []) as { id: string; name: string }[]}
        selectedWidget={widgetFilter}
        period={periodKey as '7d' | '30d' | '90d'}
        days={days}
      />
    </DashShell>
  );
}
