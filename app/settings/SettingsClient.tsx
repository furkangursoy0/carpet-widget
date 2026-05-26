'use client';

import { useState } from 'react';
import { Copy, Check, X, Plus, AlertTriangle } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import type { DbWidget, WidgetPosition, WidgetFormat, ButtonShape } from '@/lib/types';
import { extractHost } from '@/lib/utils';

const ACCENTS = ['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'];

export default function SettingsClient({ widget, userId }: { widget: DbWidget | null; userId: string }) {
  const [accent, setAccent] = useState(widget?.accent_color ?? '#2458F5');
  const [buttonText, setButtonText] = useState(widget?.button_text ?? 'See this rug in your room');
  const [borderRadius, setBorderRadius] = useState(widget?.border_radius ?? 16);
  const [format, setFormat] = useState<WidgetFormat>((widget?.format as WidgetFormat) ?? 'floating-button');
  const [position, setPosition] = useState<WidgetPosition>((widget?.position as WidgetPosition) ?? 'bottom-right');
  const [buttonShape, setButtonShape] = useState<ButtonShape>((widget?.button_shape as ButtonShape) ?? 'pill');

  // Keep position valid for the chosen format. Geographic order:
  // left option on the left, right option on the right.
  const positionOptions: { value: WidgetPosition; label: string }[] =
    format === 'side-tab'
      ? [
          { value: 'left', label: '← Left edge' },
          { value: 'right', label: '→ Right edge' },
        ]
      : [
          { value: 'bottom-left', label: '↙ Bottom left' },
          { value: 'bottom-right', label: '↘ Bottom right' },
        ];

  function setFormatAndPosition(next: WidgetFormat) {
    setFormat(next);
    // If the current position doesn't belong to the new format, snap to its default.
    const valid = next === 'side-tab' ? ['right', 'left'] : ['bottom-right', 'bottom-left'];
    if (!valid.includes(position)) {
      setPosition((next === 'side-tab' ? 'right' : 'bottom-right') as WidgetPosition);
    }
  }
  const [status, setStatus] = useState<'active' | 'paused'>(widget?.status ?? 'active');
  const [domains, setDomains] = useState<string[]>(widget?.allowed_domains ?? []);
  const [newDomain, setNewDomain] = useState('');
  const [customSelector, setCustomSelector] = useState(widget?.custom_image_selector ?? '');
  const [showAdvanced, setShowAdvanced] = useState(Boolean(widget?.custom_image_selector));

  const [embedKey] = useState(widget?.embed_key ?? '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const embedSnippet = `<script async\n  src="${process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://app.sceneva.com/widget/widget.js'}"\n  data-sceneva-key="${embedKey}">\n</script>`;

  function addDomain() {
    const host = extractHost(newDomain);
    if (!host) return;
    if (domains.includes(host)) {
      setNewDomain('');
      return;
    }
    setDomains([...domains, host]);
    setNewDomain('');
  }

  function removeDomain(d: string) {
    setDomains(domains.filter((x) => x !== d));
  }

  async function save() {
    setSaving(true);
    await getBrowserSupabase()
      .from('widgets')
      .update({
        accent_color: accent,
        button_text: buttonText,
        border_radius: borderRadius,
        format,
        position,
        button_shape: buttonShape,
        status,
        allowed_domains: domains,
        custom_image_selector: customSelector.trim() || null,
      })
      .eq('user_id', userId);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  }

  function copy() {
    navigator.clipboard?.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function regenerateKey() {
    if (!confirm('Regenerate widget key? Your old embed code will stop working immediately.')) return;
    setRegenerating(true);
    const res = await fetch('/api/widget/regenerate-key', { method: 'POST' });
    setRegenerating(false);
    if (res.ok) window.location.reload();
  }

  const noDomains = domains.length === 0;

  return (
    <>
      {/* Status */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold mb-1">Widget status</h2>
            <p className="text-sm text-sub">
              {status === 'active'
                ? 'Live on your store. Shoppers see the floating button on every page where the embed snippet is loaded.'
                : 'Paused. Your embed stays in place but no widget renders for shoppers.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={status === 'active'}
            onClick={() => setStatus(status === 'active' ? 'paused' : 'active')}
            className={`relative w-12 h-7 rounded-full transition-colors ${status === 'active' ? 'bg-brand' : 'bg-line'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${status === 'active' ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Widget appearance</h2>
        <p className="text-sm text-sub mb-5">Change anytime — your live widget updates within ~5 minutes (edge cache).</p>

        <div className="space-y-5">
          <div>
            <label className="label">Accent color</label>
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${accent === c ? 'ring-4 ring-offset-2 ring-brand/30 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Button label</label>
            <input className="input" value={buttonText} onChange={(e) => setButtonText(e.target.value.slice(0, 40))} maxLength={40} />
            <p className="help">Up to 40 characters. This is what shoppers see on the product page.</p>
          </div>

          <div>
            <label className="label">Border radius — {borderRadius}px</label>
            <input
              type="range"
              min={0}
              max={32}
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>

          <div>
            <label className="label">Widget format</label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {(['floating-button', 'side-tab'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormatAndPosition(f)}
                  className={`h-11 rounded-lg border text-sm font-bold transition-colors ${format === f ? 'border-brand bg-brand-light text-brand' : 'border-line text-sub hover:border-rail'}`}
                >
                  {f === 'floating-button' ? '● Floating button' : '▮ Side tab'}
                </button>
              ))}
            </div>
            <p className="help">
              {format === 'side-tab'
                ? 'Vertical tab anchored to a viewport edge. Use it when your bottom-right corner is already taken by a chat widget.'
                : 'Pill button pinned to a bottom corner. Default for most stores.'}
            </p>
          </div>

          <div>
            <label className="label">Position</label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {positionOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPosition(value)}
                  className={`h-11 rounded-lg border text-sm font-bold transition-colors ${position === value ? 'border-brand bg-brand-light text-brand' : 'border-line text-sub hover:border-rail'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {format === 'floating-button' ? (
            <div>
              <label className="label">Button shape</label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {(['pill', 'circle'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setButtonShape(s)}
                    className={`h-11 rounded-lg border text-sm font-bold transition-colors ${buttonShape === s ? 'border-brand bg-brand-light text-brand' : 'border-line text-sub hover:border-rail'}`}
                  >
                    {s === 'pill' ? '▢ Pill (text + icon)' : '● Circle (icon only)'}
                  </button>
                ))}
              </div>
              <p className="help">Circle gives the smallest possible footprint — useful when your bottom corner is crowded.</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rail">
          {savedAt ? <span className="text-xs text-success font-bold">✓ Saved</span> : null}
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Authorized domains */}
      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Authorized domains</h2>
        <p className="text-sm text-sub mb-4">
          Your widget will only run on these hostnames. Anyone copying your embed key onto another site is blocked — this also keeps competitors from burning through your monthly quota.
        </p>

        {noDomains ? (
          <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-warn/10 text-warn-ink">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>No domains authorized.</strong> Your widget is blocked everywhere until you add the domain where you'll install it (e.g. <code>nomadrugs.com</code>).
            </p>
          </div>
        ) : null}

        <div className="space-y-2 mb-4">
          {domains.map((d) => (
            <div key={d} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg">
              <code className="text-sm font-mono">{d}</code>
              <button onClick={() => removeDomain(d)} aria-label={`Remove ${d}`} className="text-sub hover:text-danger">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="nomadrugs.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDomain();
              }
            }}
          />
          <button onClick={addDomain} disabled={!newDomain.trim()} className="btn-ghost h-11 px-4 inline-flex items-center gap-1.5">
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="help mt-2">Subdomains are matched automatically. Add staging hosts (e.g. <code>staging.nomadrugs.com</code>) here too.</p>
      </div>

      {/* Embed code */}
      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Embed code</h2>
        <p className="text-sm text-sub mb-4">Paste this snippet into your store's theme — before <code className="text-xs bg-bg px-1 py-0.5 rounded">&lt;/body&gt;</code>.</p>
        <div className="rounded-lg bg-ink text-blue-200 p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre relative">
          {embedSnippet}
          <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-rail">
          <p className="text-xs text-sub">Need to rotate the key? Old key stops working immediately.</p>
          <button onClick={regenerateKey} disabled={regenerating} className="btn-ghost h-9 text-xs">
            {regenerating ? 'Regenerating…' : 'Regenerate key'}
          </button>
        </div>
      </div>

      {/* Advanced (reusable helpers live at the bottom of the file) */}
      <div className="card p-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <h2 className="text-base font-extrabold">Advanced</h2>
            <p className="text-sm text-sub mt-1">Pin a custom CSS selector for product detection.</p>
          </div>
          <span className="text-sub text-xl">{showAdvanced ? '−' : '+'}</span>
        </button>

        {showAdvanced ? (
          <div className="mt-5 pt-5 border-t border-rail">
            <label className="label">Custom product image selector</label>
            <input
              className="input font-mono text-sm"
              value={customSelector}
              onChange={(e) => setCustomSelector(e.target.value)}
              placeholder=".my-theme-product-photo img"
            />
            <p className="help">
              Sceneva auto-detects on most themes. If your theme uses non-standard markup, pin a CSS selector that points to your product hero image. Tried before all built-in selectors.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

