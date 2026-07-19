import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProductCards, PRODUCT_CARD_SELECT } from "@/lib/products";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { AddressList } from "./AddressList";
import styles from "./account.module.css";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const { tab = "profile" } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) redirect("/login");

  let wishlistCards = null;
  if (tab === "wishlist") {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { product: { select: PRODUCT_CARD_SELECT } },
      orderBy: { addedAt: "desc" },
    });
    wishlistCards = await toProductCards(wishlistItems.map((item) => item.product));
  }

  return (
    <main className={styles.page}>
      <h1>My Account</h1>
      <div className={styles.tabs}>
        <Link href="/account?tab=profile" className={tab === "profile" ? styles.tabActive : ""}>
          Profile
        </Link>
        <Link href="/account?tab=addresses" className={tab === "addresses" ? styles.tabActive : ""}>
          Addresses
        </Link>
        <Link href="/account?tab=wishlist" className={tab === "wishlist" ? styles.tabActive : ""}>
          Wishlist
        </Link>
        <Link href="/account/orders">Orders</Link>
      </div>

      {tab === "profile" && (
        <div className={styles.section}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phoneNumber}</p>
        </div>
      )}

      {tab === "addresses" && (
        <div className={styles.section}>
          <AddressList addresses={user.addresses} />
        </div>
      )}

      {tab === "wishlist" && wishlistCards && (
        <div className={styles.section}>
          <ProductGrid products={wishlistCards} />
        </div>
      )}
    </main>
  );
}
