# LO BY LUWA

E-commerce platform for LO BY LUWA — a customer storefront and an admin dashboard in a single Next.js application.

See [`docs/`](./docs) for the full product and technical specification:

- [`docs/PRD.md`](./docs/PRD.md) — product requirements
- [`docs/TRD.md`](./docs/TRD.md) — technical architecture
- [`docs/UI_Design_Brief.md`](./docs/UI_Design_Brief.md) — visual/brand design spec
- [`docs/SECURITY.md`](./docs/SECURITY.md) — application security posture
- [`docs/CACHING.md`](./docs/CACHING.md) — caching/CDN strategy
- [`docs/DISASTER_RECOVERY.md`](./docs/DISASTER_RECOVERY.md) — backups, monitoring, restore process

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** PostgreSQL via Neon + Prisma
- **Auth:** next-auth
- **Payments:** Paystack
- **Transactional email:** Resend
- **Image hosting:** Cloudinary
- **Rate limiting:** Upstash Redis
- **Error tracking:** Sentry
- **Hosting:** Netlify (via `@netlify/plugin-nextjs`, see `netlify.toml`)

## Getting started

```bash
npm install
cp .env.example .env
# fill in .env with real values — see the table below
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

App runs at `http://localhost:3000`.

## Environment variables

See `.env.example` for the full list. At minimum, local development needs:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string |
| `DIRECT_URL` | Direct (unpooled) Postgres connection string, used for migrations |
| `NEXTAUTH_SECRET` | Session encryption secret |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | Paystack API keys (use **test mode** keys locally) |
| `RESEND_API_KEY` | Transactional email |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Product image uploads/hosting |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations locally |
| `npm run prisma:deploy` | Apply migrations in production |

## Branching & deployment

- `main` — production. Every push auto-deploys via Netlify's GitHub integration (build config in `netlify.toml`).
- `develop` — staging/integration branch; Netlify Deploy Previews are generated for PRs against it.
- Feature branches → PR into `develop` → PR into `main`.
- `.github/workflows/ci.yml` runs lint, typecheck, and build on every PR and push — this must pass before merging. Netlify runs its own build in parallel; both must be green before a deploy is trusted.

## Monitoring

`GET /api/health` reports app + database status — see `docs/DISASTER_RECOVERY.md` for how to wire this up to an external uptime monitor.

## License

Proprietary — see [`LICENSE`](./LICENSE).
