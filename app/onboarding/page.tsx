import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase-server';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Skip if already onboarded
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (profile?.onboarded) redirect('/overview');

  // Don't auto-create a widget on page mount. If the user skips the
  // wizard from step 1 we want them to land on /widgets with a clean
  // empty state, not a phantom widget they didn't ask for. The widget
  // row is created when they hit Continue on step 1 (saveStoreStep).
  // If a row already exists (e.g. they returned to onboarding after
  // bouncing) we surface its embed_key.
  const svc = getServiceSupabase();
  const { data: existing } = await svc
    .from('widgets')
    .select('embed_key')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  return (
    <OnboardingClient
      initialBrandName={profile?.brand_name ?? ''}
      initialStoreUrl={profile?.store_url ?? ''}
      embedKey={(existing?.embed_key as string | undefined) ?? ''}
    />
  );
}
