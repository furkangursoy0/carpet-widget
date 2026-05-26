'use client';

import { Eye, Users, Download, Target, Monitor, Smartphone, Tablet, ArrowUpRight, Sparkles, Share2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

type EventRow = {
  event_type: string;
  page_url: string | null;
  product_title: string | null;
  device: string | null;
  created_at: string;
};

export default function OverviewClient({
  events,
  used,
  limit,
  periodEnd,
}: {
  events: EventRow[];
  used: number;
  limit: number;
  periodEnd: string | null;
}) {
  const generated = events.filter((e) => e.event_type === 'generated').length;
  const sessions = new Set(events.map((e) => `${e.page_url}-${e.created_at.slice(0, 10)}`)).size;
  const downloads = events.filter((e) => e.event_type === 'downloaded').length;
  // Compute detection success = generated / (generated + errors)
  const errors = events.filter((e) => e.event_type === 'error').length;
  const detectRate = generated + errors === 0 ? 0 : (generated / (generated + errors)) * 100;

  const devices = events.reduce((acc, e) => {
    const d = (e.device ?? 'desktop') as 'desktop' | 'mobile' | 'tablet';
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, { desktop: 0, mobile: 0, tablet: 0 } as Record<'desktop' | 'mobile' | 'tablet', number>);
  const totalDev = Math.max(1, devices.desktop + devices.mobile + devices.tablet);

  const topProducts = aggregateBy(events.filter((e) => e.event_type === 'generated'), 'product_title');
  const topPages = aggregateBy(events.filter((e) => e.event_type === 'generated'), 'page_url');

  const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <>
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Room previews generated" value={formatNumber(generated)} Icon={Eye} />
        <KpiCard label="Unique sessions" value={formatNumber(sessions)} Icon={Users} />
        <KpiCard label="Downloads" value={formatNumber(downloads)} Icon={Download} />
        <KpiCard label="Detection success rate" value={`${detectRate.toFixed(1)}%`} Icon={Target} />
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

      {/* Device + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-extrabold mb-4">Device breakdown</h3>
          {[
            { Icon: Monitor, label: 'Desktop', count: devices.desktop, color: '#2458F5' },
            { Icon: Smartphone, label: 'Mobile', count: devices.mobile, color: '#7C3AED' },
            { Icon: Tablet, label: 'Tablet', count: devices.tablet, color: '#0EA5A4' },
          ].map(({ Icon, label, count, color }) => {
            const pct = (count / totalDev) * 100;
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
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-sub">
              No data yet — once shoppers start visualizing, top products appear here.
            </div>
          ) : (
            topProducts.slice(0, 5).map((p, i, arr) => (
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
          <span className="text-xs text-sub">Last 30 days</span>
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

function KpiCard({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-sub">{label}</span>
        <div className="w-7 h-7 rounded-md bg-bg grid place-items-center">
          <Icon size={14} className="text-sub" />
        </div>
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
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
