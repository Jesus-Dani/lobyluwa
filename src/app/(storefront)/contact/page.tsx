import styles from "../static-page.module.css";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <h1>Contact</h1>
      <p>Questions about an order, sizing, or delivery? Reach us directly:</p>
      <ul className={styles.contactList}>
        <li>Email: hello@lobyluwa.com</li>
        <li>Phone: +234 800 123 4567</li>
        <li>Based in Lagos, Nigeria</li>
      </ul>
    </main>
  );
}
