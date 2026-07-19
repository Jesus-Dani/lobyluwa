import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import styles from "../../account.module.css";
import ordersStyles from "../orders.module.css";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } }, address: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <main className={styles.page}>
      <h1>Order #{order.id.slice(-8).toUpperCase()}</h1>
      <p className={ordersStyles.receiptMeta}>
        Placed {order.createdAt.toLocaleDateString("en-NG")} — Status: {order.status}
      </p>

      <div className={ordersStyles.receipt}>
        {order.items.map((item) => (
          <div key={item.id} className={ordersStyles.receiptRow}>
            <span>
              {item.quantity}× {item.variant.product.name} ({item.variant.size}/{item.variant.color})
            </span>
            <span>{formatNaira(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className={`${ordersStyles.receiptRow} ${ordersStyles.receiptTotal}`}>
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </div>

      <div className={ordersStyles.deliveryBlock}>
        <h2>Delivery Address</h2>
        <p>
          {order.address.recipientName}, {order.address.street}, {order.address.city}, {order.address.state}
        </p>
        <p>Phone: {order.phoneNumberAtCheckout}</p>
      </div>
    </main>
  );
}
