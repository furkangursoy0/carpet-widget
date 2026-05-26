import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg py-16 px-6">
      {/* Nav */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand grid place-items-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-extrabold tracking-tight">Sceneva</span>
        </Link>
        <Link href="/" className="text-sm text-sub hover:text-ink font-semibold">← Back to home</Link>
      </div>

      <article className="max-w-3xl mx-auto card p-10">
        <h1 className="text-2xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-xs text-sub mb-8">Last updated: June 30, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="text-base font-extrabold mb-2">1. The service</h2>
            <p>Sceneva provides an AI-powered room visualization widget ("Widget") for rug e-commerce merchants ("you"). The Widget is embedded on your store and lets shoppers upload a room photo to preview how your rugs look in their space.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">2. Subscription & billing</h2>
            <p>Sceneva is billed monthly at $99 (Growth plan — 1,000 room previews). Billing is handled by <strong>Lemon Squeezy</strong>, our Merchant of Record, which handles EU VAT, US sales tax, and payment processing. By subscribing you agree to Lemon Squeezy's terms as well as these Terms.</p>
            <p className="mt-2">Overage beyond your included previews is charged at $0.08 per additional preview. Your plan auto-renews unless cancelled before the next billing date.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">3. Acceptable use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may only use the Widget on domains you own or control.</li>
              <li>You must not use the Widget to process images of people, minors, or adult content.</li>
              <li>You must not reverse-engineer, scrape, or abuse the API.</li>
              <li>Automated bulk generation without real shopper intent is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">4. AI-generated content</h2>
            <p>Generated room preview images are produced by OpenAI's image generation API. Results are approximate visualizations intended for inspiration, not guaranteed accuracy. Sceneva makes no warranty that generated images will match the physical product in color, scale, or texture.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">5. Your content & merchant responsibility</h2>
            <p>You are responsible for ensuring your product images are accurate and that you have the rights to use them. Sceneva is not liable for inaccurate product representations resulting from your product images.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">6. Limitation of liability</h2>
            <p>Sceneva's total liability for any claim is limited to the fees paid by you in the 3 months preceding the claim. Sceneva is not liable for indirect, incidental, or consequential damages including lost sales.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">7. Termination</h2>
            <p>You may cancel anytime via the billing portal in your dashboard. Sceneva may terminate accounts that violate these Terms, with or without notice.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">8. Governing law</h2>
            <p>These Terms are governed by the laws of the Republic of Turkey. Disputes will be resolved in Istanbul courts.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">9. Contact</h2>
            <p>Questions? Email <a href="mailto:hello@sceneva.com" className="text-brand hover:underline">hello@sceneva.com</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
