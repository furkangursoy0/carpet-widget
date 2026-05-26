'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to Sentry/console when we hook it up
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand grid place-items-center mx-auto mb-6 shadow-brand">
          <span className="text-white font-black text-2xl">S</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-sub font-semibold mb-6">
          An unexpected error occurred. Our team has been notified. If this keeps happening, email{' '}
          <a href="mailto:hello@sceneva.com" className="text-brand">hello@sceneva.com</a>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try again</button>
          <a href="/" className="btn-ghost">Back to homepage</a>
        </div>
        {error.digest ? (
          <p className="text-xs text-sub mt-4">Error ID: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
