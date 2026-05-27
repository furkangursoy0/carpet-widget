// We launched Sceneva solo and don't have public testimonials yet.
// Rather than fabricate quotes (the old version had three fake ones —
// see git history), this section now does two honest things:
//   1) a founder note explaining why the tool exists
//   2) an early-access ask that funnels first 10 stores to /signup
// Real customer quotes will replace this once we have them.

import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="bg-[#F1F5F9] px-8 lg:px-16 py-14">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
        <div>
          <p className="text-brand text-[11px] font-extrabold uppercase tracking-tight mb-3">From the founder</p>
          <h2 className="text-ink text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1]">
            We built Sceneva because product photography alone wasn't closing the gap.
          </h2>
          <p className="text-sub text-base font-medium leading-relaxed mt-5">
            Shoppers shouldn't have to imagine how a rug fits their space — they should see it. We
            ship a single-line widget so retailers don't have to rebuild their store to give
            customers that confidence. Early access pricing is in place while we onboard our first
            stores; the next round goes up.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-7 px-5 h-12 rounded-full bg-brand text-white font-bold text-sm shadow-brand hover:bg-brand-dark transition-colors"
          >
            Join early access <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-line p-7 shadow-card relative">
          <Quote size={28} className="text-brand-light absolute top-5 right-5" strokeWidth={2.2} />
          <p className="text-ink text-base leading-relaxed font-semibold">
            "If you sell rugs (or anything visual that lives in a room) and you want to find out
            whether AI room previews move the needle for your conversion rate — we want to talk to
            you. The first 10 stores get setup help directly from me."
          </p>
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-rail">
            <div className="w-10 h-10 rounded-full bg-brand grid place-items-center text-white font-extrabold">
              F
            </div>
            <div>
              <p className="text-ink text-sm font-extrabold">Furkan Gürsoy</p>
              <p className="text-sub text-xs font-semibold">Founder · Sceneva</p>
            </div>
            <a
              href="mailto:hello@sceneva.com?subject=Sceneva%20early%20access"
              className="ml-auto text-brand text-xs font-bold hover:text-brand-dark"
            >
              hello@sceneva.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
