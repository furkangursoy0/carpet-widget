'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';

// Honest FAQ. Every answer here matches what the product actually does
// today — no roadmap promises, no marketing fluff. Keeps the trust
// curve high right before the visitor scrolls to the footer.
const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How do I install Sceneva on my store?',
    a: (
      <>
        One line of code, pasted in your theme right before the closing <code>&lt;/body&gt;</code> tag. We have step-by-step guides for{' '}
        <Link href="/docs/install-shopify" className="text-brand font-bold hover:underline">Shopify</Link>,{' '}
        <Link href="/docs/install-woocommerce" className="text-brand font-bold hover:underline">WooCommerce</Link>, and{' '}
        <Link href="/docs/install-custom" className="text-brand font-bold hover:underline">custom stores</Link> (Webflow, Wix, headless, etc.). Most merchants are live in under five minutes.
      </>
    ),
  },
  {
    q: 'What data do you collect from my shoppers?',
    a: (
      <>
        The minimum we need to render a preview: the room photo they upload, your product image URL (already public), the product title, and a sanitized page URL with query strings stripped. We hash IP addresses for rate limiting and discard them immediately. No raw IPs, no User-Agent strings, no referrers, no tracking cookies. Full breakdown in our{' '}
        <Link href="/docs/privacy-data" className="text-brand font-bold hover:underline">privacy doc</Link>.
      </>
    ),
  },
  {
    q: 'What happens to the room photo a shopper uploads?',
    a: <>It's sent to OpenAI's image API to compose the preview, then discarded. The room photo is never written to our database or storage. The composed result is stored in a private bucket and shared with the shopper via a signed URL that expires after 30 days.</>,
  },
  {
    q: 'Which platforms does Sceneva work with?',
    a: <>Anything that lets you paste a script tag. Verified on Shopify (including Hydrogen), WooCommerce, BigCommerce, Wix (Business plan or higher), Squarespace, Webflow, and any custom or headless storefront. The widget detects SPA route changes automatically, so framework-based stores work without extra configuration.</>,
  },
  {
    q: 'How accurate are the previews?',
    a: <>We use OpenAI's gpt-image-1 model with multi-image editing — it preserves your rug's pattern and color while matching the room's lighting and perspective. Quality scales with the resolution of your product photos: hero images of at least 1200×1200 produce the cleanest results. We pick output aspect ratio based on the shopper's room photo, so landscape rooms come back as landscape composites.</>,
  },
  {
    q: 'How does pricing work?',
    a: <>You pay per successful generation, not per page view or click. Plans start at 250 previews/month and scale up. You can cancel or change render volume any time — no app to uninstall, no commitments. See{' '}
      <Link href="/#pricing" className="text-brand font-bold hover:underline">pricing</Link> for current tiers.</>,
  },
  {
    q: 'Can I stop someone from copying my embed key to their own site?',
    a: <>Yes — every widget is locked to an explicit list of authorized domains. Requests from any other origin are rejected before we touch OpenAI, so no one can spend through your monthly quota. You set the domain when you install and can change it any time from Settings.</>,
  },
  {
    q: 'What if the wrong image gets detected as the product?',
    a: (
      <>
        Auto-detection works out of the box on the vast majority of stores. If your theme is unusual, you can either pin a custom CSS selector in Settings → Advanced, or add <code>data-sceneva-product-image</code> directly to your hero image in your theme. Details in the{' '}
        <Link href="/docs/detection-troubleshooting" className="text-brand font-bold hover:underline">troubleshooting guide</Link>.
      </>
    ),
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-8 lg:px-16 py-16 bg-white border-t border-[#EBF0F7]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">Questions, answered honestly</p>
          <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">
            Frequently asked.
          </h2>
        </div>

        <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-bg transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-ink text-[15px] font-bold tracking-tight">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-sub flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.2}
                  />
                </button>
                {isOpen ? (
                  <div className="px-5 pb-5 pt-0 text-sub text-[14px] leading-[22px] font-medium">
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sub text-sm font-medium mb-3">Still wondering?</p>
          <Link
            href="/customize"
            className="h-11 px-5 rounded-lg bg-brand text-white text-sm font-extrabold shadow-brand hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            Try the builder
            <ArrowRight size={15} strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}
