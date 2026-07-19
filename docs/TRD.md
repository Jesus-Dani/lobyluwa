# Technical Requirements Document
## LO BY LUWA — E-commerce Platform

**Status:** Locked scope, repo scaffolded
**Companion docs:** PRD.md, UI_Design_Brief.md, SECURITY.md, CACHING.md, DISASTER_RECOVERY.md

---

## 1. Architecture Overview

- **Framework:** Next.js (App Router), single codebase serving both the customer storefront and the admin interface (route-separated, e.g. `/admin/*` behind auth middleware).
- **Database:** PostgreSQL, hosted on Neon (free tier to start), provisioned via `npx neonctl@latest init`. Locked — no longer Supabase.
- **Hosting:** Netlify (free tier to start), using the official Next.js Runtime (`@netlify/plugin-nextjs`) for App Router, ISR, Image Optimization, and Middleware support — declared in `netlify.toml`. Locked — no longer Vercel.
- **Transactional email:** Resend, using React Email for templates.
- **Payments:** Paystack (Cards, Bank Transfer, USSD as available in Nigeria).
- **File/image storage:** Cloudinary for product images and the logo asset — admin uploads go directly from the browser to Cloudinary via a signed upload (see `src/lib/cloudinary.ts`), which also handles resizing, format negotiation, and CDN delivery.
- **Auth:** Email/password via next-auth, single role for admin (owner), single role for customer.
- **Scheduled jobs:** Netlify Scheduled Functions (cron syntax declared in `netlify.toml`) for installment due-date processing and reminder emails.
- **Rate limiting:** Upstash Redis, enforced in `middleware.ts` on auth and payment-adjacent routes — runs as a Netlify Edge Function under the Next.js Runtime.
- **Error tracking:** Sentry (client, server, and edge configs).
- **CI:** GitHub Actions (lint, typecheck, build on every PR/push — see `.github/workflows/ci.yml`).

## 2. Data Model (core entities)

**User**
`id, name, email, phone_number, password_hash, role (customer/admin), created_at`

**Address**
`id, user_id, label, recipient_name, phone_number, street, city, state, created_at`

**Product**
`id, name, description, category_id, cost_price, sale_price, images[], status (active/archived), created_at`

**ProductVariant**
`id, product_id, size, color, stock_quantity, sku`

**Category**
`id, name, slug, sort_order` — seeded with Joggers, Shirts, Face Caps, New Arrivals, Best Sellers (New Arrivals/Best Sellers may be computed/tagged categories rather than manually assigned).

**Wishlist / WishlistItem**
`user_id, product_id, added_at`

**Order**
`id, user_id, address_id, status (pending_payment/awaiting_balance/paid/shipped/delivered/cancelled/at_risk), subtotal, total, payment_plan_id (nullable), phone_number_at_checkout, created_at`

**OrderItem**
`order_id, product_variant_id, quantity, unit_price`

**PaymentPlan**
`id, order_id, method_type (card/transfer), installment_count, status (active/completed/defaulted)`

**Installment**
`id, payment_plan_id, sequence, amount, due_date, status (pending/paid/failed/overdue), paystack_reference, paid_at`

**PaystackAuthorization**
`id, user_id, authorization_code (Paystack token, not raw card data), card_last4, exp_month, exp_year, reusable (bool)`

**AnalyticsEvent**
`id, session_id, user_id (nullable), event_type (product_view/add_to_cart/wishlist_add/checkout_start/checkout_complete), product_id (nullable), metadata (jsonb), created_at`

## 3. Payments — Detailed Mechanism

### 3.1 One-time payment (Phase 1)
Standard Paystack Checkout/Inline flow: initialize transaction → customer completes payment on Paystack's hosted/inline UI → verify transaction server-side via webhook + verify endpoint → mark order paid → trigger confirmation email.

### 3.2 Installment engine (Phase 2)

**Card path (auto-charge):**
1. First installment is collected through a normal Paystack transaction, with the customer's explicit consent (checkbox at checkout) to have the remaining installments charged automatically to the same card.
2. On success, Paystack returns an `authorization_code` for that card. This token — not raw card data — is stored against the user. Local law requires 2FA on the first charge; Paystack handles this via its standard hosted flow, so no card data ever touches our servers (PCI scope stays minimal).
3. A scheduled job runs daily, finds installments due that day, and calls Paystack's charge-authorization endpoint with the stored `authorization_code` to charge the card server-to-server — no redirect, no OTP, nothing for the customer to do.
4. On success: installment marked paid, confirmation email sent, order balance updated.
5. On failure (declined, insufficient funds, expired card, issuer blocks recurring debit): retry once after 24 hours; if it fails again, fall back to emailing the customer a fresh Paystack payment link for that installment and flag the order in the admin "needs attention" queue.

**Transfer/USSD path (manual-link fallback):**
1. First installment paid via bank transfer or USSD.
2. These payment methods generally do not yield a reusable `authorization_code` usable for server-initiated charging, so silent auto-charge is not attempted for this path.
3. Ahead of each subsequent due date, the scheduled job automatically generates a new Paystack Payment Request (invoice) and emails it to the customer — this send is fully automated, but the customer must click through and pay manually.
4. If unpaid past the due date, reminder emails continue on a defined cadence (e.g. due date, +2 days, +5 days), then the order is flagged in the "needs attention" queue.

**Shared rules:**
- No item ships until `Order.status = paid` (full amount collected across all installments).
- Inventory for an order's variants stays reserved (deducted from sellable stock, not yet deducted from "owned" stock) from order creation until the order is cancelled or fulfilled.
- Every installment attempt (success or failure) is logged for the admin order-detail view — this is what makes tracking "automatic" from Luwa's side; she reads status, she doesn't chase payments manually.

### 3.3 Webhooks
Paystack webhook endpoint (`/api/webhooks/paystack`) handles `charge.success`, `charge.failed`, and payment request events; webhook signature verified against Paystack's secret. Webhook is the source of truth for payment state (not just the client-side redirect), to avoid missed/duplicate updates.

## 4. WhatsApp Handoff (Phase 2)

No WhatsApp Business API integration (explicitly out of scope — avoids per-message cost, template approval, and ToS risk of unofficial automation tools).

Implementation: a `wa.me/<phone_number>?text=<url-encoded order summary>` link is generated server-side per order and surfaced:
- On the post-checkout confirmation screen (customer-facing, opens a chat *to* Luwa's business number).
- In the admin order-detail view (Luwa-facing, opens a chat *to* the customer's number, pre-filled with order/delivery context).
- In confirmation and reminder emails.

This requires a human click on either end every time — it is not autonomous messaging, and the docs/UI should not imply otherwise.

## 5. Analytics Engine (Phase 3)

- Lightweight client-side event tracker (custom, no third-party SDK) fires `AnalyticsEvent` records on: product view, add-to-cart, wishlist add, checkout start, checkout complete.
- Anonymous sessions get a client-generated session ID (cookie); events link to `user_id` once logged in/identified.
- Admin dashboard aggregates: top viewed/wishlisted-but-not-purchased products, cart abandonment rate, funnel (view → add-to-cart → checkout start → purchase).
- No third-party analytics/ad pixels by default (keeps it self-contained and free); can be added later if Luwa wants marketing-specific tooling (e.g. Meta Pixel) — flagged as a future decision, not built now.

## 6. Security & Compliance Notes

- No raw card data stored anywhere in our database — only Paystack authorization tokens.
- Passwords hashed (bcrypt), never stored/logged in plaintext.
- Admin routes protected by role-based middleware; admin panel not discoverable/linked from customer-facing nav.
- Paystack webhook signature verification required on every incoming webhook call.
- HTTPS enforced everywhere (default on Netlify).
- Customer phone numbers are contact data, not payment data — stored in the standard `User`/`Order` tables, no special compliance regime beyond normal data handling care.
- Full detail in `docs/SECURITY.md`, including CSRF handling, admin 2FA recommendation, security headers, and dependency scanning.

## 7. Environments & Deployment

- **Dev:** local Next.js + a dedicated Neon **branch** (Neon's copy-on-write branching replaces the "separate project" isolation model — see Section 8.8) + Paystack **test mode** keys.
- **Staging:** Netlify Deploy Previews (from the `develop` branch and PRs) point at a Neon dev/staging branch, ideally a fresh branch per PR (Neon's GitHub integration or `neonctl branches create` in CI can automate this later).
- **Production:** Netlify deployment (deploying `main` via Netlify's GitHub integration) + Neon's production branch (`main` in Neon's default branch naming — worth renaming for clarity so it isn't confused with the git branch of the same name) + Paystack **live** keys + Resend production domain (requires domain verification, including SPF/DKIM/DMARC records, once Luwa has a domain).
- Environment variables (Paystack secret key, Resend API key, DB connection string, auth secret, Cloudinary/Upstash/Sentry credentials) managed via Netlify Site settings > Environment variables — never committed to source. See `.env.example` for the full list.

## 8. Reliability, Security & Operations

This section covers everything that keeps the site trustworthy once it's live, as distinct from Section 6-7's feature-level security notes — git workflow, CI/CD, rate limiting, caching, scaling, error visibility, and disaster recovery. These were originally left implicit in this document; they are now concretely scaffolded in the repository.

### 8.1 Git & version control
- Repo: `https://github.com/Jesus-Dani/lobyluwa`
- `main` = production (auto-deploys via Netlify's GitHub integration on every push). `develop` = staging/integration. Feature branches merge into `develop` first, then `develop` into `main`.
- No direct pushes to `main` without CI passing (see 8.2) — enforce via GitHub branch protection rules once the repo is live.

### 8.2 CI/CD
- `.github/workflows/ci.yml` runs lint, typecheck, and build on every PR and push to `main`/`develop`. This is the gate — nothing reaches production without passing it.
- A `test` job is wired in as a placeholder (`npm test --if-present`) so that once a test suite exists (starting with checkout/payment logic in Phase 1), it becomes a required check automatically rather than something that has to be remembered.
- Deployment itself is handled by Netlify's native GitHub integration (build command + `@netlify/plugin-nextjs`, declared in `netlify.toml`), not a custom Actions deploy step — avoids maintaining two competing deploy mechanisms. Netlify runs its own build on every push/PR in parallel with this workflow; this workflow is the fast fail-early gate, Netlify's build is what actually ships.
- `.github/dependabot.yml` opens weekly PRs for outdated/vulnerable npm and GitHub Actions dependencies.

### 8.3 Rate limiting
- `middleware.ts` uses Upstash Redis to rate-limit auth endpoints (5 requests/60s — brute-force protection) and checkout/installment/webhook endpoints (20 requests/60s — abuse/spam protection) by IP + path.
- Fails open (allows requests through) if Upstash isn't configured, so a missing env var doesn't take down the whole site — but this must be treated as a pre-launch requirement, not a permanent fallback.

### 8.4 Caching & CDN
- Static assets and product images (Cloudinary) are CDN-served by default via Netlify's global CDN — no work required.
- Product catalog/detail pages use Next.js ISR (`revalidate`), which Netlify's Next.js Runtime supports natively, rather than querying the database on every request — so traffic spikes don't translate 1:1 into database load.
- Cart, checkout, payment status, order history, and the admin dashboard are never cached — always read live, since stale data there is worse than a slower page load. Full detail in `docs/CACHING.md`.

### 8.5 Load balancing & scaling
- Netlify Functions (what Next.js API routes/server rendering compile down to on Netlify, AWS Lambda under the hood) auto-scale horizontally with no configuration.
- The real ceiling at this architecture's scale is Postgres connection limits, not compute — `prisma/schema.prisma` is configured with a pooled `DATABASE_URL` (Neon's PgBouncer-compatible pooled endpoint, hostname suffixed `-pooler`) for runtime queries and a separate unpooled `DIRECT_URL` (Neon's direct endpoint) for migrations, which is what prevents serverless function bursts from exhausting the database's connection limit. This matters at least as much on Netlify Functions as it would anywhere else — possibly more, given Lambda-style cold starts can multiply concurrent connection attempts.

### 8.6 Error tracking & logging
- Sentry is wired into client, server, and edge runtimes (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`), and `next.config.js` uploads source maps at build time.
- Without this, a production bug (e.g. a failed installment charge, a broken checkout step) would only surface via a customer complaint. With it, it surfaces as an alert.
- Error tracking alone is not sufficient for money-moving logic — see 8.9 on reconciliation for the gap this doesn't close.

### 8.7 Availability & disaster recovery
- `GET /api/health` checks both the app and the database connection — point an external uptime monitor (UptimeRobot or Better Uptime, both have usable free tiers) at it and alert on non-200 responses.
- Neon free tier: point-in-time restore via branching, but only across a limited history window (verify the current retention window in the Neon console — this has changed across plan revisions and is shorter than a paid plan's). A restore is done by creating a new branch from a timestamp/LSN before the incident, then pointing the app at it — conceptually different from Supabase's "restore a snapshot" model, but same effect: a mid-day incident can still lose data outside that window.
- The restore process is documented in `docs/DISASTER_RECOVERY.md` and should be run through once in a test environment before launch — an untested restore process isn't a real disaster recovery plan.
- Multi-region failover and zero-data-loss guarantees are explicitly out of scope at this stage — not justified for a single-owner store on free-tier infrastructure.
- **Deployment rollback** (distinct from data recovery): Netlify keeps every prior deploy and supports instant rollback (Deploys list > select a previous deploy > "Publish deploy") if a bad release reaches production — cheaper and faster than a database restore, and the first thing to reach for if a release breaks the site without touching data.

### 8.8 Environment isolation
- Dev, staging (Netlify Deploy Previews), and production must use **separate Neon branches** at minimum (Neon's copy-on-write branching is the mechanism here, replacing Supabase's "separate project" isolation model). A bug in a preview deployment (or a developer testing locally) must never be able to touch real customer orders or payment records — the production branch's `DATABASE_URL`/`DIRECT_URL` must never appear in a dev/preview environment's config.
- Branches are cheap on Neon's free tier, so the stronger version of this is a fresh branch per PR (auto-created from Neon's GitHub integration, auto-deleted on merge) rather than one shared long-lived dev branch — worth adopting once Phase 1 is further along; a single shared dev branch is the acceptable starting point.
- Paystack similarly has fully separate **test mode** and **live mode** keys — dev/staging always use test mode, production always uses live mode. Mixing these up (e.g. live keys in a preview deployment) is a real and easy mistake to make; worth a startup check that fails loudly if `NODE_ENV !== 'production'` and a live Paystack key is detected.

### 8.9 Idempotency & payment reconciliation
This is the gap most specific to a payments system, and the one I'd flag as highest-priority beyond what's already scaffolded:
- **Webhook idempotency:** Paystack can deliver the same webhook event more than once (retries on timeout, network blips). The webhook handler must check whether that `paystack_reference` has already been processed before marking an installment/order paid a second time — not yet implemented, needs to be there from the first line of webhook code.
- **Cron idempotency:** if the daily installment-auto-charge job runs twice (overlap, retry, manual re-trigger), it must not charge the same installment twice. Needs a lock/status-check (e.g. only charge installments still in `PENDING` status, and flip status *before* the async charge call returns, not after) baked into that job from day one.
- **Reconciliation job:** webhooks can, rarely, simply not arrive at all (not just duplicate) — a scheduled job (weekly to start) that pulls Paystack's transaction list via their API and diffs it against local `Installment`/`Order` records catches anything that slipped through silently. Without this, "the dashboard says unpaid" and "the money is actually in the account" can quietly drift apart, and nobody finds out until Luwa notices a mismatch in her bank balance.

### 8.10 Timezone correctness
Installment due dates, reminder emails, and the daily auto-charge cron all need to operate in a single, explicit timezone (West Africa Time, UTC+1) rather than whatever timezone the server happens to run in (Netlify Functions default to UTC). An off-by-one on this can mean a customer's card gets charged a day early, or a reminder email goes out at 2am their time — small thing, easy to get wrong, embarrassing when it's wrong on a payment.

### 8.11 Testing strategy
CI currently runs a placeholder test job with nothing to execute. For a site moving real money, the minimum bar before Phase 2 (installments) ships is: unit tests on the installment-splitting/scheduling math, an integration test that simulates a Paystack webhook hitting the handler twice (proving 8.9's idempotency actually holds), and an end-to-end test (e.g. Playwright) covering the full checkout path. "It built successfully" (what CI currently checks) is not the same as "the checkout flow works."

### 8.12 Account-level security (the consoles, not just the app)
Everything above protects the application. Equally important and easy to overlook: 2FA enabled on the actual Netlify, Neon, GitHub, Cloudinary, Resend, and Paystack dashboard accounts themselves. A compromised login to any one of these consoles is a more direct route to real money or customer data than any application-layer vulnerability — and unlike the app's own admin 2FA (docs/SECURITY.md), this one costs nothing and takes ten minutes per service.

### 8.13 Free-tier cost/usage monitoring
Every service in this stack is free-tier-to-start, which means every service also has a cliff — and Netlify's is the sharpest one in this stack to watch closely:

- **Netlify (accounts created from September 2025 onward, which this one is):** moved to a credit-based free plan — 300 credits/month, no overage, no auto-recharge. Roughly: ~15GB of bandwidth, ~20 production deploys, function compute at 10 credits/GB-hour with a **10-second execution timeout per function**, 1M edge function invocations included separately, 1 concurrent build. Critically: **hit the cap and every site on the account pauses until the next billing month, with no exceptions.** For an installment-payments site, that failure mode is not cosmetic — it means checkout itself goes down, not just slow performance. The 10-second function timeout is also worth flagging now: if the installment auto-charge cron or the Paystack reconciliation job ever needs to process many records in one run, it needs to be built to finish well under 10 seconds per invocation (batch/paginate rather than one long-running function), not assumed to have Vercel-style longer serverless limits.
- Neon: free tier is usage-based (compute hours + storage), not a flat cap like Supabase's — compute auto-suspends after inactivity (cold-start latency on the next request) and storage/compute-hour limits reset monthly; check the Neon console's usage page rather than assuming a fixed ceiling.
- Resend: 3,000 emails/month.
- Cloudinary: storage/bandwidth limits.
- Upstash: request limits.

None of these fail gracefully by default. Set usage alerts in each provider's dashboard where available (Netlify's usage page shows credit consumption in real time), and revisit this list — Netlify's credit budget especially — once the store has predictable traffic to weigh against a paid plan.

### 8.14 Legal & compliance content
Not an engineering task, but blocks launch regardless: Terms of Service, Privacy Policy, and a Returns/Refund policy need to exist as real pages, and the site's handling of customer personal data (phone numbers, addresses) should be reviewed against Nigeria's Data Protection Regulation (NDPR) — at minimum, a clear privacy policy covering what's collected and why, and a way for a customer to request account/data deletion. Flagging this so it doesn't get lost as "someone else's problem" — it needs an owner and a deadline like everything else here.

## 9. Phase-to-Architecture Mapping

| Phase | Systems touched |
|---|---|
| 0 (done) | Repo scaffold: git/GitHub, CI (lint/typecheck/build), rate limiting, security headers, Prisma schema + pooled DB connection (Neon), Sentry, health-check endpoint, backup/DR documentation |
| 0.5 (before Phase 1 build starts) | Dev/staging Neon branch provisioned, 2FA enabled on all provider dashboards, ToS/Privacy/Returns policy drafted, usage-alert thresholds set per provider |
| 1 | Auth, Product/Category/Variant, Cart, Order (one-time payment only), Paystack one-time checkout (test-mode keys), Resend order-confirmation email, Cloudinary product image upload, first Playwright checkout e2e test |
| 2 | PaymentPlan, Installment, PaystackAuthorization, scheduled cron jobs (WAT-aware), webhook + cron idempotency, weekly Paystack reconciliation job, Resend reminder templates, WhatsApp link generation |
| 3 | AnalyticsEvent + tracking client, admin dashboard (revenue/profit/inventory/customers/analytics), category management UI, admin action audit log |

Note: Phase 0 is infrastructure scaffolding only — config files, schema, and operational plumbing. It contains no application features yet; those begin in Phase 1. Phase 0.5 is account/process setup, not code.
