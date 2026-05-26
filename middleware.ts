// ═══════════════════════════════════════════════════════════════════
// Middleware: refresh Supabase session + protect dashboard routes.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED = ['/overview', '/settings', '/billing', '/onboarding'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => req.cookies.get(n)?.value,
        set: (n: string, v: string, o: any) => res.cookies.set({ name: n, value: v, ...o }),
        remove: (n: string, o: any) => res.cookies.set({ name: n, value: '', ...o }),
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (user && AUTH_ROUTES.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/overview', req.url));
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next|api/widget|api/visualize|api/event|api/lemon|widget|favicon|public).*)'],
};
