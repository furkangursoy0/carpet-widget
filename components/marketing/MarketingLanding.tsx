'use client';

import { useRef, useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import ProofStrip from './ProofStrip';
import FlowShowcase from './FlowShowcase';
import OperatorConsole from './OperatorConsole';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Faq from './Faq';
import Footer from './Footer';
import FullscreenDemo from '@/components/demo/FullscreenDemo';
import FullscreenDashboard from '@/components/dashmock/FullscreenDashboard';

// Landing page section order — every section either teaches something
// new or tightens the conversion path. The middle of the page is
// framed as two parallel chapters:
//   • "For your shoppers" → FlowShowcase
//   • "For you, the operator" → OperatorConsole (dashboard + features)
//
//   1) Hero            — URL input + "Add to my store" → /customize
//   2) ProofStrip      — three quick proof points under the hero
//   3) FlowShowcase    — what shoppers experience, ends in CTA → /customize
//   4) OperatorConsole — what the merchant gets (dashboard + features)
//   5) Pricing
//   6) Testimonials
//   7) Faq             — honest answers right before the footer
//   8) Footer
export default function MarketingLanding() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const installRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // Full-bleed page. Each section paints its own background to the
    // viewport edges; content inside sections stays readable via their
    // own px-8 lg:px-16 padding (and inner max-width wrappers where
    // it matters — Pricing, FAQ, etc).
    <div className="min-h-screen bg-white">
      <Navbar
        onDemo={() => setDemoOpen(true)}
        onFeatures={() => scrollTo(featuresRef)}
        onInstall={() => scrollTo(installRef)}
        onPricing={() => scrollTo(pricingRef)}
        onCustomize={() => { window.location.href = '/customize'; }}
      />
      <Hero onDemo={() => setDemoOpen(true)} onCustomize={() => { window.location.href = '/customize'; }} />
      <ProofStrip />
      <div ref={installRef}>
        <FlowShowcase />
      </div>
      <div ref={featuresRef}>
        <OperatorConsole onPricing={() => scrollTo(pricingRef)} />
      </div>
      <div ref={pricingRef}>
        <Pricing onDemo={() => setDemoOpen(true)} />
      </div>
      <Testimonials />
      <Faq />
      <Footer onDemo={() => setDemoOpen(true)} />

      {demoOpen ? <FullscreenDemo onClose={() => setDemoOpen(false)} /> : null}
      {dashOpen ? <FullscreenDashboard onClose={() => setDashOpen(false)} /> : null}
    </div>
  );
}
