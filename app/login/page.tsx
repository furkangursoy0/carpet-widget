'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';

// Surface friendly copy for the few error codes that bubble back from
// /auth/callback when a magic link or confirmation token is no good.
const ERROR_COPY: Record<string, { title: string; body: string; cta?: 'resend' }> = {
  missing_code: {
    title: 'That confirmation link looks empty',
    body: 'Try clicking it directly from your email — or request a new one below.',
    cta: 'resend',
  },
  expired_token: {
    title: 'That confirmation link expired',
    body: 'Links are valid for 24 hours. Send yourself a fresh one and try again.',
    cta: 'resend',
  },
  invalid_grant: {
    title: 'That link was already used',
    body: 'It looks like you already confirmed this device. Just sign in normally.',
  },
};

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawError = params.get('error');
  const friendlyError = rawError
    ? ERROR_COPY[rawError] ?? { title: 'Sign-in problem', body: decodeURIComponent(rawError) }
    : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [resendBusy, setResendBusy] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendErr, setResendErr] = useState<string | null>(null);

  // Clear the ?error query once the user starts interacting again so the
  // banner doesn't linger after they retype credentials.
  useEffect(() => {
    if (email && rawError) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [email, rawError]);

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

  async function resendConfirmation() {
    setResendBusy(true);
    setResendErr(null);
    setResendDone(false);
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setResendBusy(false);
    if (error) return setResendErr(error.message);
    setResendDone(true);
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
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-sm text-sub mt-1">Sign in to your operator dashboard.</p>
        </div>

        {friendlyError ? (
          <div className="rounded-xl border border-warn/30 bg-warn/10 p-4 mb-5 flex items-start gap-3">
            <AlertCircle size={16} className="text-warn-ink mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-warn-ink">{friendlyError.title}</p>
              <p className="text-xs text-warn-ink/80 mt-1 leading-relaxed">{friendlyError.body}</p>
              {friendlyError.cta === 'resend' ? (
                <div className="mt-3">
                  {resendDone ? (
                    <p className="text-xs font-bold text-success">✓ Sent — check your inbox.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={resendConfirmation}
                      disabled={!email || resendBusy}
                      className="text-xs font-bold text-brand hover:text-brand-dark disabled:opacity-50"
                    >
                      {resendBusy ? 'Sending…' : email ? 'Resend confirmation link' : 'Type your email below, then click here to resend'}
                    </button>
                  )}
                  {resendErr ? <p className="text-xs text-danger mt-1">{resendErr}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
