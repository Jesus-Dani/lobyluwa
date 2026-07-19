import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getToken } from "next-auth/jwt";

/**
 * Rate limiting for auth and payment-adjacent routes.
 *
 * Requires UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN to be set
 * (free tier at upstash.com). Without them, this middleware fails open
 * (allows the request through) rather than breaking the whole site —
 * that trade-off is intentional but should be treated as a "must set
 * before launch" item, not a permanent fallback.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Stricter limit on auth endpoints (brute-force login/signup protection).
const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:auth",
    })
  : null;

// Looser limit on checkout/payment endpoints (abuse/spam protection,
// not meant to interfere with a real customer completing a purchase).
const paymentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      prefix: "ratelimit:payment",
    })
  : null;

// next-auth v4's actual sign-in routes are /api/auth/signin and
// /api/auth/callback/* — /api/auth/register is our own custom route.
const AUTH_PATHS = ["/api/auth/signin", "/api/auth/callback", "/api/auth/register"];
const PAYMENT_PATHS = ["/api/checkout", "/api/installments", "/api/webhooks/paystack"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Admin routes are not just unlinked from customer-facing nav (see
  // docs/TRD.md section 6) — they're actively gated here so a guessed
  // URL isn't enough to reach them.
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  let limiter: Ratelimit | null = null;
  if (matchesPrefix(pathname, AUTH_PATHS)) limiter = authLimiter;
  else if (matchesPrefix(pathname, PAYMENT_PATHS)) limiter = paymentLimiter;

  if (limiter) {
    const { success, limit, remaining, reset } = await limiter.limit(`${pathname}:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/checkout/:path*",
    "/api/installments/:path*",
    "/api/webhooks/:path*",
    "/admin/:path*",
  ],
};
