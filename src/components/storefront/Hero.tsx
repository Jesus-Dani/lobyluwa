import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div>
          <p className={styles.eyebrow}>Cozy. Confident. Everyday.</p>
          <h1>Comfort that moves with you.</h1>
          <p className={styles.supporting}>
            Joggers, shirts and face caps designed for every day — timeless essentials, made to last, for everyone.
          </p>
          <div className={styles.btnRow}>
            <Link href="/products?category=joggers" className={styles.btnPrimary}>
              Shop Joggers
            </Link>
            <Link href="/products?category=shirts" className={styles.btnSecondary}>
              Shop Shirts
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={`${styles.flatlay} ${styles.tall}`}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
              <path d="M8 3h8l1 4-3 2v12H10V9L7 7z" />
            </svg>
            <span>Jogger — Product Photo</span>
          </div>
          <div className={`${styles.flatlay} ${styles.dark}`}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
              <path d="M6 4l3-1 3 2 3-2 3 1-2 4v13H8V8z" />
            </svg>
            <span>Shirt — Product Photo</span>
          </div>
          <div className={`${styles.flatlay} ${styles.brown}`}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
              <path d="M3 13a9 9 0 0118 0M3 13v2a2 2 0 002 2h1M21 13v2a2 2 0 01-2 2h-1" />
            </svg>
            <span>Face Cap — Product Photo</span>
          </div>
          <div className={styles.placeholderTag}>Placeholder imagery</div>
        </div>
      </div>
    </section>
  );
}
