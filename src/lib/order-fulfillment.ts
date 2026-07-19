import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import { businessWhatsAppLink } from "@/lib/whatsapp";

/**
 * Verifies payment with Paystack and marks the order paid + sends the
 * confirmation email — shared by the webhook handler (the actual source
 * of truth, see docs/TRD.md 3.3) and the /checkout/callback page (which
 * calls this too so the customer doesn't have to wait on webhook
 * delivery latency for a confirmation screen). Idempotent either way:
 * a PENDING_PAYMENT status check guards against double-processing.
 */
export async function finalizeOrderIfPaid(orderId: string): Promise<"paid" | "already_paid" | "not_paid" | "not_found"> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { variant: { include: { product: true } } } },
    },
  });
  if (!order) return "not_found";
  if (order.status !== "PENDING_PAYMENT") return "already_paid";

  const verification = await verifyTransaction(orderId);
  if (verification.data.status !== "success" || verification.data.amount !== order.total) {
    return "not_paid";
  }

  // Re-check status right before writing — two near-simultaneous
  // callers (webhook + callback page) both reaching this point is the
  // race this guards against.
  const updated = await prisma.order.updateMany({
    where: { id: order.id, status: "PENDING_PAYMENT" },
    data: { status: "PAID" },
  });
  if (updated.count === 0) return "already_paid";

  const orderSummary = order.items
    .map((item) => `${item.quantity}x ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`)
    .join(", ");

  await sendOrderConfirmationEmail({
    to: order.user.email,
    customerName: order.user.name,
    orderId: order.id,
    items: order.items.map((item) => ({
      name: item.variant.product.name,
      size: item.variant.size,
      color: item.variant.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    total: order.total,
    whatsappLink: businessWhatsAppLink(`Hi! I just placed order #${order.id.slice(-8).toUpperCase()}: ${orderSummary}`),
  });

  return "paid";
}
