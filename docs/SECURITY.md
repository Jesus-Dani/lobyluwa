# Application Security

## Headers
Set globally in `next.config.js`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, and a `Content-Security-Policy` scoped to only the third parties this site actually calls (Cloudinary for images, Paystack for checkout, Google Fonts). Tighten the CSP further once the exact set of third-party scripts is finalized — `'unsafe-inline'` on `script-src` is a placeholder, not a final answer, and should be replaced with nonces/hashes before launch.

## CSRF
`next-auth` handles CSRF protection natively for its own sign-in/sign-out flow (token embedded in the session). For custom API routes that mutate state (checkout, installment actions, admin product edits), verify the request's `Origin`/`Referer` header matches our own domain, in addition to requiring an authenticated session — this is not yet implemented in route handlers and should be added as those routes are built in Phase 1/2.

## Passwords & sessions
Passwords hashed with bcrypt (never stored or logged in plaintext). Sessions managed by `next-auth`, httpOnly cookies, not accessible to client-side JS.

## Admin account hardening
Single admin login (per PRD) is a bigger single point of failure than a normal customer account — if that one login is compromised, the entire business (inventory, orders, revenue data) is exposed. Recommend adding TOTP-based 2FA (e.g. via `next-auth`'s email/authenticator provider, or a dedicated library like `otplib`) specifically on the admin login before launch, even though customer accounts don't need it.

## Payment data
No raw card data ever touches our server or database — Paystack's hosted checkout handles card entry, and we only ever store the `authorization_code` token it returns (see `PaystackAuthorization` in the Prisma schema). This keeps PCI scope minimal by design, not as an afterthought.

## Dependency scanning
`.github/dependabot.yml` opens a weekly PR for any outdated/vulnerable npm package. These PRs need someone to actually review and merge them — enabling Dependabot is necessary but not sufficient on its own.

## Input validation
All API route inputs should be validated with `zod` (already a dependency) before touching the database — not yet implemented since the routes themselves don't exist yet, but should be a non-negotiable pattern from the first route written, especially on checkout/installment endpoints handling money.
