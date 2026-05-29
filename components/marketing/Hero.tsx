'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe, Sparkles, Search, ShoppingBag, User, Truck, ShieldCheck, RefreshCcw, Heart, Download, Share2 } from 'lucide-react';
import BeforeAfterCompare from './BeforeAfterCompare';

// Platform tiles live in the hero now — they're a discovery surface
// ("works where I sell"), not a credibility footnote. Each tile gets
// the platform's brand tint as its background so the row reads as
// real logos at a glance, and each one links to its install guide.
// Each tile's background is chosen for legibility against its logo:
// brand tints where the logo holds up (Shopify green, Webflow blue),
// neutral white for full-color marks on dark tones (WooCommerce, Wix),
// and dark navy for our generic "Custom" tile.
const PLATFORMS = [
  { name: 'Custom',      href: '/docs/install-custom',      bg: '#0F172A', kind: 'custom'  as const },
  { name: 'Shopify',     href: '/docs/install-shopify',     bg: '#E8F5DC', kind: 'shopify' as const },
  { name: 'WooCommerce', href: '/docs/install-woocommerce', bg: '#F4ECFB', kind: 'woo'     as const },
  { name: 'Wix',         href: '/docs/install-custom',      bg: '#FFFFFF', kind: 'wix'     as const },
  { name: 'Webflow',     href: '/docs/install-custom',      bg: '#146EF5', kind: 'webflow' as const },
];

export default function Hero({ onDemo, onCustomize }: { onDemo: () => void; onCustomize: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState('');

  function start() {
    // Carry the typed store URL through to signup → onboarding,
    // so we can prefill it instead of asking again.
    const trimmed = url.trim();
    router.push(trimmed ? `/signup?url=${encodeURIComponent(trimmed)}` : '/signup');
  }

  return (
    <section className="px-8 lg:px-16 pt-10 pb-16">
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
      {/* Left column — kept tight. Privacy promise, platform list, and
          feature checks moved into ProofStrip / FeaturesGrid so this
          area stays scannable. */}
      <div className="max-w-[540px]">
        <h1 className="text-ink text-[42px] lg:text-[64px] leading-[1.02] font-bold tracking-tight">
          Let shoppers visualize before they buy.
        </h1>
        <p className="text-sub text-base leading-[1.55] font-medium mt-5">
          One line of code. Shoppers upload a room photo and see your rug in it — before they add to cart.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); start(); }}
          className="mt-7 flex flex-col sm:flex-row gap-2.5 max-w-[480px]"
        >
          <label className="flex-1 h-12 rounded-lg bg-white border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 flex items-center gap-2.5 px-3.5">
            <Globe size={16} className="text-sub flex-shrink-0" strokeWidth={2.2} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="your-store.com"
              aria-label="Your store URL"
              className="flex-1 h-full bg-transparent outline-none text-ink text-[14px] font-medium placeholder:text-sub/60"
            />
          </label>
          <button
            type="submit"
            className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-extrabold shadow-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Add to my store
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </form>

        <button
          onClick={onDemo}
          className="mt-3 inline-flex items-center gap-1.5 text-sub text-[13px] font-bold hover:text-ink transition-colors"
        >
          <Sparkles size={13} strokeWidth={2.4} />
          Or try the 30-second live demo
        </button>

        <PlatformRow />
      </div>

      <HeroMockup />
      </div>
    </section>
  );
}

// Hero visual = vertical two-shot story.
//   1) Store mockup — text stays minimal but the frame is visually dense
//      with real e-commerce furniture (icon nav, thumb rail, color
//      swatches, size pills, trust badges) so it doesn't look empty.
//   2) Modal — actually small (right-aligned, ~70% of store width) so
//      the popup reads as a popup, not the whole picture.
function HeroMockup() {
  const accent = '#2458F5';
  return (
    <div className="relative flex flex-col gap-5">
      {/* ── 1. Store mockup ─────────────────────────────────────── */}
      <div>
        <div className="h-6 rounded-t-xl border border-b-0 border-line bg-[#FFFDFC] flex items-center px-3 gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FCA5A5]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FCD34D]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#86EFAC]" />
          <div className="ml-2 h-3 flex-1 max-w-[260px] rounded bg-bg" />
        </div>

        <div className="relative rounded-b-xl border border-t-0 border-line bg-white shadow-card overflow-hidden">
          {/* Nav: brand + icon-only actions (no nav text labels) */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-line">
            <p className="text-ink text-[11px] font-extrabold tracking-[0.3em]">NOMAD RUGS</p>
            <div className="flex items-center gap-3.5">
              <Search size={13} className="text-ink" strokeWidth={2.1} />
              <User size={13} className="text-ink" strokeWidth={2.1} />
              <div className="relative">
                <ShoppingBag size={13} className="text-ink" strokeWidth={2.1} />
                <span className="absolute -right-1.5 -top-1 min-w-[12px] h-3 px-1 rounded-full bg-ink text-white text-[7px] font-extrabold leading-3 text-center">2</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3.5 px-5 py-5">
            {/* Thumb rail — extended so the column matches the taller
                main image, gives the mockup more vertical presence. */}
            <div className="flex flex-col gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-7 h-10 rounded overflow-hidden border ${i === 0 ? 'border-ink border-2' : 'border-[#E0D5C8]'}`}>
                  <Image src="/carpets/moroccan-oatmeal.webp" alt="" width={28} height={40} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Main product image — taller so the store frame isn't squat */}
            <Image src="/carpets/moroccan-oatmeal.webp" alt="" width={150} height={230} className="w-[150px] h-[230px] rounded-lg object-cover" />

            {/* Right column — visual density with very little text */}
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-ink text-[13px] font-extrabold leading-tight truncate">Moroccan Oatmeal Rug</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex gap-px text-amber-500 text-[10px]">★★★★★</div>
                <span className="text-sub text-[9px] font-semibold">128</span>
              </div>
              <p className="text-ink text-sm font-extrabold mt-1.5">$599</p>

              {/* Color swatches — pure shapes, no labels */}
              <div className="flex gap-1.5 mt-2">
                {['#C8A37A', '#7A6A56', '#1F2937', '#A8907D'].map((c, i) => (
                  <div
                    key={c}
                    className={`w-4 h-4 rounded-full border ${i === 0 ? 'border-ink border-2' : 'border-line'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Size pills */}
              <div className="flex gap-1 mt-2">
                {["5'×7'", "8'×10'", "9'×12'"].map((s, i) => (
                  <span key={s} className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${i === 1 ? 'bg-brand-light border border-brand text-ink' : 'border border-line text-sub'}`}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Heart alone — no cart button, no rival CTA */}
              <div className="flex items-center gap-2 mt-auto pt-2">
                <button className="w-8 h-8 rounded-md border border-line bg-white grid place-items-center text-sub">
                  <Heart size={13} strokeWidth={2.1} />
                </button>
                <div className="flex items-center gap-2.5 text-sub">
                  <Truck size={11} strokeWidth={2.1} />
                  <ShieldCheck size={11} strokeWidth={2.1} />
                  <RefreshCcw size={11} strokeWidth={2.1} />
                </div>
              </div>
            </div>
          </div>

          {/* Polished floating button stays bottom-right of the store */}
          <FloatingButton accent={accent} />
        </div>
      </div>

      {/* ── Click connector ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 -my-1 pr-6 pointer-events-none">
        <span className="text-sub text-[10px] font-bold tracking-wider uppercase">Shopper clicks</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      {/* ── 2. Modal — narrower (width-only) so it reads as a true popup,
              not a full-width sheet. Height stays the same so the room
              preview keeps its presence. */}
      <div className="self-end w-[42%] rounded-xl border border-line bg-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] overflow-hidden">
        <div className="flex items-center gap-2 px-2.5 py-2 border-b border-line">
          <Image src="/carpets/moroccan-oatmeal.webp" alt="" width={22} height={22} className="w-[22px] h-[22px] rounded object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[7px] font-extrabold tracking-[0.18em]" style={{ color: accent }}>VISUALIZE</p>
            <p className="text-ink text-[10px] font-extrabold truncate">Moroccan Oatmeal Rug</p>
          </div>
          <div className="w-4 h-4 rounded-full bg-bg grid place-items-center text-sub text-[9px] font-bold">×</div>
        </div>
        {/* Taller aspect (4/3 vs 16/8) so a narrower modal stays the
            same overall height — the room photo still owns the body. */}
        <div className="aspect-[4/3] relative bg-[#F2E8DD]">
          <BeforeAfterCompare
            baseImage="/room-previews/room-after.webp"
            overlayImage="/room-previews/room-before.webp"
            beforeLabel=""
            afterLabel=""
            afterAccent={accent}
          />
        </div>
        <div className="flex gap-1 px-1.5 py-1.5 border-t border-line">
          {/* Icon-only refresh for "Start over" — saves horizontal space
              in the narrower modal. */}
          <button type="button" aria-label="Start over" className="w-7 h-7 rounded border border-line bg-white grid place-items-center text-sub">
            <RefreshCcw size={11} strokeWidth={2.3} />
          </button>
          {/* Share + Download keep both icon and text so they read as
              real actions, matching the FlowShowcase result card style. */}
          <div className="flex-1 h-7 rounded border border-line bg-white inline-flex items-center justify-center gap-1 text-ink text-[9px] font-extrabold">
            <Share2 size={10} strokeWidth={2.3} />
            Share
          </div>
          <div className="flex-[1.5] h-7 rounded inline-flex items-center justify-center gap-1 text-white text-[9px] font-extrabold" style={{ backgroundColor: accent }}>
            <Download size={10} strokeWidth={2.4} />
            Download
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact platform-install row. Each tile is a real link to the
// matching docs page. Brand-tinted backgrounds so the row reads as
// "here are the platforms we ship to" without needing labels.
function PlatformRow() {
  return (
    <div className="mt-7">
      <p className="text-sub text-[10.5px] font-bold tracking-wider uppercase mb-2.5">
        Install on
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {PLATFORMS.map((p) => (
          <Link
            key={p.name}
            href={p.href}
            title={`Install on ${p.name}`}
            aria-label={`Install on ${p.name}`}
            className="group relative w-8 h-8 rounded-md border border-dashed border-line grid place-items-center overflow-hidden transition-transform hover:-translate-y-0.5 p-[3px]"
            style={{ backgroundColor: p.bg }}
          >
            <PlatformLogo kind={p.kind} />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Renders the actual brand asset for each tile. Logos fill the inner
// (padded) tile so the row reads as logos, not icons.
function PlatformLogo({ kind }: { kind: 'custom' | 'shopify' | 'woo' | 'wix' | 'webflow' }) {
  if (kind === 'custom') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (kind === 'webflow') {
    // Mask the SVG so it paints in pure white over the blue tile —
    // more reliable than chained filters when Next/Image is involved.
    return (
      <span
        className="block w-full h-full"
        style={{
          backgroundColor: 'white',
          WebkitMaskImage: 'url(/logos/webflow.svg)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskImage: 'url(/logos/webflow.svg)',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
        }}
      />
    );
  }
  if (kind === 'shopify') {
    // Tight-cropped bag fills the tile.
    return <Image src="/logos/shopify.webp" alt="" width={64} height={64} className="w-full h-full object-contain" />;
  }
  if (kind === 'woo') {
    return <Image src="/logos/woocommerce.webp" alt="" width={64} height={64} className="w-full h-full object-contain" />;
  }
  // wix — black-on-transparent wordmark, rendered on the white tile.
  // unoptimized while we iterate so Next/Image doesn't serve a stale copy.
  return <Image src="/logos/wix.webp" alt="" width={64} height={64} unoptimized className="w-full h-full object-contain" />;
}

// Real-feeling floating widget pill. Uses a subtle gradient + inner
// 1px white highlight to read as a "raised" UI element instead of a
// flat marketing button. Stays bottom-right of the store mockup.
function FloatingButton({ accent }: { accent: string }) {
  const lighter = `${accent}E6`; // 90% alpha for the top stop of the gradient
  return (
    <div className="absolute bottom-3 right-3">
      <div
        className="relative inline-flex items-center gap-2 pl-3 pr-4 h-10 rounded-full text-white text-[12px] font-extrabold tracking-tight"
        style={{
          background: `linear-gradient(180deg, ${lighter} 0%, ${accent} 100%)`,
          boxShadow: `0 10px 28px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.08)`,
        }}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 grid place-items-center">
          <Sparkles size={11} fill="white" strokeWidth={0} />
        </span>
        See in your room
      </div>
    </div>
  );
}
