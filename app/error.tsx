'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Forward to Sentry when wired up; until then console.error keeps
    // the stack trace available in browser devtools and Vercel logs.
    console.error('[Sceneva] uncaught:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex w-16 h-16 rounded-2xl bg-brand items-center justify-center mx-auto mb-6 shadow-brand hover:opacity-90 transition-opacity">
          <span className="text-white font-black text-2xl">S</span>
        </Link>
        <p className="text-xs font-extrabold uppercase tracking-wider text-sub mb-2">Unexpected error</p>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-sub mb-6">
          Try reloading the page. If this keeps happening, send us the Error ID below and we'll dig in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary h-11">Try again</button>
          <Link href="/" className="btn-ghost h-11">Back to homepage</Link>
        </div>
        <p className="text-xs text-sub mt-6">
          Help: <a href="mailto:hello@sceneva.com" className="text-brand font-semibold">hello@sceneva.com</a>
        </p>
        {error.digest ? (
          <p className="text-[11px] font-mono text-sub mt-2">Error ID: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
