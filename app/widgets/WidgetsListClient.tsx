'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ExternalLink, Globe, Pencil } from 'lucide-react';
import type { DbWidget } from '@/lib/types';

export default function WidgetsListClient({ widgets }: { widgets: DbWidget[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createWidget() {
    setCreating(true);
    const res = await fetch('/api/widgets', { method: 'POST', body: JSON.stringify({ name: `Widget ${widgets.length + 1}` }) });
    const json = await res.json();
    setCreating(false);
    if (json?.id) router.push(`/widgets/${json.id}`);
  }

  async function deleteWidget(id: string) {
    if (!confirm('Delete this widget? Its embed code will stop working immediately.')) return;
    setDeletingId(id);
    const res = await fetch(`/api/widgets/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (res.ok) router.refresh();
  }

  if (widgets.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-light grid place-items-center mb-3">
          <Plus size={20} className="text-brand" />
        </div>
        <h2 className="text-base font-extrabold mb-1">No widgets yet</h2>
        <p className="text-sm text-sub mb-5 max-w-sm mx-auto">Create your first widget to get an embed key and start placing it on your store.</p>
        <button onClick={createWidget} disabled={creating} className="btn-primary">
          {creating ? 'Creating…' : 'Create your first widget'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-sub">
          {widgets.length} widget{widgets.length === 1 ? '' : 's'}.
        </p>
        <button onClick={createWidget} disabled={creating} className="btn-primary inline-flex items-center gap-2">
          <Plus size={15} /> {creating ? 'Creating…' : 'New widget'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((w) => (
          <div key={w.id} className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${w.status === 'active' ? 'bg-success' : 'bg-sub'}`}
                    title={w.status}
                  />
                  <h3 className="text-base font-extrabold truncate">{w.name || 'Untitled widget'}</h3>
                </div>
                <p className="text-xs text-sub truncate">
                  {w.format === 'side-tab' ? 'Side tab' : 'Floating button'} · {w.position}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{ backgroundColor: w.accent_color, borderRadius: Math.min(w.border_radius, 16) }}
                title={w.accent_color}
              />
            </div>

            <div className="rounded-lg bg-bg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Globe size={11} className="text-sub" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-sub">Authorized domains</span>
              </div>
              {w.allowed_domains.length === 0 ? (
                <p className="text-xs text-warn-ink font-semibold">None — widget blocked everywhere</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {w.allowed_domains.slice(0, 4).map((d) => (
                    <span key={d} className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-line text-[11px] font-mono">{d}</span>
                  ))}
                  {w.allowed_domains.length > 4 ? (
                    <span className="text-[11px] text-sub font-semibold self-center">+{w.allowed_domains.length - 4}</span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-bg p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sub mb-0.5">Embed key</p>
                  <code className="text-xs font-mono truncate block">{w.embed_key}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <Link href={`/widgets/${w.id}`} className="btn-primary h-10 flex-1 inline-flex items-center justify-center gap-1.5">
                <Pencil size={13} /> Edit
              </Link>
              <button
                onClick={() => deleteWidget(w.id)}
                disabled={deletingId === w.id}
                className="btn-ghost h-10 px-3 inline-flex items-center justify-center"
                aria-label="Delete widget"
              >
                <Trash2 size={14} className="text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
