'use client';

import { useState, createContext, useContext } from 'react';
import {
  X, LayoutDashboard, Grid2X2, Activity, Target, CreditCard, Settings, ChevronDown,
  Clock, Filter, Download, Eye, Users, ArrowUpRight, Monitor, Smartphone, Tablet,
  Sparkles, Share2, RefreshCcw, Check, Copy, Globe, Box, Brush,
} from 'lucide-react';

const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'] as const;
type Range = typeof RANGES[number];
const RANGE_M: Record<Range, number> = { 'Last 7 days': 0.26, 'Last 30 days': 1, 'Last 90 days': 2.84, 'This year': 11.4 };

const Ctx = createContext<{ range: Range; setRange: (r: Range) => void; toast: (m: string) => void }>({ range: 'Last 30 days', setRange: () => {}, toast: () => {} });

const NAV = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'widgets', label: 'Widgets', Icon: Grid2X2 },
  { id: 'analytics', label: 'Analytics', Icon: Activity },
  { id: 'detection', label: 'Product Detection', Icon: Target },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'settings', label: 'Settings', Icon: Settings },
] as const;
type Section = typeof NAV[number]['id'];

const SUBS: Record<Section, string> = {
  overview: 'Widget activity, top products, and live engagement across all your storefronts.',
  widgets: 'Manage installed widgets and see per-widget performance.',
  analytics: 'Deep visualizer analytics — funnels, breakdowns, and trends.',
  detection: 'How well we detect product images across your catalog.',
  billing: 'Plan, room previews used, and overage details.',
  settings: 'Brand, detection, and privacy controls.',
};

export default function FullscreenDashboard({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<Section>('overview');
  const [range, setRange] = useState<Range>('Last 30 days');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = (m: string) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(null), 2200);
  };

  return (
    <Ctx.Provider value={{ range, setRange, toast }}>
      <div className="fixed inset-0 z-[1000] bg-black/55 grid place-items-center p-6">
        <div className="w-full max-w-[1400px] h-[94vh] max-h-[880px] min-h-[640px] rounded-2xl bg-bg border border-line shadow-2xl overflow-hidden flex">
          {/* Sidebar */}
          <aside className="w-60 bg-white border-r border-line flex flex-col">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-rail">
              <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-extrabold text-sm">Sceneva</p>
                <p className="text-sub text-[11px] font-semibold">Nomad Rugs</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full grid place-items-center hover:bg-bg transition-colors">
                <X size={16} className="text-sub" strokeWidth={2.2} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map(({ id, label, Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${isActive ? 'bg-brand-tint' : 'hover:bg-bg'}`}
                  >
                    <Icon size={17} className={isActive ? 'text-brand' : 'text-sub'} strokeWidth={2.1} />
                    <span className={`text-[13px] ${isActive ? 'text-brand font-extrabold' : 'text-sub font-semibold'}`}>{label}</span>
                    {isActive ? <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand" /> : null}
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-rail">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-line">
                <div className="w-7 h-7 rounded-full bg-brand-light grid place-items-center">
                  <span className="text-brand-ink text-[11px] font-extrabold">NR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-xs font-bold">Nomad Rugs</p>
                  <p className="text-sub text-[10.5px] font-semibold">Growth plan</p>
                </div>
                <ChevronDown size={14} className="text-sub" strokeWidth={2.2} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 flex flex-col min-w-0">
            <TopBar section={active} />
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-7 py-7 space-y-5">
                {active === 'overview' && <Overview />}
                {active === 'widgets' && <Widgets />}
                {active === 'analytics' && <Analytics />}
                {active === 'detection' && <Detection />}
                {active === 'billing' && <Billing />}
                {active === 'settings' && <SettingsSec />}
              </div>
            </div>
            {toastMsg ? (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-ink shadow-2xl">
                  <div className="w-[22px] h-[22px] rounded-full bg-success grid place-items-center">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-[12.5px] font-bold">{toastMsg}</p>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </Ctx.Provider>
  );
}

function TopBar({ section }: { section: Section }) {
  const { range, setRange, toast } = useContext(Ctx);
  const [rangeOpen, setRangeOpen] = useState(false);
  const item = NAV.find((n) => n.id === section)!;
  return (
    <header className="bg-white border-b border-line px-7 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-ink text-xl font-extrabold tracking-tight">{item.label}</h1>
        <p className="text-sub text-[12.5px] font-medium mt-0.5">{SUBS[section]}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setRangeOpen(!rangeOpen)}
            className="h-9 px-3 rounded-lg border border-line bg-white flex items-center gap-2 hover:bg-bg transition-colors"
          >
            <Clock size={13} className="text-sub" strokeWidth={2.2} />
            <span className="text-sub text-xs font-semibold">{range}</span>
            <ChevronDown size={13} className="text-sub" strokeWidth={2.2} style={{ transform: rangeOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {rangeOpen ? (
            <div className="absolute top-10 right-0 min-w-[180px] rounded-xl border border-line bg-white shadow-cardHover p-1.5 z-50">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRange(r); setRangeOpen(false); toast(`Range: ${r}`); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${range === r ? 'bg-brand-tint' : 'hover:bg-bg'}`}
                >
                  <span className={`text-[12.5px] ${range === r ? 'text-brand font-bold' : 'text-ink font-medium'}`}>{r}</span>
                  {range === r ? <Check size={13} className="text-brand" strokeWidth={2.6} /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="h-9 px-3 rounded-lg border border-line bg-white flex items-center gap-1.5 hover:bg-bg transition-colors">
          <Filter size={14} className="text-ink" strokeWidth={2.2} />
          <span className="text-ink text-xs font-bold">Filter</span>
        </button>
        <button onClick={() => toast('CSV export started')} className="h-9 px-3.5 rounded-lg bg-brand text-white flex items-center gap-1.5 hover:bg-brand-dark transition-colors">
          <Download size={14} strokeWidth={2.3} />
          <span className="text-xs font-bold">Export</span>
        </button>
      </div>
    </header>
  );
}

function scaleValue(base: number, range: Range): number {
  return Math.round(base * RANGE_M[range]);
}

function Card({ title, action, children, padding = 22 }: { title?: string; action?: React.ReactNode; children: React.ReactNode; padding?: number }) {
  return (
    <div className="rounded-xl border border-line bg-white overflow-hidden shadow-card">
      {title || action ? (
        <div className="flex items-center justify-between px-5 py-4 border-b border-rail">
          {title ? <h3 className="text-ink text-sm font-extrabold tracking-tight">{title}</h3> : <div />}
          {action ?? null}
        </div>
      ) : null}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}

function Kpi({ label, value, trend, Icon }: { label: string; value: string; trend?: string; Icon: any }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 space-y-1.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sub text-xs font-semibold">{label}</span>
        <div className="w-7 h-7 rounded-md bg-bg grid place-items-center">
          <Icon size={14} className="text-sub" strokeWidth={2.2} />
        </div>
      </div>
      <p className="text-ink text-2xl font-extrabold tracking-tight">{value}</p>
      {trend ? (
        <div className="flex items-center gap-1">
          <ArrowUpRight size={13} className="text-success" strokeWidth={2.4} />
          <span className="text-success text-[11px] font-bold">{trend}</span>
          <span className="text-[#94A3B8] text-[11px] font-medium">vs last period</span>
        </div>
      ) : null}
    </div>
  );
}

function Overview() {
  const { range } = useContext(Ctx);
  const previews = scaleValue(1482, range);
  const sessions = scaleValue(938, range);
  const downloads = scaleValue(216, range);
  const points = [28, 42, 36, 58, 71, 64, 88, 72, 95, 82, 110, 96, 124, 108, 142, 128, 156, 148, 172, 164, 188, 172, 204, 192, 218, 196, 232, 214, 246, 218];
  const maxP = Math.max(...points);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Kpi label="Room previews generated" value={previews.toLocaleString()} trend="+12.4%" Icon={Eye} />
        <Kpi label="Unique preview sessions" value={sessions.toLocaleString()} trend="+8.1%" Icon={Users} />
        <Kpi label="Downloads" value={downloads.toLocaleString()} trend="+24.6%" Icon={Download} />
        <Kpi label="Detection success rate" value="94.2%" trend="+2.1%" Icon={Target} />
      </div>

      <Card title="Plan usage" action={<span className="text-brand text-xs font-bold">View billing →</span>}>
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-sub text-sm font-semibold"><strong className="text-ink text-2xl font-extrabold tracking-tight">746</strong> / 1,000 room previews</p>
            <p className="text-[#94A3B8] text-[11px] font-medium mt-1">Resets in 11 days · Growth plan</p>
          </div>
          <p className="text-ink text-2xl font-extrabold">74.6%</p>
        </div>
        <div className="h-2 rounded-full bg-bg overflow-hidden">
          <div className="h-full bg-brand rounded-full" style={{ width: '74.6%' }} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Room previews over time" action={<span className="text-brand text-xs font-bold">{range}</span>}>
          <div className="h-44 flex items-end gap-1.5">
            {points.map((p, i) => <div key={i} className="flex-1 rounded-sm bg-brand" style={{ height: `${(p / maxP) * 100}%` }} />)}
          </div>
        </Card>
        <Card title="Device breakdown">
          {[
            { Icon: Monitor, label: 'Desktop', pct: 62, color: '#2458F5' },
            { Icon: Smartphone, label: 'Mobile', pct: 34, color: '#7C3AED' },
            { Icon: Tablet, label: 'Tablet', pct: 4, color: '#0EA5A4' },
          ].map(({ Icon, label, pct, color }) => (
            <div key={label} className="flex items-center gap-2.5 py-2">
              <Icon size={14} className="text-sub" strokeWidth={2.2} />
              <span className="text-sub text-xs font-semibold w-16">{label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-bg overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <span className="text-ink text-xs font-bold w-8 text-right">{pct}%</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Top visualized products" action={<span className="text-brand text-xs font-bold">View all →</span>} padding={0}>
          <Table cols={['Product', 'Previews', 'Trend']} rows={[
            ['Moroccan Oatmeal Rug', '182', '+18%'],
            ['Ivory Runner', '94', '+12%'],
            ['Vintage Heriz 8×10', '76', '+9%'],
            ['Beni Ourain Cream', '64', '+4%'],
            ['Persian Tabriz Navy', '52', '-2%'],
          ]} trendCol={2} />
        </Card>
        <Card title="Most active pages" action={<span className="text-brand text-xs font-bold">View all →</span>} padding={0}>
          <Table cols={['Page', 'Previews', 'Sessions']} rows={[
            ['/products/moroccan-oatmeal-rug', '182', '124'],
            ['/products/ivory-runner', '94', '71'],
            ['/products/vintage-heriz-8x10', '76', '58'],
            ['/collections/runners', '52', '46'],
            ['/products/beni-ourain', '38', '32'],
          ]} mono />
        </Card>
      </div>

      <Card title="Recent activity" action={<span className="text-brand text-xs font-bold">View all →</span>} padding={0}>
        {[
          { Icon: Sparkles, color: '#2458F5', title: 'Preview generated', sub: 'Moroccan Oatmeal Rug · Desktop · Chrome', time: '2 min ago' },
          { Icon: Download, color: '#16A34A', title: 'Download completed', sub: 'Ivory Runner · Desktop', time: '8 min ago' },
          { Icon: Share2, color: '#7C3AED', title: 'Result shared', sub: 'Vintage Heriz 8×10 · Mobile', time: '14 min ago' },
          { Icon: Sparkles, color: '#2458F5', title: 'Preview generated', sub: 'Beni Ourain Cream · Mobile · Safari', time: '21 min ago' },
          { Icon: Target, color: '#F59E0B', title: 'Detection fallback', sub: '/products/handmade-kilim · Asked for upload', time: '34 min ago' },
        ].map((row, i, arr) => (
          <div key={i} className={`flex items-center gap-3.5 px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-rail' : ''}`}>
            <div className="w-9 h-9 rounded-full grid place-items-center" style={{ backgroundColor: row.color + '1A' }}>
              <row.Icon size={15} color={row.color} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-[13px] font-bold">{row.title}</p>
              <p className="text-sub text-[11.5px] font-medium mt-0.5">{row.sub}</p>
            </div>
            <span className="text-[#94A3B8] text-[11px] font-semibold">{row.time}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function Table({ cols, rows, trendCol, mono }: { cols: string[]; rows: string[][]; trendCol?: number; mono?: boolean }) {
  return (
    <div>
      <div className="flex px-5 py-3 bg-[#FBFCFE] border-b border-rail">
        {cols.map((c, i) => (
          <span key={c} className={`flex-1 text-sub text-[11px] font-bold uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}>{c}</span>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className={`flex px-5 py-3.5 ${ri < rows.length - 1 ? 'border-b border-bg' : ''}`}>
          {row.map((cell, ci) => {
            const isTrend = ci === trendCol;
            const trendUp = isTrend && !cell.startsWith('-');
            const isFirst = ci === 0;
            return (
              <span
                key={ci}
                className={`flex-1 text-[12.5px] ${isFirst ? 'text-ink font-bold' : 'text-sub font-medium text-right'} ${mono && isFirst ? 'font-mono text-[12px]' : ''} ${isTrend ? (trendUp ? 'text-success font-bold' : 'text-danger font-bold') : ''}`}
              >{cell}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Widgets() {
  const widgets = [
    { name: 'Main Product Widget', kind: 'Floating · Bottom right', domain: 'nomadrugs.com', previews: '1,248', detection: '94%', domains: 3, status: 'Live' },
    { name: 'Collection Side Tab', kind: 'Side Tab · Right', domain: 'nomadrugs.com', previews: '186', detection: '89%', domains: 1, status: 'Live' },
    { name: 'Runner Inline CTA', kind: 'Inline · Embedded', domain: 'runners.nomadrugs.com', previews: '48', detection: '91%', domains: 1, status: 'Paused' },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sub text-sm font-medium">3 widgets installed across 3 domains</p>
        <button className="px-3.5 h-9 rounded-lg bg-ink text-white text-[12.5px] font-bold hover:bg-ink/90 transition-colors">+ New widget</button>
      </div>
      {widgets.map((w) => (
        <div key={w.name} className="rounded-xl border border-line bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <p className="text-ink text-base font-extrabold tracking-tight">{w.name}</p>
                <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10.5px] font-bold ${w.status === 'Live' ? 'bg-success/10 text-success' : 'bg-bg text-sub'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'Live' ? 'bg-success' : 'bg-sub'}`} />
                  {w.status}
                </span>
              </div>
              <p className="text-sub text-xs font-medium mt-1">{w.kind} · {w.domain}</p>
            </div>
            <button className="h-9 px-3.5 rounded-lg border border-line bg-white text-ink text-xs font-bold hover:bg-bg transition-colors">Edit widget</button>
          </div>
          <div className="flex gap-5 border-t border-rail pt-4">
            <div className="flex-1">
              <p className="text-ink text-xl font-extrabold tracking-tight">{w.previews}</p>
              <p className="text-[#94A3B8] text-[11px] font-semibold mt-1">Room previews</p>
            </div>
            <div className="flex-1">
              <p className="text-ink text-xl font-extrabold tracking-tight">{w.detection}</p>
              <p className="text-[#94A3B8] text-[11px] font-semibold mt-1">Detection success</p>
            </div>
            <div className="flex-1">
              <p className="text-ink text-xl font-extrabold tracking-tight">{w.domains}</p>
              <p className="text-[#94A3B8] text-[11px] font-semibold mt-1">Active domains</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function Analytics() {
  return (
    <>
      <Card title="Upload completion funnel">
        {[
          { label: 'Widget opened', value: 3842, pct: 100, color: '#2458F5' },
          { label: 'Room photo uploaded', value: 2186, pct: 56.9, color: '#2458F5' },
          { label: 'Preview generated', value: 1482, pct: 38.6, color: '#16A34A' },
          { label: 'Download or share clicked', value: 416, pct: 10.8, color: '#7C3AED' },
        ].map((row, i, arr) => (
          <div key={row.label} className={i === arr.length - 1 ? '' : 'mb-4'}>
            <div className="flex justify-between mb-1.5">
              <span className="text-ink text-[13px] font-bold">{row.label}</span>
              <span className="text-ink text-[13px] font-bold">{row.value.toLocaleString()} <span className="text-sub font-medium">· {row.pct}%</span></span>
            </div>
            <div className="h-2.5 rounded-full bg-bg overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </Card>
      <Card title="Detection method mix">
        {[
          { label: 'Gallery image', pct: 72, color: '#2458F5' },
          { label: 'Open Graph image', pct: 18, color: '#7C3AED' },
          { label: 'JSON-LD product image', pct: 7, color: '#0EA5A4' },
          { label: 'Fallback upload', pct: 3, color: '#F59E0B' },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3 py-2.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="text-sub text-xs font-semibold w-40">{r.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-bg overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
            </div>
            <span className="text-ink text-xs font-bold w-10 text-right">{r.pct}%</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function Detection() {
  const { toast } = useContext(Ctx);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ method: string; selector: string; time: string; success: boolean } | null>({ method: 'Gallery image', selector: '.product__media-item:first-child img', time: '284ms', success: true });
  const [copied, setCopied] = useState(false);

  const runTest = () => {
    setTesting(true);
    setResult(null);
    setTimeout(() => {
      setResult({ method: 'Gallery image', selector: '.product-gallery img:first-child', time: `${Math.floor(180 + Math.random() * 320)}ms`, success: true });
      setTesting(false);
    }, 1200);
  };

  const copy = () => {
    navigator.clipboard?.writeText('.product-gallery img:first-child');
    setCopied(true);
    toast('Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="rounded-xl border border-line bg-white p-6 flex flex-col lg:flex-row gap-5 shadow-card">
        <div className="flex-[1.4] min-w-0 space-y-2">
          <p className="text-[#94A3B8] text-[10.5px] font-extrabold tracking-wider">30-DAY DETECTION SCORE</p>
          <p className="text-ink text-[56px] leading-[60px] font-extrabold tracking-[-0.04em]">94.2%</p>
          <div className="flex items-center gap-1">
            <ArrowUpRight size={13} className="text-success" strokeWidth={2.4} />
            <span className="text-success text-[11px] font-bold">+2.1%</span>
            <span className="text-[#94A3B8] text-[11px] font-medium">vs previous period</span>
          </div>
          <p className="text-sub text-[12.5px] leading-[19px] font-medium max-w-md mt-2">1,396 of 1,482 product pages had their primary rug image detected automatically — no merchant config required.</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: 'Pages analyzed', value: '1,482' },
            { label: 'Auto-detected', value: '1,396' },
            { label: 'Fallback upload', value: '86' },
            { label: 'Failed detections', value: '12' },
          ].map((m) => (
            <div key={m.label} className="p-3.5 rounded-xl bg-bg border border-rail">
              <p className="text-ink text-[22px] font-extrabold tracking-tight">{m.value}</p>
              <p className="text-sub text-[11px] font-semibold mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Detection methods breakdown">
          {[
            { label: 'Gallery image', sub: 'Largest image inside .product-gallery', pct: 72, color: '#2458F5' },
            { label: 'Open Graph image', sub: 'og:image meta tag', pct: 18, color: '#7C3AED' },
            { label: 'JSON-LD product image', sub: 'Structured product schema', pct: 7, color: '#0EA5A4' },
            { label: 'Fallback upload', sub: 'Shopper uploaded the rug image manually', pct: 3, color: '#F59E0B' },
          ].map((r) => (
            <div key={r.label} className="flex items-start gap-2.5 py-3">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: r.color }} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-ink text-[13px] font-bold">{r.label}</p>
                  <p className="text-[13px] font-extrabold" style={{ color: r.color }}>{r.pct}%</p>
                </div>
                <p className="text-[#94A3B8] text-[11px] font-medium mt-0.5">{r.sub}</p>
                <div className="h-1.5 rounded-full bg-bg overflow-hidden mt-1.5">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
                </div>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Pages where detection failed" action={<span className="text-brand text-xs font-bold">12 pages</span>}>
          {[
            { url: '/products/ivory-runner-3x8', reason: 'No gallery selector found' },
            { url: '/products/handmade-kilim', reason: 'OG image was wrong size' },
            { url: '/products/vintage-azilal', reason: 'JS-rendered gallery, blocked' },
            { url: '/products/wool-overdyed-9x12', reason: 'Multiple ambiguous images' },
          ].map((p) => (
            <div key={p.url} className="flex items-center gap-2.5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-ink text-xs font-bold font-mono truncate">{p.url}</p>
                <p className="text-[#94A3B8] text-[11px] font-medium mt-0.5">{p.reason}</p>
              </div>
              <button className="px-2.5 py-1.5 rounded-md border border-line text-brand text-[11px] font-bold hover:bg-bg transition-colors">Suggest selector</button>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Recommended selector">
        <p className="text-sub text-xs font-medium mb-2.5">Add this CSS selector to your widget configuration to fix detection on this page:</p>
        <div className="rounded-lg bg-ink p-3.5 flex items-center justify-between gap-2.5">
          <span className="flex-1 text-blue-300 text-xs font-mono">.product-gallery img:first-child, [data-product-image] img</span>
          <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
            {copied ? <Check size={12} className="text-green-300" strokeWidth={3} /> : <Copy size={12} color="white" strokeWidth={2.2} />}
            <span className="text-white text-[11px] font-bold">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </Card>

      <Card title="Live detection test" action={<span className="text-brand text-xs font-bold">Try any product URL</span>}>
        <p className="text-sub text-xs font-medium mb-2.5">Paste a product page URL — we'll fetch it and tell you which image we'd use.</p>
        <div className="flex gap-2.5">
          <div className="flex-1 h-11 rounded-lg border border-line bg-white flex items-center gap-2 px-3">
            <Globe size={14} className="text-sub" strokeWidth={2.2} />
            <input
              type="text"
              defaultValue="https://nomadrugs.com/products/moroccan-oatmeal-rug"
              className="flex-1 outline-none text-ink text-[12.5px] font-medium"
            />
          </div>
          <button onClick={runTest} disabled={testing} className={`px-4 h-11 rounded-lg text-white text-[12.5px] font-bold transition-colors ${testing ? 'bg-sub' : 'bg-brand hover:bg-brand-dark'}`}>
            {testing ? 'Testing…' : 'Test detection'}
          </button>
        </div>
        {testing ? (
          <div className="flex items-center gap-3 mt-3.5 p-3.5 rounded-lg bg-bg border border-line">
            <div className="w-7 h-7 rounded-full bg-sub grid place-items-center">
              <Activity size={14} color="white" strokeWidth={2.5} />
            </div>
            <p className="text-sub text-[13px] font-bold">Fetching page and analyzing…</p>
          </div>
        ) : result ? (
          <div className="flex items-center gap-3 mt-3.5 p-3.5 rounded-lg bg-success/10 border border-success/30">
            <div className="w-7 h-7 rounded-full bg-success grid place-items-center">
              <Check size={14} color="white" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-success-dark text-[13px] font-bold">Detected via {result.method} method</p>
              <p className="text-success/80 text-[11.5px] font-medium mt-0.5">Selector: <span className="font-mono">{result.selector}</span></p>
            </div>
            <span className="text-success text-[11px] font-bold">{result.time}</span>
          </div>
        ) : null}
      </Card>
    </>
  );
}

function Billing() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <Kpi label="Monthly room previews" value="1,000" Icon={Eye} />
        <Kpi label="Previews used" value="746" trend="74.6%" Icon={Activity} />
        <Kpi label="Remaining" value="254" Icon={Check} />
        <Kpi label="Renews in" value="11 days" Icon={Clock} />
      </div>
      <Card title="Current plan">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-ink text-lg font-extrabold tracking-tight">Growth · $99 / month</p>
            <p className="text-sub text-[12.5px] font-medium mt-1">1,000 room previews included · Advanced analytics · Priority support</p>
          </div>
          <div className="text-right">
            <p className="text-[#94A3B8] text-[11px] font-semibold">Overage rate</p>
            <p className="text-ink font-extrabold">$0.08 / preview</p>
          </div>
        </div>
      </Card>
    </>
  );
}

function SettingsSec() {
  const { toast } = useContext(Ctx);
  const [accent, setAccent] = useState('#2458F5');
  const [theme, setTheme] = useState('Light');
  const [privacyOn, setPrivacyOn] = useState(true);

  return (
    <>
      <Card title="Brand">
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1">
            <p className="text-ink text-[13px] font-bold">Accent color</p>
            <p className="text-sub text-xs font-medium mt-0.5">Primary color used across all widgets</p>
          </div>
          <div className="flex gap-2">
            {['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'].map((c) => (
              <button key={c} onClick={() => { setAccent(c); toast('Accent color updated'); }} className={`w-7 h-7 rounded-md hover:scale-110 transition-transform ${accent === c ? 'ring-2 ring-offset-2 ring-brand' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="h-px bg-rail my-4" />
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1">
            <p className="text-ink text-[13px] font-bold">Default theme</p>
            <p className="text-sub text-xs font-medium mt-0.5">Light or dark mode for widgets when site preference is unknown</p>
          </div>
          <div className="flex rounded-lg border border-line overflow-hidden">
            {['Light', 'Dark', 'Auto'].map((t, i) => (
              <button key={t} onClick={() => setTheme(t)} className={`px-3.5 py-2 transition-colors ${i < 2 ? 'border-r border-line' : ''} ${theme === t ? 'bg-brand-tint' : 'hover:bg-bg'}`}>
                <span className={`text-xs ${theme === t ? 'text-brand font-bold' : 'text-sub font-semibold'}`}>{t}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Privacy">
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1">
            <p className="text-ink text-[13px] font-bold">Show privacy disclosure in widget</p>
            <p className="text-sub text-xs font-medium mt-0.5">Display a small notice telling shoppers their photo isn't stored</p>
          </div>
          <button onClick={() => setPrivacyOn(!privacyOn)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${privacyOn ? 'bg-brand' : 'bg-line'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${privacyOn ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </Card>
    </>
  );
}
