'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

type Plan = {
  name: string;
  monthly: number;
  blurb: string;
  previews: number;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthly: 49,
    blurb: 'One storefront, testing the waters.',
    previews: 250,
    features: [
      'Shopify, WooCommerce, custom embed',
      'Auto product detection',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    monthly: 129,
    blurb: 'Rolling previews across your product pages.',
    previews: 1500,
    features: [
      'Everything in Starter',
      'Custom widget styling',
      'Advanced analytics + product breakdown',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Pro',
    monthly: 249,
    blurb: 'Larger catalogues, multiple stores, high render volume.',
    previews: 5000,
    features: [
      'Everything in Growth',
      'Multiple storefronts',
      'CSV + API catalogue tools',
      'Dedicated launch help',
    ],
  },
];

const ANNUAL_DISCOUNT = 0.2; // 20% off when paying annually

// Pricing section. The annual toggle actually re-prices the cards.
// CTAs go straight into /customize (the builder) — no live-demo CTA
// here since the demo is moving out of the public landing.
export default function Pricing(_props: { onDemo?: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const priceOf = (plan: Plan) => {
    if (billing === 'monthly') return plan.monthly;
    return Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT));
  };

  return (
    <section className="px-8 lg:px-16 py-16 bg-white">
      <div className="max-w-[1280px] mx-auto">
      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">
          Pricing · Pay per preview
        </p>
        <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight">
          Start with one storefront. Scale when previews prove value.
        </h2>
        <p className="text-sub text-base leading-[1.55] font-medium mt-4">
          Every plan includes the widget, install support, and live analytics. Switch plans or cancel any time.
        </p>
      </div>

      {/* Billing-period toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-bg border border-line">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 h-9 rounded-full text-xs font-extrabold transition-colors ${
              billing === 'monthly' ? 'bg-ink text-white' : 'text-sub hover:text-ink'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-4 h-9 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors ${
              billing === 'annual' ? 'bg-ink text-white' : 'text-sub hover:text-ink'
            }`}
          >
            Annual
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                billing === 'annual' ? 'bg-white/15 text-white' : 'bg-success/15 text-success'
              }`}
            >
              −20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} price={priceOf(plan)} billing={billing} />
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center mt-10 space-y-2">
        <p className="text-sub text-[13px] font-semibold">
          Need more than 5,000 previews / month? <Link href="/contact" className="text-brand font-bold hover:underline">Talk to us</Link>.
        </p>
        <p className="text-sub text-[11.5px] font-medium">
          No card to start. No app to install. Switch plans or cancel any time.
        </p>
      </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, price, billing }: { plan: Plan; price: number; billing: 'monthly' | 'annual' }) {
  const featured = !!plan.featured;
  const perPreview = (price / plan.previews).toFixed(3);

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        featured
          ? 'border-2 border-brand bg-white shadow-[0_20px_50px_rgba(36,88,245,0.15)]'
          : 'border border-line bg-white'
      }`}
    >
      {/* Recommended ribbon for the featured plan */}
      {featured ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 h-6 rounded-full bg-brand text-white text-[10px] font-extrabold uppercase tracking-wider shadow-card">
          <Sparkles size={11} fill="white" strokeWidth={0} />
          Most popular
        </div>
      ) : null}

      <div className="flex items-baseline justify-between">
        <p className="text-ink text-lg font-extrabold">{plan.name}</p>
      </div>
      <p className="text-sub text-[13px] leading-[18px] font-medium mt-1.5 min-h-[36px]">{plan.blurb}</p>

      <div className="flex items-baseline gap-1.5 mt-5">
        <span className="text-ink text-4xl font-extrabold tracking-tight">${price}</span>
        <span className="text-sub text-[13px] font-bold">/mo</span>
        {billing === 'annual' ? (
          <span className="ml-1 text-sub text-[11px] font-semibold">billed yearly</span>
        ) : null}
      </div>

      {/* Inclusion box */}
      <div className={`mt-5 rounded-xl p-4 ${featured ? 'bg-brand-light' : 'bg-bg'}`}>
        <p className="text-ink text-2xl font-extrabold tracking-tight">
          {plan.previews.toLocaleString()}
        </p>
        <p className={`text-[10.5px] font-extrabold mt-1 uppercase tracking-wider ${featured ? 'text-brand' : 'text-sub'}`}>
          AI previews / month
        </p>
        <p className="text-sub text-[10.5px] font-medium mt-2">~${perPreview} per preview</p>
      </div>

      {/* Feature list */}
      <div className="space-y-2.5 mt-5">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className={`w-4 h-4 rounded-full grid place-items-center flex-shrink-0 mt-0.5 ${featured ? 'bg-brand' : 'bg-brand-light'}`}>
              <Check size={10} strokeWidth={3} className={featured ? 'text-white' : 'text-brand'} />
            </div>
            <span className="text-ink text-[13px] leading-[18px] font-semibold">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA — sends to the builder. Featured plan gets the solid CTA. */}
      <Link
        href="/customize"
        className={`mt-6 h-11 rounded-lg inline-flex items-center justify-center gap-2 text-[13px] font-extrabold transition-colors ${
          featured
            ? 'bg-brand text-white hover:bg-brand-dark'
            : 'border border-line text-ink hover:bg-bg'
        }`}
      >
        Start with {plan.name}
        <ArrowRight size={14} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
