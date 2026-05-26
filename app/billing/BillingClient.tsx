'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import type { DbSubscription } from '@/lib/types';

export default function BillingClient({
  subscription,
  used,
  limit,
  showWelcome,
}: {
  subscription: DbSubscription | null;
  used: number;
  limit: number;
  showWelcome: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const isActive = subscription?.status === 'active';
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const remaining = Math.max(0, limit - used);

  async function startCheckout() {
    setCreating(true);
    const res = await fetch('/api/checkout', { method: 'POST' });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else { alert('Could not start checkout. Try again or contact hello@sceneva.com.'); setCreating(false); }
  }

  async function openPortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
  }

  return (
    <>
      {showWelcome ? (
        <div className="card p-4 border-success/30 bg-success/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-success grid place-items-center text-white font-extrabold">✓</div>
          <div>
            <p className="font-bold text-sm">Welcome to Sceneva! You're on the Growth plan.</p>
            <p className="text-xs text-sub mt-0.5">1,000 room previews / month included. Manage billing anytime.</p>
          </div>
        </div>
      ) : null}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard label="Monthly room previews" value={formatNumber(limit)} />
        <KpiCard label="Previews used" value={formatNumber(used)} accent={pct > 80 ? 'warn' : undefined} />
        <KpiCard label="Remaining" value={formatNumber(remaining)} />
        <KpiCard label="Renews on" value={subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—'} />
      </div>

      {/* Plan card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-extrabold">Growth plan — $99/month</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-success/10 text-success' : 'bg-bg text-sub'}`}>
                {(subscription?.status ?? 'pending').replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-sub">1,000 room previews / month included · Detection analytics · Email support</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-sub">Overage rate</p>
            <p className="font-extrabold">$0.08 / preview</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-rail">
          {!isActive ? (
            <button onClick={startCheckout} disabled={creating} className="btn-primary">
              {creating ? 'Opening checkout…' : 'Subscribe to Growth — $99/mo'}
            </button>
          ) : (
            <button onClick={openPortal} className="btn-ghost">
              Manage subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage progress */}
      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-3">This billing period</h2>
        <div className="flex items-end justify-between mb-3">
          <p className="text-sub text-sm">
            <strong className="text-ink text-xl font-extrabold">{formatNumber(used)}</strong> of {formatNumber(limit)}
          </p>
          <p className="text-xl font-extrabold">{pct.toFixed(1)}%</p>
        </div>
        <div className="h-2.5 bg-bg rounded-full overflow-hidden">
          <div className={`h-full transition-all ${pct > 90 ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
        </div>
        {pct > 80 ? (
          <p className="text-xs text-warning mt-3">
            ⚠ You've used {pct.toFixed(0)}% of your monthly allowance. Upgrade or contact us about a custom plan.
          </p>
        ) : null}
      </div>
    </>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: 'warn' }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-sub mb-2">{label}</p>
      <p className={`text-2xl font-extrabold tracking-tight ${accent === 'warn' ? 'text-warning' : ''}`}>{value}</p>
    </div>
  );
}
