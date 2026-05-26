'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = getBrowserSupabase();
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    const { data: profile } = await supabase.from('users').select('onboarded').eq('id', authData.user.id).single();
    router.push(profile?.onboarded ? '/overview' : '/onboarding');
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">Sceneva</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-sm text-sub mt-1">Sign in to your operator dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@store.com" autoComplete="email" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="label !mb-0">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:text-brand-dark">Forgot?</Link>
            </div>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-sub mt-6">
          New to Sceneva?{' '}
          <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
