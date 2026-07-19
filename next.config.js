const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `ws` (used by @neondatabase/serverless for the pooled/WebSocket
  // connection — see src/lib/prisma.ts) breaks when webpacked into the
  // server bundle; keeping it external makes Next.js `require()` it
  // normally at runtime instead.
  serverExternalPackages: ["ws"],
  images: {
    // Product images are served from Cloudinary — restrict remote image
    // loading to that host only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Applies to every route.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' res.cloudinary.com data:",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' api.paystack.co",
              "frame-src js.paystack.co checkout.paystack.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Wrapping with Sentry adds automatic source-map upload and error capture
// during build. No-ops safely if SENTRY_AUTH_TOKEN isn't set (e.g. local dev).
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
