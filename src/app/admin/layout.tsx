import Link from "next/link";
import styles from "./layout.module.css";

// Route protection itself happens in middleware.ts (role check on
// /admin/*) — this layout is just the shell, not the guard.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <h2>LO BY LUWA Admin</h2>
        <nav>
          <Link href="/admin/products">Products</Link>
          <Link href="/">← Back to storefront</Link>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
