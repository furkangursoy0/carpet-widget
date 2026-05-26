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

  // Ensure a widget row exists (so we have an embed_key to show)
  const svc = getServiceSupabase();
  const { data: existing } = await svc.from('widgets').select('id, embed_key').eq('user_id', user.id).limit(1).maybeSingle();
  let embedKey = existing?.embed_key as string | undefined;
  if (!embedKey) {
    const { data: created } = await svc
      .from('widgets')
      .insert({ user_id: user.id, name: 'Main widget' })
      .select('embed_key')
      .single();
    embedKey = created?.embed_key;
  }

  return (
    <OnboardingClient
      initialBrandName={profile?.brand_name ?? ''}
      initialStoreUrl={profile?.store_url ?? ''}
      embedKey={embedKey ?? ''}
    />
  );
}
