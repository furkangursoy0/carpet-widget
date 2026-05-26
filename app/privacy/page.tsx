import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// When you have your Termly policy:
//   1. Go to termly.io → your policy → Embed
//   2. Copy the embed snippet (looks like: <div name="termly-embed" ... />)
//   3. Replace the <TermlyEmbed /> placeholder below with that snippet
// ─────────────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-xs text-sub mb-8">Last updated: June 30, 2026</p>

        {/* ── TERMLY EMBED GOES HERE ───────────────────────────────────────
            Replace the section below with your Termly embed snippet.
            Until then, this placeholder is live.
        ─────────────────────────────────────────────────────────────────── */}
        <div className="space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="text-base font-extrabold mb-2">1. What we collect</h2>
            <p>We collect the information you provide when creating an account (email address, brand name, store URL) and usage data from your widget (events like opens, uploads, and generations — no personally identifiable shopper data).</p>
            <p className="mt-2">Room photos uploaded by shoppers are processed by OpenAI's image API and are <strong>not stored</strong> by Sceneva beyond the duration of the request (typically under 30 seconds).</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">2. How we use it</h2>
            <p>Account data is used to provide the Sceneva service, send transactional emails (via Resend), and process payments (via Lemon Squeezy, our Merchant of Record). Usage events are used to power your dashboard analytics and detect abuse.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">3. Data storage & retention</h2>
            <p>All data is stored in Supabase (hosted in the EU). Generated room preview images are stored in Supabase Storage and retained for 90 days, after which they are automatically deleted. You can request deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">4. Third parties</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>OpenAI</strong> — processes room + product images for AI visualization. Subject to OpenAI's privacy policy.</li>
              <li><strong>Lemon Squeezy</strong> — Merchant of Record for all payments. Your billing data is governed by Lemon Squeezy's terms.</li>
              <li><strong>Supabase</strong> — database and storage provider.</li>
              <li><strong>Resend</strong> — transactional email delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">5. Your rights (GDPR)</h2>
            <p>If you are located in the EU/EEA, you have the right to access, rectify, erase, restrict, or port your personal data. To exercise these rights, email <a href="mailto:privacy@sceneva.com" className="text-brand hover:underline">privacy@sceneva.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-extrabold mb-2">6. Contact</h2>
            <p>Questions? Email <a href="mailto:hello@sceneva.com" className="text-brand hover:underline">hello@sceneva.com</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
