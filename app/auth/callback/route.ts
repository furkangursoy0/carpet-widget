// ═══════════════════════════════════════════════════════════════════
// GET /auth/callback?code=...
// Supabase email-confirmation + magic-link redirect target.
// Exchanges the code for a session cookie, then redirects.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/onboarding';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set: (n: string, v: string, o: any) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n: string, o: any) => cookieStore.set({ name: n, value: '', ...o }),
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Map Supabase auth error codes to the short slugs that
    // /login understands (see ERROR_COPY there). Anything we don't
    // recognise gets passed through verbatim so we still surface
    // something — better an ugly message than no message.
    const msg = error.message.toLowerCase();
    let slug = encodeURIComponent(error.message);
    if (msg.includes('expired')) slug = 'expired_token';
    else if (msg.includes('invalid') && msg.includes('grant')) slug = 'invalid_grant';
    return NextResponse.redirect(new URL(`/login?error=${slug}`, req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
