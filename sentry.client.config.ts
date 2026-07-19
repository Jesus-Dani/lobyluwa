import * as Sentry from "@sentry/nextjs";

// Captures frontend errors (broken components, failed API calls from the
// browser, etc.) so a bug is a Sentry alert instead of a silent blank
// page a customer just closes the tab on.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: process.env.NODE_ENV,
});
