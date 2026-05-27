/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // CORS headers for /widget.js + /api/* so it loads from customer sites.
  // Plus a noindex header on every non-production deployment (Vercel
  // sets VERCEL_ENV=preview for branch/PR builds) so Google doesn't
  // index preview URLs as duplicate content alongside sceneva.com.
  async headers() {
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
    const headers = [
      {
        source: '/widget/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, X-Widget-Key' },
        ],
      },
    ];
    if (isPreview) {
      headers.push({
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      });
    }
    return headers;
  },
};

export default nextConfig;
