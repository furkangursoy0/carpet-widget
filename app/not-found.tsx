import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page not found · Sceneva',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex w-16 h-16 rounded-2xl bg-brand items-center justify-center mx-auto mb-6 shadow-brand hover:opacity-90 transition-opacity">
          <span className="text-white font-black text-2xl">S</span>
        </Link>
        <p className="text-xs font-extrabold uppercase tracking-wider text-sub mb-2">Error 404</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">This page doesn't exist</h1>
        <p className="text-sub mb-7">
          The link might be old, or the page may have moved. Try one of these instead:
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/" className="btn-primary h-11">Sceneva homepage</Link>
          <Link href="/overview" className="btn-ghost h-11">Open dashboard</Link>
        </div>
        <p className="text-xs text-sub">
          Need help? <Link href="/docs" className="text-brand font-semibold">Browse the docs</Link> or email{' '}
          <a href="mailto:hello@sceneva.com" className="text-brand font-semibold">hello@sceneva.com</a>.
        </p>
      </div>
    </main>
  );
}
