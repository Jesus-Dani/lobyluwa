import styles from "./BenefitsStrip.module.css";

const BENEFITS = [
  {
    title: "Fast Delivery",
    description: "Quick delivery to your door",
    path: "M3 7h11v8H3zM14 10h4l3 3v2h-7z",
  },
  {
    title: "Easy Returns",
    description: "Hassle-free returns within 7 days",
    path: "M3 12a9 9 0 109-9M3 12l4-4M3 12l4 4",
  },
  {
    title: "Premium Quality",
    description: "Quality you can trust",
    path: "M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z",
  },
  {
    title: "Secure Payment",
    description: "Safe checkout via Paystack",
    path: "",
  },
];

export function BenefitsStrip() {
  return (
    <section className={styles.benefits}>
      <div className={styles.benefitsGrid}>
        {BENEFITS.map((benefit) => (
          <div className={styles.benefit} key={benefit.title}>
            <div className={styles.benefitIcon}>
              {benefit.title === "Secure Payment" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d={benefit.path} />
                </svg>
              )}
            </div>
            <div>
              <h5>{benefit.title}</h5>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
