"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/money";
import { cloudinaryImageUrl } from "@/lib/cloudinary-url";
import styles from "./cart.module.css";

type VariantDetail = {
  id: string;
  size: string;
  color: string;
  stockQuantity: number;
  product: { id: string; slug: string; name: string; salePrice: number; images: string[]; status: string };
};

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [details, setDetails] = useState<Record<string, VariantDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setDetails({});
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/cart/items?ids=${items.map((i) => i.variantId).join(",")}`)
      .then((res) => res.json())
      .then((data: { variants: VariantDetail[] }) => {
        const map: Record<string, VariantDetail> = {};
        for (const variant of data.variants) map[variant.id] = variant;
        setDetails(map);
      })
      .finally(() => setLoading(false));
  }, [items]);

  const total = items.reduce((sum, item) => {
    const detail = details[item.variantId];
    return sum + (detail ? detail.product.salePrice * item.quantity : 0);
  }, 0);

  if (loading) {
    return <main className={styles.page}><p>Loading cart...</p></main>;
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h1>Your Cart</h1>
        <p className={styles.empty}>Your cart is empty.</p>
        <Link href="/products" className={styles.continueLink}>
          Continue shopping →
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1>Your Cart</h1>
      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map((item) => {
            const detail = details[item.variantId];
            if (!detail) return null;
            return (
              <div key={item.variantId} className={styles.item}>
                <div className={styles.itemImage}>
                  {detail.product.images[0] ? (
                    <Image
                      src={cloudinaryImageUrl(detail.product.images[0], 200)}
                      alt={detail.product.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/products/${detail.product.slug}`}>
                    <h3>{detail.product.name}</h3>
                  </Link>
                  <p className={styles.itemVariant}>
                    {detail.size} / {detail.color}
                  </p>
                  <p className={styles.itemPrice}>{formatNaira(detail.product.salePrice)}</p>
                </div>
                <div className={styles.itemQty}>
                  <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= detail.stockQuantity}
                  >
                    +
                  </button>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.variantId)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatNaira(total)}</span>
          </div>
          <Link href="/checkout" className={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
