// Sentry server-side initialisation.
// When you have SENTRY_DSN, uncomment the import and init below.
// Run: npm install @sentry/nextjs

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // const { init } = await import('@sentry/nextjs');
    // init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 0.2,
    //   environment: process.env.NODE_ENV,
    // });
  }
}
