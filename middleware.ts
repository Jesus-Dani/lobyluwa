import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

const AUTH_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/reset-password"];
const PAYMENT_PATHS = ["/api/checkout", "/api/installments", "/api/webhooks/paystack"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

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
  matcher: ["/api/auth/:path*", "/api/checkout/:path*", "/api/installments/:path*", "/api/webhooks/:path*"],
};
