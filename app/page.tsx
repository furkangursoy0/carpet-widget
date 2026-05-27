// Root = marketing landing (sceneva.com homepage)
// Auth pages live at /login, /signup. Dashboard at /overview.

import MarketingLanding from '@/components/marketing/MarketingLanding';

export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://sceneva.com';

// JSON-LD lets Google understand we're a SaaS product so it can render
// rich result cards (rating/price/etc.) instead of a plain blue link.
// SoftwareApplication is the strongest match — we're an installable
// embed for retailer stores.
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sceneva',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered room visualizer widget for rug e-commerce stores. Shoppers upload a room photo and see the rug rendered in their space before they buy.',
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    price: '99',
    priceCurrency: 'USD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '99',
      priceCurrency: 'USD',
      billingDuration: 'P1M',
    },
  },
  publisher: {
    '@type': 'Organization',
    name: 'Sceneva',
    url: SITE_URL,
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sceneva',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  email: 'hello@sceneva.com',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // SECURITY: object is local + JSON.stringify-safe; no user input flows in.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <MarketingLanding />
    </>
  );
}
