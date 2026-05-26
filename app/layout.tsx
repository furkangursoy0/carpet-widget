import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sceneva — AI Room Visualizer for Rug Retailers',
  description: 'Let shoppers see your rug in their room before they buy. AI-powered room visualization widget for rug e-commerce stores.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Sceneva — AI Room Visualizer for Rug Retailers',
    description: 'Let shoppers see your rug in their room before they buy.',
    url: 'https://sceneva.com',
    siteName: 'Sceneva',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sceneva — AI Room Visualizer for Rug Retailers',
    description: 'Let shoppers see your rug in their room before they buy.',
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
