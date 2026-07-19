import { NextRequest } from "next/server";

/**
 * CSRF guard for plain Route Handlers (POST endpoints that mutate state
 * but aren't Server Actions, so they don't get Next.js's built-in
 * Origin-header check for free) — see docs/SECURITY.md.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
