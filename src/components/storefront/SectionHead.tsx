import Link from "next/link";
import styles from "./SectionHead.module.css";

export function SectionHead({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className={styles.sectionHead}>
      <h2>{title}</h2>
      {viewAllHref && <Link href={viewAllHref}>View all →</Link>}
    </div>
  );
}
