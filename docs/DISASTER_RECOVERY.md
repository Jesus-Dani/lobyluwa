# Availability & Disaster Recovery

## Uptime monitoring
`GET /api/health` checks the app *and* the database connection and returns `503` if either is broken. Point a free external monitor at it:

1. Sign up for [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors, 5-minute interval) or [Better Uptime](https://betteruptime.com) (free tier available).
2. Add an HTTP(S) monitor for `https://<your-domain>/api/health`, expected status `200`.
3. Set alert contact to Luwa's email (and phone, if the tool supports SMS on the free tier).

Without this step, an outage is only discovered when a customer complains — this is the single highest-priority item to set up before real traffic.

## Database backups
- **Supabase (free tier):** daily backups, retained 7 days, restorable via the dashboard. No point-in-time recovery on free tier — a mid-day incident can lose up to a day of data. Point-in-time recovery is a paid-tier upgrade, worth revisiting once the store has real order volume.
- **Neon (free tier):** similar daily-snapshot model; check current plan limits before committing, as free-tier retention windows change over time.

**Action before launch:** confirm which provider is used (Supabase vs. Neon — TRD lists both as options) and document the actual backup window and restore steps for that provider specifically, since the two differ.

## Restore process (to be tested, not just documented)
1. Identify the last known-good backup timestamp from the provider dashboard.
2. Restore to a **new** database instance first — never restore directly over the live production database.
3. Point a staging deployment at the restored instance and verify order/payment data looks correct.
4. Only then cut production over, and only with Luwa's explicit sign-off given this touches real customer orders and payment records.

This process should be **run through once in a test environment** before launch, not left as untested theory — an untested restore process is not a real disaster recovery plan.

## Payment data specifically
Paystack remains the system of record for actual money movement (our database only stores references/status, never funds). If our database were lost entirely between backups, the Paystack dashboard/API can be used to reconcile which charges actually succeeded — this is a manual, painful process, which is exactly why the backup/monitoring steps above matter.

## What's explicitly out of scope for now
Multi-region failover, automated database replicas, and zero-data-loss (RPO=0) guarantees are enterprise-scale concerns not justified by a single-owner store on free-tier infrastructure. Revisit if/when order volume and revenue justify the cost of paid-tier point-in-time recovery.
