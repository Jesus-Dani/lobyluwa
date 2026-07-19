# Availability & Disaster Recovery

## Uptime monitoring
`GET /api/health` checks the app *and* the database connection and returns `503` if either is broken. Point a free external monitor at it:

1. Sign up for [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors, 5-minute interval) or [Better Uptime](https://betteruptime.com) (free tier available).
2. Add an HTTP(S) monitor for `https://<your-domain>/api/health`, expected status `200`.
3. Set alert contact to Luwa's email (and phone, if the tool supports SMS on the free tier).

Without this step, an outage is only discovered when a customer complains — this is the single highest-priority item to set up before real traffic.

## Database backups (Neon)
Neon doesn't do "snapshot backups" the way Supabase does — recovery works through **branching from point-in-time history**. Free tier retains a limited history window (verify the current window in the Neon console — this has changed across plan revisions), inside which you can create a new branch as of any timestamp/LSN before an incident. Outside that window, that history is gone — no separate PITR upgrade to reach for, the retention window itself is the limit.

**Action before launch:** confirm the current history-retention window in the Neon console and note the exact restore steps here once verified by actually running through them.

## Restore process (to be tested, not just documented)
1. Identify the last known-good timestamp (just before the incident) from the Neon console's branch history.
2. Create a **new branch** from that timestamp — never restore by rewriting the live production branch in place.
3. Point a staging deployment at the new branch's connection string and verify order/payment data looks correct.
4. Only then repoint production's `DATABASE_URL`/`DIRECT_URL` at the new branch (or promote it), and only with Luwa's explicit sign-off given this touches real customer orders and payment records.

This process should be **run through once in a test environment** before launch, not left as untested theory — an untested restore process is not a real disaster recovery plan.

## Payment data specifically
Paystack remains the system of record for actual money movement (our database only stores references/status, never funds). If our database were lost entirely between backups, the Paystack dashboard/API can be used to reconcile which charges actually succeeded — this is a manual, painful process, which is exactly why the backup/monitoring steps above matter.

## Bad deploy (not a data problem)
If a release breaks the site but the data is fine, don't reach for a database restore — use Netlify's instant rollback to a previous deploy first (Netlify dashboard > Deploys > select a previous deploy > "Publish deploy"). This is faster and safer than any data-recovery step and covers most "the site is broken" incidents.

## Environment isolation
Dev/staging and production must run on **separate Neon branches**, at minimum. This repo's dev environment should never be pointed at the production `DATABASE_URL`/`DIRECT_URL` — a local mistake (e.g. a seed script, a bad migration test) must not be able to touch real orders or payment records.

## What's explicitly out of scope for now
Multi-region failover, automated database replicas, and zero-data-loss (RPO=0) guarantees are enterprise-scale concerns not justified by a single-owner store on free-tier infrastructure. Revisit if/when order volume and revenue justify the cost of paid-tier point-in-time recovery.
