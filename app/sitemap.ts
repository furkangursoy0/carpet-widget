import { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://sceneva.com';
  const now = new Date();
  const docs = [
    'install-shopify',
    'install-woocommerce',
    'customize-widget',
    'detection-troubleshooting',
    'billing-usage',
  ];
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const posts = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''))
    : [];

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...docs.map((slug) => ({
      url: `${baseUrl}/docs/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
