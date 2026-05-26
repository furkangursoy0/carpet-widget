'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr('Password must be at least 8 characters.');
    if (password !== confirm) return setErr('Passwords do not match.');
    setLoading(true);
    const { error } = await getBrowserSupabase().auth.updateUser({ password });
    setLoading(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => router.push('/overview'), 1500);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand grid place-items-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-extrabold tracking-tight">Sceneva</span>
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-extrabold mb-1">Set a new password</h1>
          <p className="text-sm text-sub mb-6">Choose a strong password — at least 8 characters.</p>

          {done ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-success/10 text-success grid place-items-center mx-auto mb-3 text-xl">✓</div>
              <p className="font-bold">Password updated. Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">New password</label>
                <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input className="input" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              </div>
              {err ? <p className="text-xs text-danger font-bold">{err}</p> : null}
              <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-sub mt-4">
          <Link href="/login" className="font-bold hover:text-ink">← Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
