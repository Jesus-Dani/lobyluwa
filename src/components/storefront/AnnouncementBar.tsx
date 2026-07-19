import styles from "./AnnouncementBar.module.css";

export function AnnouncementBar() {
  return (
    <div className={styles.announce}>
      <span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
          <circle cx="7.5" cy="18.5" r="1.5" />
          <circle cx="17.5" cy="18.5" r="1.5" />
        </svg>
        FREE SHIPPING ON ORDERS OVER ₦50,000
      </span>
    </div>
  );
}
