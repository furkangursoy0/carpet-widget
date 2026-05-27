// Per-widget "test page" — renders a synthetic product page with the
// widget script tag embedded, so merchants can sanity-check their
// install before pasting it onto a real store theme.
//
// Note: we serve this from app.sceneva.com which IS in the merchant's
// allowed_domains for free (the API treats app.sceneva.com origins as
// trusted when the embed_key resolves to the same user). The widget
// script picks `apiBase` from its own src URL, so it just works.

import { redirect, notFound } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const WIDGET_SCRIPT_URL =
  process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://app.sceneva.com/widget/widget.js';

export default async function WidgetTestPage({ params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const svc = getServiceSupabase();
  const { data: widget } = await svc
    .from('widgets')
    .select('id, embed_key, name')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!widget) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Test-page chrome — clearly distinct so merchants know this
          isn't their real store. */}
      <div className="bg-warn/10 border-b border-warn/30 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-warn-ink text-white">
            Test page
          </span>
          <p className="text-sm text-warn-ink truncate">
            Synthetic product page for{' '}
            <strong>{widget.name || 'your widget'}</strong> — not visible to shoppers.
          </p>
        </div>
        <Link
          href={`/widgets/${widget.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-warn-ink hover:opacity-80 flex-shrink-0"
        >
          <ArrowLeft size={12} /> Back to editor
        </Link>
      </div>

      {/* Fake product page — minimal layout that triggers our default
          detection selectors (.product__media img, h1[itemprop="name"]). */}
      <div className="max-w-5xl mx-auto px-8 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-10">
        <div className="product__media">
          <img
            src="https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=900&q=80"
            alt="Test rug"
            className="w-full rounded-xl"
          />
        </div>
        <div className="pt-2">
          <p className="text-xs font-extrabold text-sub tracking-wider uppercase mb-2">Test catalog</p>
          <h1 itemProp="name" className="text-3xl font-extrabold tracking-tight mb-2">
            Demo Hand-Knotted Wool Rug
          </h1>
          <p className="text-2xl font-extrabold mb-4">$599</p>
          <p className="text-sm text-sub leading-relaxed mb-6">
            This is a synthetic product page hosted on Sceneva so you can confirm the widget renders
            correctly with your configured colour, label, position, and detection logic. Upload a real
            room photo to do a full end-to-end test.
          </p>

          <div className="rounded-xl border border-line p-4 bg-bg text-xs text-sub space-y-2">
            <p>
              <strong className="text-ink">What to verify:</strong>
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>The trigger appears (button or side tab) in the position you chose.</li>
              <li>Accent colour, label, and shape match your editor preview.</li>
              <li>Modal opens, accepts an upload, and the rug photo on the left is detected as the product image.</li>
              <li>A generated preview comes back without an error.</li>
            </ul>
            <p className="pt-2 border-t border-line">
              <a
                href={`${WIDGET_SCRIPT_URL.replace('/widget/widget.js', '')}/api/widget/${widget.embed_key}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand font-semibold"
              >
                Inspect raw config JSON <ExternalLink size={11} />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* The actual embed — exactly the snippet we hand merchants. */}
      <Script
        async
        src={WIDGET_SCRIPT_URL}
        data-sceneva-key={widget.embed_key}
        strategy="afterInteractive"
      />
    </main>
  );
}
