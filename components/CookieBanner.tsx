'use client';

// Minimal EU-friendly cookie consent banner. We don't drop any
// non-essential cookies until a visitor clicks Accept, so this is
// really an opt-in disclosure (analytics-aware) rather than a full
// consent management platform. Choice is persisted in localStorage
// under "sceneva-cookie-choice" ("accepted" | "declined").
//
// Visible only on marketing/public routes — dashboard pages are
// behind auth and the choice is already implied by signing in.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STORAGE_KEY = 'sceneva-cookie-choice';

const HIDDEN_PREFIXES = [
  '/overview',
  '/settings',
  '/widgets',
  '/billing',
  '/onboarding',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/api',
];

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const choice = window.localStorage.getItem(STORAGE_KEY);
    if (choice) return;
    setVisible(true);
  }, []);

  if (!visible) return null;
  if (pathname && HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  function persist(choice: 'accepted' | 'declined') {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch {}
    setVisible(false);
    // Notify listeners (e.g. an analytics loader) without forcing a refresh.
    window.dispatchEvent(new CustomEvent('sceneva:cookie-consent', { detail: choice }));
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-[420px] rounded-2xl border border-line bg-white shadow-cardHover p-5">
      <h2 className="text-sm font-extrabold text-ink">We use minimal cookies</h2>
      <p className="text-xs text-sub leading-relaxed mt-1.5">
        Sceneva uses cookies for essential session/login features. Optional analytics cookies help us improve the product — they're off until you accept. See our{' '}
        <Link href="/privacy" className="text-brand font-semibold underline">Privacy Policy</Link>.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => persist('accepted')}
          className="btn-primary h-9 flex-1 text-xs"
        >
          Accept all
        </button>
        <button
          onClick={() => persist('declined')}
          className="btn-ghost h-9 flex-1 text-xs"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
