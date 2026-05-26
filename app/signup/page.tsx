'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [check, setCheck] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setErr('Password must be at least 8 characters.');
    setLoading(true);
    setErr(null);
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/onboarding`,
        data: { brand_name: brandName },
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    // Save brand_name on the public.users row (the trigger creates the row, we update it)
    if (data.user?.id && brandName) {
      await supabase.from('users').update({ brand_name: brandName }).eq('id', data.user.id);
    }
    // If email confirmation is required, show check inbox screen
    if (!data.session) {
      setCheck(true);
      return;
    }
    router.push('/onboarding');
    router.refresh();
  }

  if (check) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <div className="card p-10 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-brand-light grid place-items-center mx-auto mb-4">
            <span className="text-brand text-xl">✓</span>
          </div>
          <h1 className="text-xl font-extrabold mb-2">Check your inbox</h1>
          <p className="text-sm text-sub">We sent a confirmation link to <strong className="text-ink">{email}</strong>. Open it to finish setting up your account.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-brand">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">Sceneva</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-sm text-sub mt-1">Install the widget on your store in under 5 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <div>
            <label className="label">Brand name</label>
            <input className="input" required value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Nomad Rugs" />
          </div>
          <div>
            <label className="label">Work email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@nomadrugs.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            <p className="help">By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-sub mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
