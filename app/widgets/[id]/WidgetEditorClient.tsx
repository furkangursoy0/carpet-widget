'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Plus, X, AlertTriangle, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { extractHost } from '@/lib/utils';
import type { DbWidget, WidgetFormat, WidgetPosition, ButtonShape, WidgetLanguage } from '@/lib/types';

const LANGUAGES: WidgetLanguage[] = ['English', 'Türkçe', 'Español', 'Français'];
import StorePreview from '@/components/marketing/StorePreview';

const ACCENTS = ['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'];

// Default product-page button label per language. Used to populate
// the field on first set + to auto-translate when the merchant
// switches language IF they haven't already customised the text.
const DEFAULT_BUTTON_LABEL: Record<WidgetLanguage, string> = {
  English: 'See this rug in your room',
  'Türkçe': 'Halıyı odanızda görün',
  'Español': 'Mira esta alfombra en tu habitación',
  'Français': 'Voyez ce tapis chez vous',
};

export default function WidgetEditorClient({ widget }: { widget: DbWidget }) {
  const router = useRouter();

  const [name, setName] = useState(widget.name ?? 'Main widget');
  const [accent, setAccent] = useState(widget.accent_color ?? '#2458F5');
  const [buttonText, setButtonText] = useState(widget.button_text ?? 'See this rug in your room');
  const [borderRadius, setBorderRadius] = useState(widget.border_radius ?? 16);
  const [format, setFormat] = useState<WidgetFormat>(widget.format ?? 'floating-button');
  const [position, setPosition] = useState<WidgetPosition>(widget.position ?? 'bottom-right');
  const [buttonShape, setButtonShape] = useState<ButtonShape>(widget.button_shape ?? 'pill');
  const [status, setStatus] = useState<'active' | 'paused'>(widget.status ?? 'active');
  const [domains, setDomains] = useState<string[]>(widget.allowed_domains ?? []);
  const [newDomain, setNewDomain] = useState('');
  const [customSelector, setCustomSelector] = useState(widget.custom_image_selector ?? '');
  const [language, setLanguage] = useState<WidgetLanguage>(widget.language ?? 'English');
  const [customScript, setCustomScript] = useState(widget.custom_script ?? '');
  const [showAdvanced, setShowAdvanced] = useState(Boolean(widget.custom_image_selector) || Boolean(widget.custom_script));
  const [embedKey, setEmbedKey] = useState(widget.embed_key);
  const [previewState, setPreviewState] = useState<'Default' | 'Open' | 'Result'>('Default');

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const embedSnippet = `<script async\n  src="${process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://app.sceneva.com/widget/widget.js'}"\n  data-sceneva-key="${embedKey}">\n</script>`;

  function setFormatAndPosition(next: WidgetFormat) {
    setFormat(next);
    const valid = next === 'side-tab' ? ['right', 'left'] : ['bottom-right', 'bottom-left'];
    if (!valid.includes(position)) {
      setPosition((next === 'side-tab' ? 'right' : 'bottom-right') as WidgetPosition);
    }
  }

  function addDomain() {
    const host = extractHost(newDomain);
    if (!host) return;
    if (domains.includes(host)) { setNewDomain(''); return; }
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
        name: name.trim() || 'Untitled widget',
        accent_color: accent,
        button_text: buttonText,
        border_radius: borderRadius,
        format,
        position,
        button_shape: buttonShape,
        status,
        allowed_domains: domains,
        custom_image_selector: customSelector.trim() || null,
        language,
        custom_script: customScript.trim() || null,
      })
      .eq('id', widget.id);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
    router.refresh();
  }

  function copy() {
    navigator.clipboard?.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function regenerateKey() {
    if (!confirm('Regenerate widget key? Your old embed code will stop working immediately.')) return;
    setRegenerating(true);
    const res = await fetch(`/api/widgets/${widget.id}/regenerate-key`, { method: 'POST' });
    setRegenerating(false);
    const json = await res.json();
    if (res.ok && json?.embed_key) setEmbedKey(json.embed_key);
  }

  async function deleteWidget() {
    if (!confirm('Delete this widget? Its embed code will stop working immediately.')) return;
    setDeleting(true);
    const res = await fetch(`/api/widgets/${widget.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) router.push('/widgets');
  }

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

  // Adapt to StorePreview's expected string variants
  const previewFormat = format === 'floating-button' ? 'Floating Button' : 'Side Tab';
  const previewFloating = position === 'bottom-left' ? 'Bottom Left' : 'Bottom Right';
  const previewEdge = position === 'left' ? 'Left' : 'Right';
  const previewShape = buttonShape === 'pill' ? 'Pill' : 'Circle';

  const noDomains = domains.length === 0;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/widgets" className="inline-flex items-center gap-1.5 text-sm font-bold text-sub hover:text-ink">
          <ArrowLeft size={14} /> All widgets
        </Link>
        <div className="flex items-center gap-2">
          {savedAt ? <span className="text-xs text-success font-bold">✓ Saved</span> : null}
          <Link
            href={`/widgets/${widget.id}/test`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost h-10 inline-flex items-center gap-1.5 text-xs"
          >
            <ExternalLink size={13} /> Test embed
          </Link>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1fr] gap-5">
        {/* Left: editor */}
        <div className="space-y-5">
          {/* Identity + status */}
          <div className="card p-6 space-y-4">
            <div>
              <label className="label">Widget name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} />
              <p className="help">Internal label — shoppers don't see this.</p>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold mb-0.5">Live on store</p>
                <p className="text-xs text-sub">
                  {status === 'active' ? 'Widget renders for shoppers on authorized domains.' : 'Paused — embed loads but no widget renders.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={status === 'active'}
                onClick={() => setStatus(status === 'active' ? 'paused' : 'active')}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${status === 'active' ? 'bg-brand' : 'bg-line'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${status === 'active' ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="card p-6">
            <h2 className="text-base font-extrabold mb-4">Appearance</h2>
            <div className="space-y-5">
              <div>
                <label className="label">Accent color</label>
                <div className="flex flex-wrap items-center gap-3">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccent(c)}
                      className={`w-10 h-10 rounded-lg grid place-items-center transition-transform hover:scale-110 ${accent === c ? 'ring-4 ring-offset-2 ring-brand/30 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Use ${c}`}
                    >
                      {accent === c ? <Check size={13} color="white" strokeWidth={3} /> : null}
                    </button>
                  ))}
                  {/* Custom color: hidden native picker hooked to a
                      labelled swatch so the field looks like the
                      presets but opens the OS color picker on click.
                      If the chosen value isn't one of the presets we
                      show a checkmark to signal it's the active one. */}
                  <label
                    className={`relative w-10 h-10 rounded-lg border-2 border-dashed border-line bg-white grid place-items-center cursor-pointer hover:border-sub/50 ${!ACCENTS.includes(accent) ? 'ring-4 ring-offset-2 ring-brand/30' : ''}`}
                    style={!ACCENTS.includes(accent) ? { backgroundColor: accent, borderColor: 'transparent' } : undefined}
                    aria-label="Pick a custom color"
                  >
                    {!ACCENTS.includes(accent) ? (
                      <Check size={13} color="white" strokeWidth={3} />
                    ) : (
                      <span className="text-sub text-xl font-semibold leading-none">+</span>
                    )}
                    <input
                      type="color"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-xs text-sub font-semibold ml-1">
                    {ACCENTS.includes(accent) ? 'or pick custom →' : <code className="font-mono">{accent.toUpperCase()}</code>}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Modal language</label>
                <select
                  value={language}
                  onChange={(e) => {
                    const next = e.target.value as WidgetLanguage;
                    // Translate the button label alongside the modal —
                    // but only if it's still the default of the prior
                    // language. A merchant who typed custom copy keeps
                    // it untouched.
                    if (buttonText.trim() === DEFAULT_BUTTON_LABEL[language].trim()) {
                      setButtonText(DEFAULT_BUTTON_LABEL[next]);
                    }
                    setLanguage(next);
                  }}
                  className="input max-w-sm"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <p className="help">Sets both the modal copy and the default button label below.</p>
              </div>

              <div>
                <label className="label">Button label</label>
                <input className="input" value={buttonText} onChange={(e) => setButtonText(e.target.value.slice(0, 40))} maxLength={40} />
                <p className="help">Up to 40 characters. Stays exactly as you type it.</p>
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
                </div>
              ) : null}
            </div>
          </div>

          {/* Authorized domains */}
          <div className="card p-6">
            <h2 className="text-base font-extrabold mb-1">Authorized domains</h2>
            <p className="text-sm text-sub mb-4">This widget only runs on the hostnames below. Each widget has its own list.</p>

            {noDomains ? (
              <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-warn/10 text-warn-ink">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>No domains authorized.</strong> Widget is blocked everywhere until you add a domain (e.g. <code>nomadrugs.com</code>).
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 mb-3">
              {domains.map((d) => (
                <div key={d} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg bg-bg border border-line">
                  <code className="text-sm font-mono">{d}</code>
                  <button onClick={() => removeDomain(d)} aria-label={`Remove ${d}`} className="w-6 h-6 rounded-md grid place-items-center text-sub hover:bg-white hover:text-danger">
                    <X size={13} />
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
                  if (e.key === 'Enter') { e.preventDefault(); addDomain(); }
                }}
              />
              <button onClick={addDomain} disabled={!newDomain.trim()} className="btn-ghost h-11 px-4 inline-flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
            <p className="help mt-2">Subdomains are matched automatically. Add staging hosts here too.</p>
          </div>

          {/* Embed code */}
          <div className="card p-6">
            <h2 className="text-base font-extrabold mb-1">Embed code</h2>
            <p className="text-sm text-sub mb-4">Paste this into your store's theme — before <code className="text-xs bg-bg px-1 py-0.5 rounded">&lt;/body&gt;</code>.</p>
            <div className="rounded-lg bg-ink text-blue-200 p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre relative">
              {embedSnippet}
              <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-rail">
              <p className="text-xs text-sub">Rotate the key when you suspect it leaked. Old key stops working immediately.</p>
              <button onClick={regenerateKey} disabled={regenerating} className="btn-ghost h-9 text-xs">
                {regenerating ? 'Regenerating…' : 'Regenerate key'}
              </button>
            </div>
          </div>

          {/* Advanced */}
          <div className="card p-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h2 className="text-base font-extrabold">Advanced</h2>
                <p className="text-sm text-sub mt-1">Custom product selector and analytics hook script.</p>
              </div>
              <span className="text-sub text-xl">{showAdvanced ? '−' : '+'}</span>
            </button>
            {showAdvanced ? (
              <div className="mt-5 pt-5 border-t border-rail space-y-5">
                <div>
                  <label className="label">Custom product image selector</label>
                  <input
                    className="input font-mono text-sm"
                    value={customSelector}
                    onChange={(e) => setCustomSelector(e.target.value)}
                    placeholder=".my-theme-product-photo img"
                  />
                  <p className="help">Tried before all built-in selectors. Leave empty for auto-detection.</p>
                </div>

                <div>
                  <label className="label">Custom script (analytics hooks)</label>
                  <textarea
                    className="input font-mono text-xs leading-relaxed min-h-[140px]"
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    placeholder={`// Runs once on widget mount with two args: (sceneva, config).\n// Listen for events and forward them to your analytics stack.\nsceneva.on('generated', (e) => {\n  window.dataLayer?.push({ event: 'sceneva_generated', product: e.product.title });\n});`}
                    spellCheck={false}
                  />
                  <p className="help">
                    Events: <code>opened</code>, <code>generated</code>, <code>error</code>, <code>downloaded</code>, <code>shared</code>. Each payload includes <code>{'{product: {title, imageUrl, pageUrl}}'}</code>. Errors in your script are caught and logged — they never break the widget.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Danger zone */}
          <div className="card p-6 border-danger/30">
            <h2 className="text-base font-extrabold mb-1 text-danger">Delete widget</h2>
            <p className="text-sm text-sub mb-4">Removes this widget and invalidates its embed key. Usage events are kept for analytics.</p>
            <button onClick={deleteWidget} disabled={deleting} className="btn-ghost h-10 text-danger border-danger/30 hover:bg-danger/5 inline-flex items-center gap-2">
              <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete this widget'}
            </button>
          </div>
        </div>

        {/* Right: live preview (sticky) */}
        <div>
          <div className="card p-5 sticky top-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-ink text-lg font-extrabold tracking-tight">Live Preview</h3>
                  <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(36,88,245,0.4)]" />
                  <span className="text-sub text-xs font-semibold">Updates as you edit</span>
                </div>
                <p className="text-sub text-xs mt-1.5">Save to apply on your live store (edge cache refreshes within ~5 min).</p>
              </div>
              <button
                onClick={() => setPreviewState((s) => s === 'Default' ? 'Open' : s === 'Open' ? 'Result' : 'Default')}
                className="h-9 rounded-lg border border-line bg-white px-3 text-ink text-xs font-semibold hover:bg-bg flex-shrink-0"
              >
                {previewState} state →
              </button>
            </div>

            <StorePreview
              widgetFormat={previewFormat as any}
              floatingPosition={previewFloating as any}
              floatingShape={previewShape as any}
              floatingRadius={borderRadius}
              sideTabEdge={previewEdge as any}
              accent={accent}
              borderRadius={borderRadius}
              buttonText={buttonText}
              widgetMode={'Light' as any}
              previewState={previewState}
              language={language as any}
              forceInline={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
