// Standalone widget builder page. Linked from the landing hero ("Start
// building"), from the FlowShowcase CTA, and from the navbar.
//
// We render the WidgetBuilderShowcase inside a thin shell that keeps the
// marketing chrome (Navbar + Footer) so visitors can navigate back without
// losing context.

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import WidgetBuilderShowcase from '@/components/marketing/WidgetBuilderShowcase';
import FullscreenDemo from '@/components/demo/FullscreenDemo';

function CustomizeInner() {
  const [demoOpen, setDemoOpen] = useState(false);
  const params = useSearchParams();
  const initialUrl = params.get('url') ?? '';

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onDemo={() => setDemoOpen(true)}
        onFeatures={() => { window.location.href = '/#features'; }}
        onInstall={() => { window.location.href = '/#install'; }}
        onPricing={() => { window.location.href = '/#pricing'; }}
        onCustomize={() => { /* already here */ }}
      />

      <div className="px-8 lg:px-16 pt-10 pb-6">
        <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">
          Widget Builder
        </p>
        <h1 className="text-ink text-[36px] lg:text-[52px] leading-[1.05] font-bold tracking-tight max-w-3xl">
          Design your widget — see it live as you go.
        </h1>
        <p className="text-sub text-base leading-[1.55] font-medium mt-4 max-w-2xl">
          Enter your store URL, pick the look that matches your brand, then copy a single line of code into your theme. Takes about two minutes.
        </p>
      </div>

      <WidgetBuilderShowcase initialUrl={initialUrl} onDemo={() => setDemoOpen(true)} />

      <Footer onDemo={() => setDemoOpen(true)} />

      {demoOpen ? <FullscreenDemo onClose={() => setDemoOpen(false)} /> : null}
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={null}>
      <CustomizeInner />
    </Suspense>
  );
}
