import Link from "next/link";
import { finalizeOrderIfPaid } from "@/lib/order-fulfillment";
import styles from "./callback.module.css";

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <main className={styles.page}>
        <h1>Something went wrong</h1>
        <p>We couldn&apos;t find your payment reference. If you were charged, contact us on WhatsApp.</p>
      </main>
    );
  }

  const result = await finalizeOrderIfPaid(reference);

  if (result === "paid" || result === "already_paid") {
    return (
      <main className={styles.page}>
        <div className={styles.icon}>✓</div>
        <h1>Order confirmed!</h1>
        <p>Thank you — your payment was successful. A confirmation email is on its way.</p>
        <Link href="/account/orders" className={styles.link}>
          View your orders →
        </Link>
      </main>
    );
  }

  if (result === "not_found") {
    return (
      <main className={styles.page}>
        <h1>Order not found</h1>
        <p>We couldn&apos;t locate that order. If you were charged, contact us on WhatsApp.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1>Payment not confirmed</h1>
      <p>We couldn&apos;t confirm this payment yet. If money left your account, it will reflect shortly — contact us if it doesn&apos;t.</p>
      <Link href="/products" className={styles.link}>
        Continue shopping →
      </Link>
    </main>
  );
}
