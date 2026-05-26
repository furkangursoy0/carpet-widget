'use client';

import { useState } from 'react';
import {
  Box, Check, Globe, HelpCircle, Monitor, Copy, ArrowRight, ShieldCheck, X, Plus,
} from 'lucide-react';
import StorePreview from './StorePreview';

const ACCENT_COLORS = ['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'];

// Single-page widget builder: a merchant scrolls through one short
// form (URL → customize → embed). No accordion, no step indicators —
// every setting is in front of them at once. The right pane mirrors
// changes live as the merchant edits.
export default function WidgetBuilderShowcase({ onDemo, initialUrl = '' }: { onDemo: () => void; initialUrl?: string }) {
  // Site
  const [storeUrl, setStoreUrl] = useState(initialUrl);

  // Customize
  const [widgetFormat, setWidgetFormat] = useState<'Floating Button' | 'Side Tab'>('Floating Button');
  const [floatingPosition, setFloatingPosition] = useState<'Bottom Left' | 'Bottom Right'>('Bottom Right');
  const [sideTabEdge, setSideTabEdge] = useState<'Left' | 'Right'>('Right');
  const [buttonShape, setButtonShape] = useState<'Pill' | 'Circle'>('Pill');
  const [accent, setAccent] = useState('#2458F5');
  const [borderRadius, setBorderRadius] = useState(16);
  const [buttonText, setButtonText] = useState('See this rug in your room');

  // Preview state — cycles through the three flow stages
  const [previewState, setPreviewState] = useState<'Default' | 'Open' | 'Result'>('Default');

  // Embed reveal — only after the merchant clicks "Add it to your store"
  const [embedRevealed, setEmbedRevealed] = useState(false);

  const embedCode = `<script async\n  src="https://app.sceneva.com/widget/widget.js"\n  data-sceneva-key="rug-visualiser-7d9f2c">\n</script>`;
  const storeReady = storeUrl.trim().length > 0;

  return (
    <section className="bg-[#F4F7FC] border-y border-[#EBF0F7] px-6 py-8">
      {/* Brand row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-[46px] h-[46px] rounded-xl bg-brand grid place-items-center shadow-brand">
            <Box size={24} color="white" strokeWidth={2.4} />
          </div>
          <h2 className="text-ink text-2xl font-extrabold tracking-tight">AI Rug Visualiser</h2>
          <span className="rounded-md bg-brand-tint text-brand-ink px-3 py-1.5 text-xs font-bold">Widget Builder</span>
        </div>
        <a href="/docs/customize-widget" className="flex items-center gap-1.5 text-brand text-[13px] font-bold hover:text-brand-dark">
          <HelpCircle size={17} strokeWidth={2.3} />
          Help & Docs
        </a>
      </div>

      <div className="grid lg:grid-cols-[0.86fr_1.08fr] gap-5">
        {/* ── Left: single-page builder ───────────────────────────── */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card space-y-7">
          {/* 1 · Store URL */}
          <Section>
            <SectionHeader title="Where will the widget live?" subtitle="The URL of your store — we'll lock the widget to this domain so nobody can steal your embed key and burn through your quota." />
            <div className="flex items-center gap-2.5">
              <Globe size={16} className="text-sub flex-shrink-0" strokeWidth={2.2} />
              <input
                type="text"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="nomadrugs.com"
                className="flex-1 min-h-11 rounded-lg border border-line bg-white px-3 text-ink text-[14px] font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>
          </Section>

          {/* 2 · Customize — only enabled after URL is set, but always visible */}
          <Section dimmed={!storeReady}>
            <SectionHeader title="Customize how it looks" subtitle="Every change reflects in the live preview on the right." />

            <FieldLabel>Widget format</FieldLabel>
            <Segmented
              items={['Floating Button', 'Side Tab']}
              selected={widgetFormat}
              onSelect={setWidgetFormat}
            />

            {widgetFormat === 'Floating Button' ? (
              <>
                <FieldLabel>Position</FieldLabel>
                <Segmented
                  items={['Bottom Left', 'Bottom Right']}
                  selected={floatingPosition}
                  onSelect={setFloatingPosition}
                />

                <FieldLabel>Button shape</FieldLabel>
                <Segmented
                  items={['Pill', 'Circle']}
                  selected={buttonShape}
                  onSelect={setButtonShape}
                />
                <p className="text-sub text-xs leading-[18px] font-medium">
                  Circle = icon only. Useful when your bottom corner is already taken by a chat widget.
                </p>
              </>
            ) : (
              <>
                <FieldLabel>Edge</FieldLabel>
                <Segmented
                  items={['Left', 'Right']}
                  selected={sideTabEdge}
                  onSelect={setSideTabEdge}
                />
                <p className="text-sub text-xs leading-[18px] font-medium">
                  Vertical tab anchored to the chosen viewport edge.
                </p>
              </>
            )}

            <FieldLabel>Accent color</FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              {ACCENT_COLORS.map((c) => (
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
                className="w-[38px] h-[38px] rounded-lg border-2 border-dashed border-[#CBD5E1] bg-white grid place-items-center text-sub text-xl font-semibold hover:border-sub/50"
              >+</button>
            </div>

            <Slider label="Border radius" value={borderRadius} min={0} max={32} unit="px" accent={accent} onChange={setBorderRadius} />

            <FieldLabel>Button label</FieldLabel>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value.slice(0, 40))}
              maxLength={40}
              placeholder="See this rug in your room"
              className="w-full min-h-11 rounded-lg border border-line bg-white px-3 text-ink text-[13.5px] font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <p className="text-sub text-xs leading-[18px] font-medium">
              Up to 40 characters — change it whenever, no redeploy needed.
            </p>
          </Section>

          {/* 3 · Add to your store */}
          <Section>
            {embedRevealed ? (
              <>
                <SectionHeader title="Paste this on your store" subtitle="One line, right before the closing </body> tag in your theme." />
                <EmbedBlock code={embedCode} />
                <a href="/docs/install-shopify" className="inline-flex items-center gap-1.5 text-brand text-xs font-bold hover:text-brand-dark mt-1">
                  Open install guide <ArrowRight size={13} strokeWidth={2.3} />
                </a>
              </>
            ) : (
              <>
                <SectionHeader title="Add it to your store" subtitle="When you're happy with the look, grab the embed code and paste it in your theme." />
                <button
                  onClick={() => setEmbedRevealed(true)}
                  disabled={!storeReady}
                  className="w-full h-12 rounded-lg bg-brand text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-brand hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {storeReady ? 'Get my embed code' : 'Enter your store URL first'}
                  {storeReady ? <ArrowRight size={16} strokeWidth={2.4} /> : null}
                </button>
              </>
            )}
          </Section>
        </div>

        {/* ── Right: live preview ─────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-ink text-xl font-extrabold tracking-tight">Live Preview</h3>
                <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(36,88,245,0.4)]" />
                <span className="text-sub text-xs font-semibold">Updates as you edit</span>
              </div>
              <p className="text-sub text-xs leading-[18px] font-medium mt-1.5">
                This is exactly how the widget renders on your product page.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="h-9 rounded-lg border border-line bg-white px-3 flex items-center gap-2 hover:bg-bg">
                <Monitor size={14} className="text-ink" strokeWidth={2.1} />
                <span className="text-ink text-xs font-semibold">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewState((s) => s === 'Default' ? 'Open' : s === 'Open' ? 'Result' : 'Default')}
                className="h-9 rounded-lg border border-line bg-white px-3 flex items-center gap-2 hover:bg-bg"
              >
                <span className="text-ink text-xs font-semibold">{previewState} state</span>
                <ArrowRight size={13} className="text-sub" strokeWidth={2.3} />
              </button>
            </div>
          </div>

          <StorePreview
            widgetFormat={widgetFormat}
            floatingPosition={floatingPosition}
            floatingShape={buttonShape}
            floatingRadius={borderRadius}
            sideTabEdge={sideTabEdge}
            accent={accent}
            borderRadius={borderRadius}
            buttonText={buttonText}
            widgetMode={'Light'}
            previewState={previewState}
            language={'English'}
            forceInline={false}
          />
        </div>
      </div>
    </section>
  );
}

// ───── Layout helpers ───────────────────────────────────────────────

function Section({ children, dimmed }: { children: React.ReactNode; dimmed?: boolean }) {
  return (
    <div className={`space-y-3.5 ${dimmed ? 'opacity-60 pointer-events-none select-none' : ''}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-ink text-lg font-extrabold tracking-tight">{title}</h3>
      <p className="text-sub text-[13px] leading-[19px] font-medium">{subtitle}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-ink text-xs font-bold mt-1">{children}</p>;
}

function Segmented({ items, selected, onSelect }: { items: string[]; selected: string; onSelect: (v: any) => void }) {
  return (
    <div className="flex rounded-lg border border-line overflow-hidden bg-white">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`flex-1 h-[42px] flex items-center justify-center gap-2 border-r border-line last:border-r-0 transition-colors ${
            selected === item ? 'bg-brand-tint' : 'hover:bg-bg'
          }`}
        >
          <span className={`text-[13px] tracking-tight ${selected === item ? 'text-brand-ink font-bold' : 'text-sub font-semibold'}`}>{item}</span>
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
        <FieldLabel>{label}</FieldLabel>
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

function EmbedBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-lg border border-line bg-[#F7FAFD] p-3.5 relative">
      <pre className="text-brand text-[11.5px] leading-[18px] font-mono whitespace-pre-wrap pr-28">{code}</pre>
      <button onClick={copy} className="absolute right-3 bottom-3 h-8 rounded-md border border-line bg-white flex items-center gap-1.5 px-3 hover:bg-bg shadow-sm">
        {copied ? <Check size={13} className="text-success" strokeWidth={2.5} /> : <Copy size={13} className="text-ink" strokeWidth={2.2} />}
        <span className="text-ink text-[11px] font-bold">{copied ? 'Copied' : 'Copy code'}</span>
      </button>
    </div>
  );
}
