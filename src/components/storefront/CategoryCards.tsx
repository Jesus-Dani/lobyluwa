import Link from "next/link";
import styles from "./CategoryCards.module.css";

const CARDS = [
  {
    href: "/products?category=joggers",
    label: "Joggers",
    description: "Relaxed fits. Everyday comfort.",
    variant: "cat1",
    path: "M8 3h8l1 4-3 2v12H10V9L7 7z",
  },
  {
    href: "/products?category=shirts",
    label: "Shirts",
    description: "Everyday staples, always on point.",
    variant: "cat2",
    path: "M6 4l3-1 3 2 3-2 3 1-2 4v13H8V8z",
  },
  {
    href: "/products?category=face-caps",
    label: "Face Caps",
    description: "Fresh pieces. New energy.",
    variant: "cat3",
    path: "M3 13a9 9 0 0118 0M3 13v2a2 2 0 002 2h1M21 13v2a2 2 0 01-2 2h-1",
  },
  {
    href: "/products?sort=featured",
    label: "Best Sellers",
    description: "Loved by many. For a reason.",
    variant: "cat4",
    path: "M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z",
  },
];

export function CategoryCards() {
  return (
    <section className={styles.categories}>
      <div className={styles.catGrid}>
        {CARDS.map((card) => (
          <Link key={card.label} href={card.href} className={`${styles.catCard} ${styles[card.variant]}`}>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d={card.path} />
              </svg>
              <h3>{card.label}</h3>
              <p>{card.description}</p>
            </div>
            <div className={styles.arrow}>→</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
