"use client";

import { useState } from "react";
import styles from "./Newsletter.module.css";

// Cosmetic only for Phase 1 — no email-marketing backend is in scope
// (not part of PRD.md's feature list). Revisit if Luwa wants a real
// newsletter integration later.
export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className={styles.newsletter}>
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterLeft}>
          <div className={styles.mailIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <div>
            <h3>Stay in the loop.</h3>
            <p>Be the first to know about new drops, exclusive offers and more.</p>
          </div>
        </div>
        {submitted ? (
          <p className={styles.thanks}>Thanks — you&apos;re on the list!</p>
        ) : (
          <form
            className={styles.newsletterForm}
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}
