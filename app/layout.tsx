import type { Metadata } from 'next';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://sceneva.com';
const OG_IMAGE = `${SITE_URL}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sceneva — AI Room Visualizer for Rug Retailers',
    template: '%s · Sceneva',
  },
  description: 'Let shoppers see your rug in their room before they buy. AI-powered room visualization widget for rug e-commerce stores. Install in one line.',
  keywords: ['rug visualizer', 'AI room preview', 'shopify rug app', 'ecommerce widget', 'room AR', 'AI shopping'],
  authors: [{ name: 'Sceneva' }],
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Sceneva — AI Room Visualizer for Rug Retailers',
    description: 'Let shoppers see your rug in their room before they buy.',
    url: SITE_URL,
    siteName: 'Sceneva',
    type: 'website',
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Sceneva room visualizer widget' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sceneva — AI Room Visualizer for Rug Retailers',
    description: 'Let shoppers see your rug in their room before they buy.',
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Plausible analytics — replace data-domain when you connect the domain */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        {/* Inter font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {children}
        <CookieBanner />
        {/* Sentry — initialised in instrumentation.ts; this script tag is for session replay (optional) */}
        {process.env.NEXT_PUBLIC_SENTRY_DSN ? (
          <Script
            src="https://browser.sentry-cdn.com/8.x/bundle.min.js"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
