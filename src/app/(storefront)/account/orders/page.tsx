import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import styles from "../account.module.css";
import ordersStyles from "./orders.module.css";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  AWAITING_BALANCE: "Awaiting Balance",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  AT_RISK: "Needs Attention",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <main className={styles.page}>
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className={ordersStyles.list}>
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className={ordersStyles.orderRow}>
              <div>
                <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                <span className={ordersStyles.date}>{order.createdAt.toLocaleDateString("en-NG")}</span>
              </div>
              <span className={`${ordersStyles.status} ${ordersStyles[order.status.toLowerCase()] ?? ""}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span>{order.items.length} item(s)</span>
              <span>{formatNaira(order.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
