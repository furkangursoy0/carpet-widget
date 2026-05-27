'use client';

// The merchant-side chapter of the landing page. Lives directly after
// FlowShowcase ("what shoppers see") and mirrors its structure on
// purpose: a chapter kicker, a hero element (the dashboard mockup),
// then four supporting cards (mirroring FlowShowcase's four steps).
//
// Visually unified under a single shared background so it reads as one
// cohesive "for you, the operator" block rather than two floating
// white panels.

import {
  LayoutDashboard, Boxes, CreditCard, Settings,
  ArrowRight,
} from 'lucide-react';

// Dark-themed counterpart to FlowShowcase. The contrast is intentional:
// the shopper chapter lives in daylight (light grey), the operator
// chapter feels like the "control room" — same family, opposite mood.
// The dashboard mockup stays white so it reads as a screenshot of the
// real product spotlit against the dark surface.
export default function OperatorConsole({ onPricing }: { onPricing: () => void }) {
  return (
    <section className="bg-[#0B1220] px-8 lg:px-16 py-12 relative overflow-hidden">
      {/* Soft brand-tinted radial glow up top so the dark slab has
          some atmosphere instead of reading as flat black. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[260px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(36,88,245,0.22) 0%, rgba(36,88,245,0.06) 40%, transparent 75%)',
        }}
      />
      <div className="max-w-[1280px] mx-auto">

      {/* Chapter header — same structure as FlowShowcase but inverted
          colours so the two chapters read as a series. */}
      <div className="relative text-center mb-8 max-w-2xl mx-auto">
        <p className="text-[#7AA0FF] text-[11px] font-extrabold uppercase tracking-tight mb-3">
          For you · The operator console
        </p>
        <h2 className="text-white text-3xl lg:text-4xl font-bold tracking-tight">
          Live numbers, real controls, no spreadsheets.
        </h2>
        <p className="text-[#94A3B8] text-base leading-[1.55] font-medium mt-4">
          One dashboard for every previewed room — who saw what, where, and what it converted to. Tune the widget without touching code.
        </p>
      </div>

      {/* Hero element: the dashboard mockup. Stays white so it spotlights
          against the dark surface, reading as a real product screenshot. */}
      <div className="relative mx-auto max-w-5xl">
        <DashboardMockup />
      </div>

      {/* CTA flows the visitor down to pricing, the next logical
          question once they've seen the product surfaces. */}
      <div className="relative mt-8 flex justify-center">
        <button
          onClick={onPricing}
          className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-extrabold shadow-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
        >
          See pricing
          <ArrowRight size={16} strokeWidth={2.4} />
        </button>
      </div>
      </div>
    </section>
  );
}

// Browser-framed dashboard preview — purely visual on the public
// landing (no click handler). Real merchants get the live dashboard
// after they sign up; here we just show what they'll be working in.
function DashboardMockup() {
  return (
    <div
      aria-hidden
      className="w-full rounded-2xl border border-line bg-white overflow-hidden shadow-card block"
    >
      {/* Browser chrome */}
      <div className="px-4 py-3 border-b border-rail bg-[#FBFCFE] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FCA5A5]" />
        <div className="w-2 h-2 rounded-full bg-[#FCD34D]" />
        <div className="w-2 h-2 rounded-full bg-[#86EFAC]" />
        <span className="text-sub text-[10px] font-semibold ml-2">app.sceneva.com / overview</span>
      </div>

      <div className="flex min-h-[300px]">
        {/* Sidebar */}
        <div className="w-[150px] p-2.5 border-r border-rail flex flex-col gap-0.5">
          <p className="text-sub text-[9px] font-extrabold tracking-wider uppercase px-2 mb-1.5">Nomad Rugs</p>
          {/* Mirror the real DashShell nav so the mock doesn't promise
              pages we don't ship (the prior "Analytics" / "Detection"
              tabs didn't exist). */}
          {[
            { Icon: LayoutDashboard, label: 'Overview', active: true },
            { Icon: Boxes,          label: 'Widgets' },
            { Icon: Settings,       label: 'Settings' },
            { Icon: CreditCard,     label: 'Billing' },
          ].map(({ Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${active ? 'bg-brand-tint' : ''}`}
            >
              <Icon size={13} className={active ? 'text-brand' : 'text-sub'} strokeWidth={2.2} />
              <span className={`text-[11px] ${active ? 'text-brand font-extrabold' : 'text-sub font-semibold'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 p-4 space-y-3">
          {/* Title + period toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink text-base font-extrabold">Overview</p>
              <p className="text-sub text-[10px] font-semibold">Last 30 days</p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-line p-0.5">
              <span className="text-sub text-[9px] font-bold px-2 py-1">7d</span>
              <span className="text-ink text-[9px] font-extrabold bg-bg rounded px-2 py-1">30d</span>
              <span className="text-sub text-[9px] font-bold px-2 py-1">90d</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Room previews',     value: '1,482',  trend: '+12%' },
              { label: 'Unique sessions',   value: '938',    trend: '+8%' },
              { label: 'Detection success', value: '94.2%',  trend: '+2.1%' },
            ].map((k) => (
              <div key={k.label} className="rounded-md border border-rail p-3 bg-white">
                <p className="text-sub text-[9px] font-semibold">{k.label}</p>
                <p className="text-ink text-base font-extrabold tracking-tight mt-1">{k.value}</p>
                <p className="text-success text-[9px] font-bold mt-0.5">{k.trend}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-md border border-rail bg-white p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-ink text-[11px] font-extrabold">Previews per day</p>
              <span className="text-sub text-[9px] font-semibold">peak Tue · 110</span>
            </div>
            <div className="h-16 flex items-end gap-1.5">
              {[28, 42, 36, 58, 71, 64, 88, 72, 95, 82, 110, 96, 78, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, backgroundColor: i === 10 ? '#2458F5' : 'rgba(36,88,245,0.55)' }}
                />
              ))}
            </div>
          </div>

          {/* Recent activity strip */}
          <div className="rounded-md border border-rail bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-rail">
              <p className="text-ink text-[11px] font-extrabold">Recent activity</p>
              <span className="text-sub text-[9px] font-semibold">live</span>
            </div>
            <div className="divide-y divide-rail">
              {[
                { type: 'generated',  product: 'Moroccan Oatmeal', device: 'desktop', when: '2m ago' },
                { type: 'downloaded', product: 'Vintage Persian',   device: 'mobile',  when: '7m ago' },
                { type: 'generated',  product: 'Berber Cream',      device: 'desktop', when: '12m ago' },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: row.type === 'downloaded' ? '#16A34A' : '#2458F5' }}
                  />
                  <span className="text-ink text-[10.5px] font-bold capitalize w-[78px]">{row.type}</span>
                  <span className="text-sub text-[10.5px] font-medium flex-1 truncate">{row.product} · {row.device}</span>
                  <span className="text-sub text-[10px] font-semibold">{row.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
