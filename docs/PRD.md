# Product Requirements Document
## LO BY LUWA — E-commerce Platform

**Status:** Locked scope, pre-build
**Owner:** Luwa (single admin/business owner)
**Prepared:** July 2026

---

## 1. Overview

LO BY LUWA is a trendy, unisex fashion brand selling joggers, shirts, and face caps. This document defines the requirements for a two-interface e-commerce platform: a customer storefront and an admin/business management interface, built as a single Next.js application.

The site should feel premium and editorial rather than a generic template store — see the companion UI Design Brief for the full visual specification.

## 2. Goals

- Give customers a fast, trustworthy way to browse, buy, and pay for products online — in full or via installments — without WhatsApp being a bottleneck for the purchase itself.
- Give Luwa a single dashboard to run the entire business: inventory, orders, revenue, customers, and buying behavior — without spreadsheets or manual reconciliation.
- Keep delivery coordination human and personal (WhatsApp) while keeping payment and order tracking fully digital and automated.

## 3. Non-Goals (out of scope for this build)

- Multi-vendor or marketplace functionality (single brand only).
- International shipping or multi-currency support (Nigeria/NGN only).
- Automated WhatsApp messaging via the WhatsApp Business API (click-to-chat only — see TRD).
- Multiple admin/staff accounts with role permissions (single owner login only, for now).
- Native mobile apps (responsive web only).

## 4. Users

### 4.1 Customer
Fashion-conscious shoppers in Nigeria, buying joggers/shirts/face caps, browsing on mobile and desktop, price-sensitive enough that installment payment is a meaningful purchase driver, comfortable finishing delivery logistics over WhatsApp.

### 4.2 Admin (Luwa)
Sole operator: sources/photographs product, manages stock, fulfills orders, wants visibility into what's selling, who's buying, and what people almost bought but didn't.

## 5. Customer-Facing Features

### 5.1 Accounts
- Sign up / log in (email + password).
- Phone number required at account creation (used for WhatsApp delivery coordination).
- Profile: name, email, phone number (editable), saved addresses.

### 5.2 Storefront & Catalog
- Browse by category: Joggers, Shirts, Face Caps, New Arrivals, Best Sellers.
- Product detail pages: images, description, price, size/color variant selector, live stock status per variant.
- Search.

### 5.3 Cart & Checkout
- Add to cart, adjust quantity/variant, remove.
- Guest checkout is **not** offered — account required, since order history, installment tracking, and WhatsApp contact all depend on a customer record.
- Phone number re-confirmed at checkout (may differ from account phone, e.g. buying as a gift).
- Delivery address capture.
- Payment method: pay in full, or pay in installments (see Section 7).
- Order confirmation screen + confirmation email after successful payment.

### 5.4 Wishlist
- Add/remove products to a saved wishlist from product cards and product detail pages.
- Wishlist visible in account area; items can be moved to cart from there.

### 5.5 Order & Payment History
- List of past and current orders with status (processing, awaiting balance, paid, shipped, delivered, cancelled).
- Per-order payment history: amount paid, amount outstanding, next installment due date (if applicable), payment method used per transaction.
- Downloadable/viewable receipt per completed payment.

### 5.6 Notifications
- Order confirmation email after every successful payment (full or installment).
- Installment reminder emails ahead of each due date, and on/after the due date if unpaid.
- WhatsApp click-to-chat link surfaced to the customer post-checkout and in reminder emails, to finalize delivery details with Luwa directly.

## 6. Admin-Facing Features

### 6.1 Product & Catalog Management
- Create/edit/archive products: name, description, images, price, category, size/color variants.
- Organize and reorder categories.

### 6.2 Inventory Management
- Stock count per size/color variant.
- Low-stock indicator.
- Stock is held/reserved against an order from the moment it's placed until it's cancelled or fully paid + fulfilled (items are not released back to available stock while a payment plan is active and current).

### 6.3 Order Management
- View all orders, filter by status (processing, awaiting balance, paid, shipped, delivered, cancelled, at-risk).
- Per-order detail: customer info, items, variant, payment history, outstanding balance, delivery address, WhatsApp click-to-chat link to the customer.
- Manually mark an order as shipped/delivered (fulfillment stays manual — Luwa physically ships and updates status).
- "Needs attention" queue: orders with failed auto-charges, overdue installments, or unresponsive customers.

### 6.4 Sales, Revenue & Profit Dashboard
- Revenue over time (daily/weekly/monthly).
- Cost price per product (input by Luwa) vs. sale price → gross profit per product/order/period.
- Outstanding installment balances across all customers (money owed but not yet collected).
- Best-selling products/categories.

### 6.5 Customer Insights
- Customer list with order history, total spend, and installment repayment reliability.
- Repeat customer identification.
- Basic segmentation (e.g., high spenders, installment-only buyers, wishlist-heavy non-purchasers).

### 6.6 Behavioral Analytics
- Product views, add-to-cart events, wishlist adds, and checkout starts — including for sessions that never complete a purchase.
- Cart/checkout drop-off points.
- Most-viewed and most-wishlisted products that aren't converting to sales (signal for pricing/marketing decisions).

## 7. Installment Payments — Product Behavior

(Full technical mechanism is in the TRD; this section defines the customer- and business-facing behavior.)

- Installments are offered on all orders, to all customers, regardless of payment method.
- At checkout, customer chooses number of installments (e.g., 2–4 payments) and sees the schedule and amounts before confirming.
- **Card payments:** first installment charged immediately (with standard card authentication). Later installments are auto-charged on their due dates with no action needed from the customer, using a securely stored payment authorization from the first charge.
- **Bank transfer / USSD payments:** first installment paid via transfer. Later installments cannot be auto-charged (Paystack limitation — see TRD) — the customer instead receives an automated email with a fresh payment link on/before each due date.
- **No item ships until the order is paid in full.** Stock stays reserved against the order throughout the installment period.
- If an installment is missed, the customer gets automated reminder emails; if it stays unresolved, the order surfaces in Luwa's "needs attention" queue rather than silently failing.

## 8. Payments (General)

- Paystack integration for all on-site payments (cards, bank transfer, USSD as supported by Paystack in Nigeria).
- Receipts/confirmation emails issued automatically per successful payment via Resend.

## 9. Success Metrics

- % of orders paid via installment vs. full payment.
- Installment default/overdue rate.
- Cart/wishlist-to-purchase conversion rate.
- Repeat customer rate.
- Time Luwa spends on manual order/payment reconciliation (target: near zero, tracked qualitatively).

## 10. Phased Roadmap

**Phase 1 — Storefront core:** accounts, catalog, cart, checkout, Paystack one-time payments, fully styled to the UI Design Brief.

**Phase 2 — Installments & delivery coordination:** installment engine (card auto-charge + transfer fallback), automated reminder/confirmation emails via Resend, WhatsApp click-to-chat handoff.

**Phase 3 — Admin platform:** inventory management, full order management, sales/revenue/profit dashboard, customer insights, behavioral analytics, category management UI.

## 11. Open Items / Risks

- Installment default handling beyond the "needs attention" queue (e.g., formal cancellation/restocking policy after N days overdue) is not yet defined — recommend deciding before Phase 2 ships.
- Real product photography and final logo asset (transparent PNG) still pending — Phase 1 will ship with placeholder imagery.
- No multi-admin/staff accounts in this scope; revisit if the business grows beyond a single operator.
