"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products?category=joggers", label: "Joggers" },
  { href: "/products?category=shirts", label: "Shirts" },
  { href: "/products?category=face-caps", label: "Face Caps" },
  { href: "/products?sort=new", label: "New Arrivals" },
  { href: "/products?sort=featured", label: "Best Sellers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { totalCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoMark}>
          <div className={styles.logoText}>
            <span className={styles.lo}>LO</span>
            <span className={styles.by}>BY LUWA</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerIcons}>
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="search"
                autoFocus
                placeholder="Search products..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
              />
            </form>
          ) : (
            <button className={styles.iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          )}
          <Link href={session ? "/account" : "/login"} className={styles.iconBtn} aria-label="Account">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
          </Link>
          <Link href="/account?tab=wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.4 5c2 0 3.4 1.1 4.1 2.3.4.7.6 1 .9 1.7.3-.7.5-1 .9-1.7C12 5.1 13.4 4 15.4 4c3.4 0 5 3.4 3.4 6.7C16.3 16.4 12 21 12 21z" />
            </svg>
          </Link>
          <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h2l2.2 11.2a2 2 0 002 1.8h7.6a2 2 0 002-1.7L21 8H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>
            {totalCount > 0 && <span className={styles.badge}>{totalCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
