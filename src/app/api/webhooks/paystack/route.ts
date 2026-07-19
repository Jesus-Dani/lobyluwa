import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { finalizeOrderIfPaid } from "@/lib/order-fulfillment";

// Webhook is the source of truth for payment state (see docs/TRD.md 3.3),
// not the client-side /checkout/callback redirect — Paystack can also
// deliver the same event more than once (retries on timeout/network
// blips), so finalizeOrderIfPaid() is idempotent (docs/TRD.md 8.9).
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.reference as string;
  const result = await finalizeOrderIfPaid(reference);

  if (result === "not_found") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ received: true, result });
}
