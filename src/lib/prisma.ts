import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Neon's pooled endpoint over WebSocket (port 443), not raw Postgres TCP
// (port 5432) — required on networks that block 5432 outbound, and is
// Neon's own recommended setup for serverless/edge deployments generally.
// `Pool` (not the plain `neon()` HTTP tag) is required here so that
// `prisma.$transaction` (used for the atomic order-creation + stock-
// decrement at checkout) actually works.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Reuse a single client across Next.js hot-reloads in dev — otherwise
// every file change spawns a new pool/connection.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
