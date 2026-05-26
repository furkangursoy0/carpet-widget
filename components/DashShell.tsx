'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, CreditCard, LogOut, HelpCircle, ChevronDown, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/overview', label: 'Overview', Icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', Icon: Settings },
  { href: '/billing', label: 'Billing', Icon: CreditCard },
];

export default function DashShell({
  children,
  brandName,
  userEmail,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  brandName: string;
  userEmail: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await getBrowserSupabase().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-line flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-rail">
          <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-ink truncate">Sceneva</p>
            <p className="text-xs text-sub truncate">{brandName || userEmail}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150',
                  active ? 'bg-brand-tint text-brand' : 'text-sub hover:bg-bg hover:text-ink',
                )}
              >
                <Icon size={17} strokeWidth={2.1} />
                {label}
                {active ? <div className="ml-auto w-1 h-5 rounded-full bg-brand" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-rail space-y-1">
          <Link
            href="/docs/install-shopify"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-sub hover:bg-bg hover:text-ink transition-colors"
          >
            <HelpCircle size={17} strokeWidth={2.1} />
            Help & docs
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-line hover:border-sub/30 hover:bg-bg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-light grid place-items-center">
                <span className="text-xs font-extrabold text-brand-ink">{(brandName || userEmail || 'S').charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-ink truncate">{brandName || 'Account'}</p>
                <p className="text-xs text-sub truncate">{userEmail}</p>
              </div>
              <ChevronDown size={14} className="text-sub" />
            </button>
            {menuOpen ? (
              <div className="absolute bottom-full mb-2 left-0 right-0 card p-1 shadow-cardHover z-10">
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink hover:bg-bg transition-colors">
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-line px-8 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm text-sub mt-0.5">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8 space-y-5">{children}</div>
        </div>
      </main>
    </div>
  );
}
