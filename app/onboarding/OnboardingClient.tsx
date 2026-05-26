'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { defaultAllowedDomains } from '@/lib/utils';

const ACCENTS = ['#2458F5', '#0EA5A4', '#7C3AED', '#F15A24', '#E9306A', '#0F172A'];

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
  const [accent, setAccent] = useState('#2458F5');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<script async\n  src="${process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://app.sceneva.com/widget/widget.js'}"\n  data-sceneva-key="${embedKey}">\n</script>`;

  async function saveStoreStep() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ brand_name: brandName, store_url: storeUrl }).eq('id', user.id);
      // Auto-populate the widget's authorized-domains list from store_url
      // so the merchant doesn't have to set it manually before going live.
      const domains = defaultAllowedDomains(storeUrl);
      if (domains.length) {
        await supabase.from('widgets').update({ allowed_domains: domains }).eq('user_id', user.id);
      }
    }
    setSaving(false);
    setStep(2);
  }

  async function saveAccentStep() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('widgets').update({ accent_color: accent }).eq('user_id', user.id);
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
    // Send new users to billing first so they subscribe before going live.
    // After successful Lemon checkout, they bounce back to /billing?welcome=1
    // which then offers a clear path into /overview.
    router.push('/billing');
    router.refresh();
  }

  function copyEmbed() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">Sceneva</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Set up your widget</h1>
          <p className="text-sm text-sub mt-1">3 quick steps. Less than a minute.</p>
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

        {/* Step 2 — accent color */}
        {step === 2 ? (
          <div className="card p-7 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold">Pick your accent color</h2>
              <p className="text-sm text-sub mt-1">Used for the widget button, modal CTA, and badges. Change anytime.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className={`w-12 h-12 rounded-xl transition-all hover:scale-105 ${accent === c ? 'ring-4 ring-offset-2 ring-brand/30 scale-105' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-ghost h-11" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary h-11 flex-1" onClick={saveAccentStep} disabled={saving}>
                {saving ? 'Saving…' : 'Continue'}
              </button>
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
