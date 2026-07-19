import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import { StatusToggle } from "./StatusToggle";
import styles from "./products.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div>
      <div className={styles.header}>
        <h1>Products</h1>
        <Link href="/admin/products/new" className={styles.newBtn}>
          + New Product
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Featured</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category.name}</td>
                <td>{formatNaira(product.salePrice)}</td>
                <td>{totalStock}</td>
                <td>
                  <StatusToggle productId={product.id} status={product.status as "active" | "archived"} />
                </td>
                <td>{product.featured ? "★" : ""}</td>
                <td>
                  <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
