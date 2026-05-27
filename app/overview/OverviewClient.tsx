'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Users, Download, Target, Monitor, Smartphone, Tablet, Sparkles, Share2, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

type EventRow = {
  event_type: string;
  page_url: string | null;
  product_title: string | null;
  device: string | null;
  created_at: string;
};

type WidgetSummary = { id: string; name: string };

type Period = '7d' | '30d' | '90d';

export default function OverviewClient({
  events,
  previousEvents,
  used,
  limit,
  periodEnd,
  widgets,
  selectedWidget,
  period,
  days,
}: {
  events: EventRow[];
  previousEvents: EventRow[];
  used: number;
  limit: number;
  periodEnd: string | null;
  widgets: WidgetSummary[];
  selectedWidget: string;
  period: Period;
  days: number;
}) {
  const router = useRouter();

  function updateParam(key: string, next: string, def: string) {
    const url = new URL(window.location.href);
    if (next === def) url.searchParams.delete(key);
    else url.searchParams.set(key, next);
    router.push(`${url.pathname}${url.search}`);
  }

  const stats = useMemo(() => computeStats(events), [events]);
  const prevStats = useMemo(() => computeStats(previousEvents), [previousEvents]);
  const daily = useMemo(() => buildDailySeries(events, days), [events, days]);

  const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <>
      {/* Filter row: widget switcher (if 2+) + period selector */}
      <div className="card p-3 flex flex-wrap items-center gap-3">
        {widgets.length > 1 ? (
          <>
            <Filter size={14} className="text-sub flex-shrink-0" />
            <span className="text-xs font-bold text-sub">Widget</span>
            <select
              value={selectedWidget}
              onChange={(e) => updateParam('widget', e.target.value, 'all')}
              className="min-w-[180px] h-9 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none"
            >
              <option value="all">All widgets</option>
              {widgets.map((w) => (
                <option key={w.id} value={w.id}>{w.name || 'Untitled widget'}</option>
              ))}
            </select>
            <span className="text-line">·</span>
          </>
        ) : null}

        <span className="text-xs font-bold text-sub">Period</span>
        <div className="inline-flex rounded-lg border border-line p-0.5">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('period', p, '30d')}
              className={`h-7 px-3 rounded-md text-xs font-extrabold transition-colors ${
                period === p ? 'bg-bg text-ink' : 'text-sub hover:text-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <p className="text-xs text-sub ml-auto hidden sm:block">
          Plan usage stays whole-account (quota is per subscription).
        </p>
      </div>

      {/* KPI Row with trend deltas vs previous period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Room previews generated" value={formatNumber(stats.generated)} delta={pctDelta(stats.generated, prevStats.generated)} Icon={Eye} />
        <KpiCard label="Unique sessions" value={formatNumber(stats.sessions)} delta={pctDelta(stats.sessions, prevStats.sessions)} Icon={Users} />
        <KpiCard label="Downloads" value={formatNumber(stats.downloads)} delta={pctDelta(stats.downloads, prevStats.downloads)} Icon={Download} />
        <KpiCard label="Detection success" value={`${stats.detectRate.toFixed(1)}%`} delta={pctDelta(stats.detectRate, prevStats.detectRate, true)} Icon={Target} />
      </div>

      {/* Plan usage */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-extrabold">Plan usage</h3>
          <a href="/billing" className="text-xs font-bold text-brand hover:text-brand-dark">View billing →</a>
        </div>
        <div className="flex items-end justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-sub text-sm">
              <strong className="text-ink text-xl font-extrabold tracking-tight">{formatNumber(used)}</strong>
              <span className="text-sm"> / {formatNumber(limit)} room previews</span>
            </p>
            <p className="text-xs text-sub mt-1">
              {periodEnd ? `Resets ${new Date(periodEnd).toLocaleDateString()} · Growth plan` : 'Growth plan'}
            </p>
          </div>
          <p className="text-xl font-extrabold">{usagePct.toFixed(1)}%</p>
        </div>
        <div className="h-2 bg-bg rounded-full overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${usagePct}%` }} />
        </div>
      </div>

      {/* Daily previews chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold">Previews per day</h3>
            <p className="text-xs text-sub mt-0.5">
              {daily.peakLabel ? `Peak ${daily.peakLabel} · ${daily.peakValue}` : `Last ${days} days`}
            </p>
          </div>
          <p className="text-xs font-bold text-sub">{formatNumber(stats.generated)} total</p>
        </div>
        <div className="h-32 flex items-end gap-1">
          {daily.series.map((d, i) => {
            const h = daily.peakValue > 0 ? Math.max(2, (d.value / daily.peakValue) * 100) : 2;
            const isPeak = d.value === daily.peakValue && daily.peakValue > 0;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all hover:opacity-90 relative group"
                style={{ height: `${h}%`, backgroundColor: isPeak ? '#2458F5' : 'rgba(36,88,245,0.5)' }}
                title={`${d.label}: ${d.value}`}
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-ink bg-white border border-line rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-sm">
                  {d.label} · {d.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-extrabold mb-4">Device breakdown</h3>
          {[
            { Icon: Monitor, label: 'Desktop', count: stats.devices.desktop, color: '#2458F5' },
            { Icon: Smartphone, label: 'Mobile', count: stats.devices.mobile, color: '#7C3AED' },
            { Icon: Tablet, label: 'Tablet', count: stats.devices.tablet, color: '#0EA5A4' },
          ].map(({ Icon, label, count, color }) => {
            const pct = (count / stats.totalDev) * 100;
            return (
              <div key={label} className="flex items-center gap-3 py-2.5">
                <Icon size={14} className="text-sub" />
                <span className="text-sm font-semibold text-ink w-20">{label}</span>
                <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <span className="text-sm font-bold w-12 text-right">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-rail">
            <h3 className="text-sm font-extrabold">Top visualized products</h3>
          </div>
          {stats.topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-sub">
              No data yet — once shoppers start visualizing, top products appear here.
            </div>
          ) : (
            stats.topProducts.slice(0, 5).map((p, i, arr) => (
              <div key={p.key} className={`flex items-center justify-between px-5 py-3 ${i < arr.length - 1 ? 'border-b border-rail' : ''}`}>
                <span className="text-sm font-semibold truncate flex-1 min-w-0 pr-3">{p.key}</span>
                <span className="text-sm font-bold text-sub">{p.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-rail flex items-center justify-between">
          <h3 className="text-sm font-extrabold">Recent activity</h3>
          <span className="text-xs text-sub">Last {days} days</span>
        </div>
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-light grid place-items-center mb-3">
              <Sparkles size={20} className="text-brand" />
            </div>
            <p className="text-sm font-semibold mb-1">No activity yet</p>
            <p className="text-xs text-sub max-w-xs mx-auto">Once your widget is live and a shopper uploads a room photo, you'll see activity here in real time.</p>
          </div>
        ) : (
          events.slice(0, 8).map((e, i, arr) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i < arr.length - 1 ? 'border-b border-rail' : ''}`}>
              <ActivityIcon type={e.event_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold capitalize">{e.event_type.replace('_', ' ')}</p>
                <p className="text-xs text-sub truncate">
                  {e.product_title ?? e.page_url ?? '—'} {e.device ? `· ${e.device}` : ''}
                </p>
              </div>
              <span className="text-xs text-sub whitespace-nowrap">{formatRelativeTime(e.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ─── stats helpers ────────────────────────────────────────────────

function computeStats(events: EventRow[]) {
  const generated = events.filter((e) => e.event_type === 'generated').length;
  const sessions = new Set(events.map((e) => `${e.page_url}-${e.created_at.slice(0, 10)}`)).size;
  const downloads = events.filter((e) => e.event_type === 'downloaded').length;
  const errors = events.filter((e) => e.event_type === 'error').length;
  const detectRate = generated + errors === 0 ? 0 : (generated / (generated + errors)) * 100;
  const devices = events.reduce((acc, e) => {
    const d = (e.device ?? 'desktop') as 'desktop' | 'mobile' | 'tablet';
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, { desktop: 0, mobile: 0, tablet: 0 } as Record<'desktop' | 'mobile' | 'tablet', number>);
  const totalDev = Math.max(1, devices.desktop + devices.mobile + devices.tablet);
  const topProducts = aggregateBy(events.filter((e) => e.event_type === 'generated'), 'product_title');
  return { generated, sessions, downloads, errors, detectRate, devices, totalDev, topProducts };
}

// Build a per-day series across the chosen window (zero-filled).
function buildDailySeries(events: EventRow[], days: number) {
  const counts = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Seed every day with 0 so the chart shows a continuous baseline
  // even when several days have no traffic.
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of events) {
    if (e.event_type !== 'generated') continue;
    const k = e.created_at.slice(0, 10);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const series = [...counts.entries()].map(([key, value]) => ({
    label: new Date(key + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value,
  }));
  const peak = series.reduce((m, d) => (d.value > m.value ? d : m), { label: '', value: 0 });
  return { series, peakValue: peak.value, peakLabel: peak.label };
}

function pctDelta(current: number, previous: number, isRate = false): { value: number; label: string; dir: 'up' | 'down' | 'flat' } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { value: 100, label: 'new', dir: 'up' };
  const pct = ((current - previous) / previous) * 100;
  const abs = Math.abs(pct);
  if (abs < 0.5) return { value: 0, label: 'flat', dir: 'flat' };
  return {
    value: pct,
    label: `${pct >= 0 ? '+' : ''}${pct.toFixed(isRate ? 1 : 0)}%`,
    dir: pct >= 0 ? 'up' : 'down',
  };
}

// ─── ui helpers ───────────────────────────────────────────────────

function KpiCard({ label, value, delta, Icon }: { label: string; value: string; delta: ReturnType<typeof pctDelta>; Icon: any }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-sub">{label}</span>
        <div className="w-7 h-7 rounded-md bg-bg grid place-items-center">
          <Icon size={14} className="text-sub" />
        </div>
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      {delta ? (
        <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold ${
          delta.dir === 'up' ? 'text-success' : delta.dir === 'down' ? 'text-danger' : 'text-sub'
        }`}>
          {delta.dir === 'up' ? <TrendingUp size={11} /> : delta.dir === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
          {delta.label}
          <span className="text-sub font-semibold">vs previous</span>
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-sub font-semibold">No prior data</p>
      )}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const color =
    type === 'generated' ? '#2458F5' :
    type === 'downloaded' ? '#16A34A' :
    type === 'shared' ? '#7C3AED' :
    type === 'error' ? '#DC2626' :
    '#64748B';
  const Icon = type === 'generated' ? Sparkles : type === 'downloaded' ? Download : type === 'shared' ? Share2 : Eye;
  return (
    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ backgroundColor: color + '1A' }}>
      <Icon size={15} color={color} />
    </div>
  );
}

function aggregateBy<T>(rows: T[], key: keyof T): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = String(r[key] ?? '').trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count);
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
