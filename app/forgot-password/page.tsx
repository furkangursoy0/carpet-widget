'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await getBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="text-sm text-sub mt-1">We'll email you a link to set a new one.</p>
        </div>
        {sent ? (
          <div className="card p-7 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-light grid place-items-center mx-auto mb-3"><span className="text-brand text-xl">✓</span></div>
            <p className="text-sm text-ink">Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-7 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@store.com" />
            </div>
            {err ? <p className="text-sm text-danger">{err}</p> : null}
            <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-sub mt-6">
          <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
