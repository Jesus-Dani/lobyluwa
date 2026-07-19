"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Product, ProductVariant, Category } from "@prisma/client";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/money";
import { cloudinaryImageUrl } from "@/lib/cloudinary-url";
import { toggleWishlist } from "@/actions/wishlist";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SectionHead } from "@/components/storefront/SectionHead";
import { ProductCardData } from "@/components/storefront/ProductCard";
import styles from "./ProductDetail.module.css";

type ProductWithRelations = Product & { category: Category; variants: ProductVariant[] };

export function ProductDetail({
  product,
  isWishlisted: initialWishlisted,
  relatedProducts,
}: {
  product: ProductWithRelations;
  isWishlisted: boolean;
  relatedProducts: ProductCardData[];
}) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.stockQuantity > 0)?.id ?? product.variants[0]?.id
  );
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;

  function handleAddToCart() {
    if (!selectedVariantId || !inStock) return;
    addItem(selectedVariantId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
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
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.gallery}>
          {product.images[0] ? (
            <div className={styles.mainImage}>
              <Image src={cloudinaryImageUrl(product.images[0], 800)} alt={product.name} fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div className={`${styles.mainImage} ${styles.placeholder}`}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2">
                <path d="M8 3h8l1 4-3 2v12H10V9L7 7z" />
              </svg>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.category}>{product.category.name}</p>
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatNaira(product.salePrice)}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.variants}>
            <span className={styles.variantsLabel}>Size / Color</span>
            <div className={styles.variantOptions}>
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  className={`${styles.variantOption} ${selectedVariantId === variant.id ? styles.variantSelected : ""}`}
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={variant.stockQuantity === 0}
                >
                  {variant.size} / {variant.color}
                  {variant.stockQuantity === 0 && " — Sold out"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.addToCart} onClick={handleAddToCart} disabled={!inStock}>
              {!inStock ? "Sold Out" : added ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button className={styles.wishlistBtn} onClick={handleWishlistClick} disabled={isPending}>
              <svg viewBox="0 0 24 24" strokeWidth="2" fill={wishlisted ? "var(--burgundy)" : "none"} stroke="var(--burgundy)">
                <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.4 5c2 0 3.4 1.1 4.1 2.3.4.7.6 1 .9 1.7.3-.7.5-1 .9-1.7C12 5.1 13.4 4 15.4 4c3.4 0 5 3.4 3.4 6.7C16.3 16.4 12 21 12 21z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section style={{ marginTop: 72 }}>
          <SectionHead title="You may also like" />
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </main>
  );
}
