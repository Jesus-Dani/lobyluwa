import * as Sentry from "@sentry/nextjs";

// Captures backend errors — failed installment charges, webhook
// processing failures, DB errors — anything thrown inside an API route
// or server component.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: process.env.NODE_ENV,
});
