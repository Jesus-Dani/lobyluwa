import * as Sentry from "@sentry/nextjs";

// Covers errors thrown inside middleware.ts (rate limiter, etc.), which
// runs on Vercel's Edge runtime and is otherwise invisible to the
// server config above.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: process.env.NODE_ENV,
});
