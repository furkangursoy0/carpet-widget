import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://sceneva.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/overview', '/settings', '/billing', '/onboarding', '/api/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
