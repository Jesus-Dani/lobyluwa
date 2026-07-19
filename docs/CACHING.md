# Caching & CDN Strategy

## Static assets
Handled automatically by Netlify's global CDN — JS/CSS bundles, fonts, and any static files are cached at edge locations globally with no configuration needed. This part requires no work.

## Product images
Served directly from Cloudinary, which has its own CDN. Next.js `<Image>` is configured (see `next.config.js`) to fetch from `res.cloudinary.com` — Cloudinary handles resizing/format negotiation and caching, we don't proxy image bytes through our own server.

## Dynamic data — the part that actually needs a decision
The product catalog (category pages, product detail pages) reads from Postgres on every request by default. At launch traffic that's fine; it will not hold up under a spike (a viral post, a sale announcement) because every visitor triggers a fresh DB query.

**Fix:** use Next.js Incremental Static Regeneration (ISR) on catalog and product-detail pages —

```ts
// src/app/products/[slug]/page.tsx
export const revalidate = 300; // regenerate at most every 5 minutes
```

This serves a cached page to most visitors and only hits the database once per revalidation window, not once per request. Stock counts and prices can lag by up to the revalidation window — acceptable for a catalog page, **not** acceptable for the actual checkout/payment flow, which always reads live data directly (never cached).

## What's NOT cached (by design)
Cart contents, checkout, payment status, order history, and the admin dashboard are always rendered fresh from the database — caching stale data in any of these would show a customer or Luwa incorrect stock, price, or payment state, which is worse than a slightly slower page load.
