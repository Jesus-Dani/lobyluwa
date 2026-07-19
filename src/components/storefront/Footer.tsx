import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <div className={styles.logoText}>
            <span className={styles.lo}>LO</span>
            <span className={styles.by}>BY LUWA</span>
          </div>
          <p>Comfort that moves with you. For every body. Every day.</p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </a>
            <a href="#" className={styles.socialIcon} aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 3v9.5a3.5 3.5 0 11-3.5-3.5" />
                <path d="M16 3c0 2.5 2 4.5 4.5 4.5" />
              </svg>
            </a>
            <a href="#" className={styles.socialIcon} aria-label="X">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4l16 16M20 4L4 20" />
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.footerCol}>
          <h6>Shop</h6>
          <ul>
            <li><Link href="/products?category=joggers">Joggers</Link></li>
            <li><Link href="/products?category=shirts">Shirts</Link></li>
            <li><Link href="/products?category=face-caps">Face Caps</Link></li>
            <li><Link href="/products?sort=new">New Arrivals</Link></li>
            <li><Link href="/products?sort=featured">Best Sellers</Link></li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h6>Customer Care</h6>
          <ul>
            <li><Link href="/account/orders">Track Order</Link></li>
            <li><Link href="/contact">Returns &amp; Exchanges</Link></li>
            <li><Link href="/contact">FAQs</Link></li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h6>About</h6>
          <ul>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h6>Need Help?</h6>
          <ul className={styles.footerContact}>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.4 2.1L8 9.9a16 16 0 006 6l1.5-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.7.6a2 2 0 011.7 2.1z" />
              </svg>
              <span>+234 800 123 4567</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <span>hello@lobyluwa.com</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.3" />
              </svg>
              <span>Lagos, Nigeria</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>© {new Date().getFullYear()} LO BY LUWA. All rights reserved.</div>
    </footer>
  );
}
