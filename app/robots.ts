import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://sceneva.com';

  // On Vercel previews we already emit X-Robots-Tag: noindex,nofollow
  // (see next.config.mjs). We also short-circuit robots.txt to a hard
  // "Disallow: /" so search engines that crawl preview URLs don't even
  // try the rest of the tree.
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
  if (isPreview) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block authed surfaces (no useful content for crawlers, and
        // /api would 401 anyway), plus the per-customer test page.
        disallow: [
          '/overview',
          '/settings',
          '/billing',
          '/onboarding',
          '/widgets',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
