'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { defaultAllowedDomains } from '@/lib/utils';
import StorePreview from '@/components/marketing/StorePreview';

const ACCENTS = ['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'];

type Format = 'floating-button' | 'side-tab';
type FloatingPos = 'bottom-right' | 'bottom-left';
type SideEdge = 'right' | 'left';
type Shape = 'pill' | 'circle';

export default function OnboardingClient({
  initialBrandName,
  initialStoreUrl,
  embedKey,
}: {
  initialBrandName: string;
  initialStoreUrl: string;
  embedKey: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [brandName, setBrandName] = useState(initialBrandName);
  const [storeUrl, setStoreUrl] = useState(initialStoreUrl);

  // Widget customization (mirrors the widgets table columns)
  const [format, setFormat] = useState<Format>('floating-button');
  const [floatingPos, setFloatingPos] = useState<FloatingPos>('bottom-right');
  const [sideEdge, setSideEdge] = useState<SideEdge>('right');
  const [buttonShape, setButtonShape] = useState<Shape>('pill');
  const [accent, setAccent] = useState('#2458F5');
  const [borderRadius, setBorderRadius] = useState(16);
  const [buttonText, setButtonText] = useState('See this rug in your room');
  const [previewState, setPreviewState] = useState<'Default' | 'Open' | 'Result'>('Default');

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<script async\n  src="${process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://app.sceneva.com/widget/widget.js'}"\n  data-sceneva-key="${embedKey}">\n</script>`;

  async function saveStoreStep() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ brand_name: brandName, store_url: storeUrl }).eq('id', user.id);
      const domains = defaultAllowedDomains(storeUrl);
      if (domains.length) {
        await supabase.from('widgets').update({ allowed_domains: domains }).eq('user_id', user.id);
      }
    }
    setSaving(false);
    setStep(2);
  }

  async function saveCustomizeStep() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const position = format === 'floating-button' ? floatingPos : sideEdge;
      await supabase
        .from('widgets')
        .update({
          format,
          position,
          accent_color: accent,
          border_radius: borderRadius,
          button_text: buttonText,
          button_shape: buttonShape,
        })
        .eq('user_id', user.id);
    }
    setSaving(false);
    setStep(3);
  }

  async function finish() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ onboarded: true }).eq('id', user.id);
    }
    router.push('/billing');
    router.refresh();
  }

  // "Skip for now" sends the merchant straight to the dashboard. We
  // still mark onboarded=true (so they aren't bounced back here), and
  // their widget row already exists — they can finish customising any
  // time from /widgets and they can subscribe from /billing when ready.
  async function skip() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ onboarded: true }).eq('id', user.id);
    }
    router.push('/overview');
    router.refresh();
  }

  function copyEmbed() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  // StorePreview expects the marketing-style enum strings
  const previewFormat = format === 'floating-button' ? 'Floating Button' : 'Side Tab';
  const previewFloating = floatingPos === 'bottom-right' ? 'Bottom Right' : 'Bottom Left';
  const previewEdge = sideEdge === 'right' ? 'Right' : 'Left';
  const previewShape = buttonShape === 'pill' ? 'Pill' : 'Circle';

  const wideStep = step === 2;

  return (
    <main className="min-h-screen px-6 py-10 bg-bg">
      <div className={`${wideStep ? 'max-w-6xl' : 'max-w-2xl'} mx-auto`}>
        {/* Top bar: brand + escape hatch. We don't trap merchants in
            onboarding — they can finish any of these steps later from
            /settings, /widgets, and /billing. */}
        <div className="flex items-center justify-end mb-6">
          <button
            type="button"
            onClick={skip}
            disabled={saving}
            className="text-xs font-bold text-sub hover:text-ink transition-colors disabled:opacity-50"
          >
            Skip for now →
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">Sceneva</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Set up your widget</h1>
          <p className="text-sm text-sub mt-1">3 quick steps. Less than a minute. You can finish later from your dashboard.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-extrabold transition-colors ${step >= (s as 1 | 2 | 3) ? 'bg-brand text-white' : 'bg-line text-sub'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 ? <div className={`w-12 h-px ${step > s ? 'bg-brand' : 'bg-line'}`} /> : null}
            </div>
          ))}
        </div>

        {/* Step 1 — store details */}
        {step === 1 ? (
          <div className="card p-7 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold">Tell us about your store</h2>
              <p className="text-sm text-sub mt-1">We use this on the widget header and analytics.</p>
            </div>
            <div>
              <label className="label">Brand name</label>
              <input className="input" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Nomad Rugs" />
            </div>
            <div>
              <label className="label">Store URL</label>
              <input className="input" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://nomadrugs.com" />
              <p className="help">The base URL of your shop. We lock your widget to this domain so nobody else can use your embed key — you can add more (staging, subdomains) later in Settings.</p>
            </div>
            <button className="btn-primary h-11 w-full" onClick={saveStoreStep} disabled={saving || !brandName || !storeUrl}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        ) : null}

        {/* Step 2 — customize (full builder, side-by-side preview) */}
        {step === 2 ? (
          <div className="grid lg:grid-cols-[0.86fr_1.08fr] gap-5">
            {/* Left: form */}
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold">Customize how it looks</h2>
                <p className="text-sm text-sub mt-1">Every change reflects in the live preview.</p>
              </div>

              <Field label="Widget format">
                <Segmented
                  items={[
                    { value: 'floating-button', label: 'Floating Button' },
                    { value: 'side-tab', label: 'Side Tab' },
                  ]}
                  selected={format}
                  onSelect={(v) => setFormat(v as Format)}
                />
              </Field>

              {format === 'floating-button' ? (
                <>
                  <Field label="Position">
                    <Segmented
                      items={[
                        { value: 'bottom-left', label: 'Bottom Left' },
                        { value: 'bottom-right', label: 'Bottom Right' },
                      ]}
                      selected={floatingPos}
                      onSelect={(v) => setFloatingPos(v as FloatingPos)}
                    />
                  </Field>
                  <Field label="Button shape" help="Circle = icon only. Use when your bottom corner already has a chat widget.">
                    <Segmented
                      items={[
                        { value: 'pill', label: 'Pill' },
                        { value: 'circle', label: 'Circle' },
                      ]}
                      selected={buttonShape}
                      onSelect={(v) => setButtonShape(v as Shape)}
                    />
                  </Field>
                </>
              ) : (
                <Field label="Edge" help="Vertical tab anchored to the chosen viewport edge.">
                  <Segmented
                    items={[
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                    ]}
                    selected={sideEdge}
                    onSelect={(v) => setSideEdge(v as SideEdge)}
                  />
                </Field>
              )}

              <Field label="Accent color">
                <div className="flex flex-wrap items-center gap-3">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      className={`w-[38px] h-[38px] rounded-lg grid place-items-center transition-transform hover:scale-110 ${accent === c ? 'ring-4 ring-offset-2 ring-brand/30 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    >
                      {accent === c ? <Check size={14} color="white" strokeWidth={3} /> : null}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = accent;
                      input.addEventListener('input', (e: any) => setAccent(e.target.value));
                      input.click();
                    }}
                    className="w-[38px] h-[38px] rounded-lg border-2 border-dashed border-line bg-white grid place-items-center text-sub text-xl font-semibold hover:border-sub/50"
                  >+</button>
                </div>
              </Field>

              <Slider label="Border radius" value={borderRadius} min={0} max={32} unit="px" accent={accent} onChange={setBorderRadius} />

              <Field label="Button label" help="Up to 40 characters — change it whenever, no redeploy needed.">
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value.slice(0, 40))}
                  maxLength={40}
                  placeholder="See this rug in your room"
                  className="input"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button className="btn-ghost h-11" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary h-11 flex-1" onClick={saveCustomizeStep} disabled={saving}>
                  {saving ? 'Saving…' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Right: preview */}
            <div className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-ink text-lg font-extrabold tracking-tight">Live Preview</h3>
                    <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(36,88,245,0.4)]" />
                    <span className="text-sub text-xs font-semibold">Updates as you edit</span>
                  </div>
                  <p className="text-sub text-xs leading-[18px] font-medium mt-1.5">
                    Exactly how the widget renders on your product page.
                  </p>
                </div>
                <button
                  onClick={() => setPreviewState((s) => s === 'Default' ? 'Open' : s === 'Open' ? 'Result' : 'Default')}
                  className="h-9 rounded-lg border border-line bg-white px-3 text-ink text-xs font-semibold hover:bg-bg"
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
                language={'English' as any}
                forceInline={false}
              />
            </div>
          </div>
        ) : null}

        {/* Step 3 — embed code */}
        {step === 3 ? (
          <div className="card p-7 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold">Your embed code</h2>
              <p className="text-sm text-sub mt-1">Paste this once into your store's theme — before the closing &lt;/body&gt; tag.</p>
            </div>
            <div className="rounded-lg bg-ink text-blue-200 p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
              {embedSnippet}
            </div>
            <button onClick={copyEmbed} className="btn-ghost h-10 w-full">
              {copied ? '✓ Copied' : 'Copy embed code'}
            </button>
            <div className="text-xs text-sub bg-bg rounded-lg p-3 leading-relaxed">
              <strong className="text-ink">Tip:</strong> On Shopify, go to <em>Online Store → Themes → Edit code → theme.liquid</em> and paste before <code>&lt;/body&gt;</code>. See our <a href="/docs/install-shopify" className="text-brand underline">Shopify install guide</a>.
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-ghost h-11" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary h-11 flex-1" onClick={finish} disabled={saving}>
                {saving ? 'Finishing…' : 'Go to dashboard →'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

// ─── helpers ───────────────────────────────────────────────────────

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-ink text-xs font-bold">{label}</p>
      {children}
      {help ? <p className="text-sub text-xs leading-[18px] font-medium">{help}</p> : null}
    </div>
  );
}

function Segmented<T extends string>({ items, selected, onSelect }: { items: { value: T; label: string }[]; selected: T; onSelect: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-line overflow-hidden bg-white">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={`flex-1 h-[42px] flex items-center justify-center gap-2 border-r border-line last:border-r-0 transition-colors ${
            selected === item.value ? 'bg-brand-tint' : 'hover:bg-bg'
          }`}
        >
          <span className={`text-[13px] tracking-tight ${selected === item.value ? 'text-brand-ink font-bold' : 'text-sub font-semibold'}`}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, unit = '', accent, onChange }: { label: string; value: number; min: number; max: number; unit?: string; accent: string; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-ink text-xs font-bold">{label}</p>
        <span className="text-[#334155] text-xs font-bold">{value}{unit}</span>
      </div>
      <div className="relative h-[22px] flex items-center">
        <div className="relative h-1.5 w-full rounded-full bg-line">
          <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
          <div className="absolute top-[-5px] w-4 h-4 rounded-full border-2 border-white" style={{ left: `${pct}%`, backgroundColor: accent, transform: 'translateX(-50%)' }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
