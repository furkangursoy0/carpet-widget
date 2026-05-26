'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

export default function Navbar({
  onDemo, onFeatures, onInstall, onPricing, onCustomize,
}: {
  onDemo: () => void;
  onFeatures: () => void;
  onInstall: () => void;
  onPricing: () => void;
  onCustomize: () => void;
}) {
  return (
    <header className="min-h-[78px] px-8 py-4">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
          <span className="text-white font-black text-lg">S</span>
        </div>
        <span className="text-[22px] font-extrabold tracking-tight">Sceneva</span>
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: 'Features', onClick: onFeatures },
          { label: 'Install', onClick: onInstall },
          { label: 'Pricing', onClick: onPricing },
          { label: 'Customize', onClick: onCustomize },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-3 py-2 rounded-full text-sub text-[13px] font-bold hover:bg-bg hover:text-ink transition-colors"
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {/* The "Open Live Demo" CTA was removed from the nav — the demo
            stays accessible via the secondary link under the hero's URL
            input ("Or watch the 30-second live demo"), which keeps the
            top-right uncluttered around the primary "Sign in" entry. */}
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 rounded-full text-ink text-[13px] font-bold hover:bg-bg transition-colors"
        >
          Sign in
        </Link>
      </div>
      </div>
    </header>
  );
}
