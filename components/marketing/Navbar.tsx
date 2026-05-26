'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
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
  const [displayName, setDisplayName] = useState<string>('');
  const [displayEmail, setDisplayEmail] = useState<string>('');

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let mounted = true;

    async function hydrate(userId: string, email: string) {
      const { data: profile } = await supabase.from('users').select('brand_name').eq('id', userId).maybeSingle();
      if (!mounted) return;
      setDisplayName(profile?.brand_name?.trim() || email.split('@')[0] || 'Account');
      setDisplayEmail(email);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      if (user) {
        setAuthState('in');
        hydrate(user.id, user.email ?? '');
      } else {
        setAuthState('out');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      if (session?.user) {
        setAuthState('in');
        hydrate(session.user.id, session.user.email ?? '');
      } else {
        setAuthState('out');
        setDisplayName('');
        setDisplayEmail('');
      }
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
              className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-line bg-white hover:bg-bg transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-brand-light grid place-items-center">
                <span className="text-[11px] font-extrabold text-brand-ink">
                  {(displayName || 'S').charAt(0).toUpperCase()}
                </span>
              </span>
              <span className="text-ink text-[13px] font-bold max-w-[160px] truncate">{displayName || 'Account'}</span>
              <ChevronDown size={13} className="text-sub" />
            </button>
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-20">
              <div className="w-56 rounded-xl border border-line bg-white shadow-cardHover p-1.5">
                {displayEmail ? (
                  <div className="px-3 py-2 border-b border-rail mb-1">
                    <p className="text-xs text-sub truncate">Signed in as</p>
                    <p className="text-sm font-bold text-ink truncate">{displayEmail}</p>
                  </div>
                ) : null}
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
          <div className="h-9 w-24" />
        )}
      </div>
      </div>
    </header>
  );
}
