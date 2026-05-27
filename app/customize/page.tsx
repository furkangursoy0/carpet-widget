// /customize used to be the unauthenticated widget builder. With
// onboarding now offering the full builder + live preview, that path
// became a dead-end. We keep the route alive (it's still linked from
// the docs, a few internal nav helpers, and Google may have indexed it
// — see app/sitemap.ts history) and redirect server-side:
//   • signed-in users → /widgets (their real widget editor)
//   • everyone else → /signup?next=/widgets (carry intent through auth)

import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function CustomizeRedirect() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/widgets');
  redirect('/signup');
}
