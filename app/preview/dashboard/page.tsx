// Standalone preview route for the operator dashboard mockup.
// Bypasses Supabase auth so we can show prospects (and ourselves)
// what the post-login experience looks like before the real backend
// is connected. Remove this route once Supabase is live and the real
// /overview, /widgets, /settings pages are reachable.

'use client';

import { useRouter } from 'next/navigation';
import FullscreenDashboard from '@/components/dashmock/FullscreenDashboard';

export default function DashboardPreviewPage() {
  const router = useRouter();
  return <FullscreenDashboard onClose={() => router.push('/')} />;
}
