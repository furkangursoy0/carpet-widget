'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function Navbar({
  onDemo, onFeatures, onInstall, onPricing, onCustomize,
}: {
  onDemo: () => void;
  onFeatures: () => void;
  onInstall: () => void;
  onPricing: () => void;
  onCustomize: () => void;
}) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setAuthState(user ? 'in' : 'out');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setAuthState(session?.user ? 'in' : 'out');
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    setAuthState('out');
    router.refresh();
  }

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
        {authState === 'in' ? (
          <div className="relative group">
            <button
              type="button"
              aria-label="Account menu"
              className="w-9 h-9 rounded-full bg-brand grid place-items-center shadow-brand hover:opacity-90 transition-opacity"
            >
              <LayoutDashboard size={16} color="white" strokeWidth={2.4} />
            </button>
            <div
              className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-20"
            >
              <div className="w-44 rounded-xl border border-line bg-white shadow-cardHover p-1.5">
                <Link href="/overview" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-bg">
                  <LayoutDashboard size={14} className="text-sub" /> Dashboard
                </Link>
                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-bg">
                  <Settings size={14} className="text-sub" /> Settings
                </Link>
                <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-bg">
                  <LogOut size={14} className="text-sub" /> Sign out
                </button>
              </div>
            </div>
          </div>
        ) : authState === 'out' ? (
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-full text-ink text-[13px] font-bold hover:bg-bg transition-colors"
          >
            Sign in
          </Link>
        ) : (
          // loading — keep slot reserved so layout doesn't shift
          <div className="w-9 h-9" />
        )}
      </div>
      </div>
    </header>
  );
}
