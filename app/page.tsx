// Root = marketing landing (sceneva.com homepage)
// Auth pages live at /login, /signup. Dashboard at /overview.

import MarketingLanding from '@/components/marketing/MarketingLanding';

export const dynamic = 'force-static';

export default function HomePage() {
  return <MarketingLanding />;
}
