'use client';

import { LayoutDashboard, Grid2X2, Activity, Target, CreditCard, Settings, ChevronRight } from 'lucide-react';

export default function DashboardTeaser({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="bg-[#F1F5F9] px-8 lg:px-16 py-14 grid lg:grid-cols-[1fr_1.6fr] gap-7 items-center">
      <div>
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">Operator dashboard</p>
        <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">
          One dashboard for every previewed room.
        </h2>
        <p className="text-sub text-sm lg:text-[15px] leading-6 font-semibold mt-3 max-w-[420px]">
          See which rugs shoppers visualize most, how product detection is performing, and where uploads happen. Live data, no spreadsheets.
        </p>
        <button onClick={onOpen} className="mt-5 h-10 px-5 rounded-lg bg-brand text-white text-[13px] font-extrabold hover:bg-brand-dark transition-colors">
          Open dashboard
        </button>
      </div>

      {/* Teaser card */}
      <button
        onClick={onOpen}
        className="rounded-2xl border border-line bg-white overflow-hidden shadow-card hover:shadow-cardHover transition-shadow text-left group"
      >
        <div className="px-4 py-3 border-b border-rail bg-[#FBFCFE] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-line" />
          <div className="w-2 h-2 rounded-full bg-line" />
          <div className="w-2 h-2 rounded-full bg-line" />
          <span className="text-sub text-[10px] font-semibold ml-2">app.sceneva.com / overview</span>
        </div>
        <div className="flex min-h-[280px]">
          <div className="w-[130px] p-3 border-r border-rail flex flex-col gap-1">
            {[
              { Icon: LayoutDashboard, label: 'Overview', active: true },
              { Icon: Grid2X2, label: 'Widgets' },
              { Icon: Activity, label: 'Analytics' },
              { Icon: Target, label: 'Product Detection' },
              { Icon: CreditCard, label: 'Billing' },
              { Icon: Settings, label: 'Settings' },
            ].map(({ Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${active ? 'bg-brand-tint' : ''}`}
              >
                <Icon size={13} className={active ? 'text-brand' : 'text-sub'} strokeWidth={2.2} />
                <span className={`text-[10.5px] ${active ? 'text-brand font-extrabold' : 'text-sub font-semibold'}`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-3">
            <p className="text-ink text-sm font-extrabold">Overview</p>
            <div className="flex gap-2">
              {[
                { label: 'Room previews', value: '1,482', trend: '+12%' },
                { label: 'Unique sessions', value: '938', trend: '+8%' },
                { label: 'Detection success', value: '94.2%', trend: '+2.1%' },
              ].map((k) => (
                <div key={k.label} className="flex-1 rounded-md border border-rail p-2.5">
                  <p className="text-sub text-[9px] font-semibold">{k.label}</p>
                  <p className="text-ink text-sm font-extrabold tracking-tight mt-0.5">{k.value}</p>
                  <p className="text-success text-[9px] font-bold">{k.trend}</p>
                </div>
              ))}
            </div>
            <div className="h-20 flex items-end gap-1 border-t border-rail pt-3">
              {[28, 42, 36, 58, 71, 64, 88, 72, 95, 82, 110, 96].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-brand/85" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-brand text-white text-[11px] font-bold mt-1 group-hover:bg-brand-dark transition-colors">
              Open dashboard
              <ChevronRight size={13} strokeWidth={2.4} />
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
