import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Uptime-monitor target. Point an external monitor (e.g. UptimeRobot,
 * Better Uptime — both have usable free tiers) at GET /api/health and
 * alert on non-200 responses or timeouts. This is what closes the
 * "an outage could go unnoticed" gap: without an external check hitting
 * this route on an interval, nobody finds out the site is down until a
 * customer complains.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
