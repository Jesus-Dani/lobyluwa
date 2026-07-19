import { ProductCard, ProductCardData } from "./ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return <p className={styles.empty}>No products found.</p>;
  }
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
