"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/money";
import { cloudinaryImageUrl } from "@/lib/cloudinary-url";
import { toggleWishlist } from "@/actions/wishlist";
import styles from "./ProductCard.module.css";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  salePrice: number;
  images: string[];
  isWishlisted: boolean;
  variants: { id: string; stockQuantity: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [wishlisted, setWishlisted] = useState(product.isWishlisted);
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const firstInStockVariant = product.variants.find((variant) => variant.stockQuantity > 0);

  function handleQuickAdd() {
    if (!firstInStockVariant) return;
    addItem(firstInStockVariant.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleWishlistClick() {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setWishlisted((prev) => !prev);
    startTransition(async () => {
      const result = await toggleWishlist(product.id);
      if (result?.error) setWishlisted((prev) => !prev);
    });
  }

  return (
    <div className={styles.productCard}>
      <Link href={`/products/${product.slug}`} className={styles.productMedia}>
        {product.images[0] ? (
          <Image src={cloudinaryImageUrl(product.images[0], 500)} alt={product.name} fill sizes="(max-width: 960px) 50vw, 25vw" style={{ objectFit: "cover" }} />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M8 3h8l1 4-3 2v12H10V9L7 7z" />
          </svg>
        )}
      </Link>
      <button
        className={styles.wishlistHeart}
        aria-label="Toggle wishlist"
        onClick={handleWishlistClick}
        disabled={isPending}
      >
        <svg viewBox="0 0 24 24" strokeWidth="2" fill={wishlisted ? "var(--burgundy)" : "none"}>
          <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.4 5c2 0 3.4 1.1 4.1 2.3.4.7.6 1 .9 1.7.3-.7.5-1 .9-1.7C12 5.1 13.4 4 15.4 4c3.4 0 5 3.4 3.4 6.7C16.3 16.4 12 21 12 21z" />
        </svg>
      </button>
      <div className={styles.productInfo}>
        <Link href={`/products/${product.slug}`}>
          <h4>{product.name}</h4>
        </Link>
        <div className={styles.price}>{formatNaira(product.salePrice)}</div>
        <button className={styles.quickAdd} onClick={handleQuickAdd} disabled={!firstInStockVariant}>
          {!firstInStockVariant ? "Sold Out" : justAdded ? "Added ✓" : "Quick Add"}
        </button>
      </div>
    </div>
  );
}
