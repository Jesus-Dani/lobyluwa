import { Resend } from "resend";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
  total: number;
  whatsappLink: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "orders@lobyluwa.com",
    to: params.to,
    subject: "Your LO BY LUWA order is confirmed",
    react: OrderConfirmationEmail({
      customerName: params.customerName,
      orderId: params.orderId,
      items: params.items,
      total: params.total,
      whatsappLink: params.whatsappLink,
    }),
  });
}
