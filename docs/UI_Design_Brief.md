# UI Design Brief
## LO BY LUWA — E-commerce Website

Adapted from the original Fashion E-commerce UI Design Brief and inspo mockup, with brand-specific decisions locked in.

---

## 1. Project Overview

Design a modern, premium, Pinterest-inspired e-commerce website for LO BY LUWA, a unisex fashion brand selling joggers, shirts, and face caps. The visual identity should strike a balance between masculine and feminine aesthetics while staying warm, cozy, sophisticated, and vibrant.

The website should feel editorial rather than commercial. Prioritize whitespace, clean typography, large product imagery, and a premium shopping experience.

## 2. Design Direction

**Keywords:** cozy, relaxed, sophisticated, premium, modern, editorial, Pinterest aesthetic, lifestyle, minimal, unisex, fashion-forward.

**Avoid:** overly feminine, playful/childish, cluttered, corporate.

The experience should appeal equally to men and women — the brand is unisex by design, not gendered by section.

## 3. Design Philosophy

Products remain the hero. The site's colours establish brand identity independently of product photography — don't rely on product colours to make the interface feel vibrant. The UI itself communicates the branding.

## 4. Logo

Wordmark: an elegant serif "L" and "O" (forming "LO"), with a thin diagonal accent line crossing through, and "BY LUWA" letter-spaced beneath in a lighter weight.

**Critical usage rule:** the logo file must be used with its background fully removed (transparent PNG) — it should sit directly on whatever surface it's placed on (white header, blush hero panel, charcoal footer) with no visible card, box, or background edge. It should read as ink on the page, not as a pasted image. Until the final transparent asset is integrated, the header/footer use a CSS/SVG-recreated version of the wordmark as a placeholder.

## 5. Colour Palette

| Role | Hex | Name |
|---|---|---|
| Primary Background | `#FFFFFF` | White |
| Secondary Background | `#FFE5EC` | Soft Pink |
| Primary Brand | `#660019` | Burgundy |
| Supporting Neutral | `#442913` | Chocolate |
| Dark Neutral | `#3B3B3B` | Charcoal |
| Accent | `#FB6F92` | Vibrant Pink |

**Distribution:** White 45%, Soft Pink 20%, Burgundy 15%, Charcoal 15%, Chocolate 3%, Vibrant Pink 2%. Interface should still read as mostly white/neutral.

**Usage:**
- *White* — page backgrounds, product sections, cards, navigation.
- *Soft Pink* — hero background, promotional sections, newsletter, soft dividers.
- *Burgundy* — logo, headlines, primary buttons, active navigation, promotional banners.
- *Chocolate* — decorative accents, secondary promo cards, supporting icons.
- *Charcoal* — footer background, primary text, navigation icons, form labels.
- *Vibrant Pink* — small CTAs, notification/cart badges, hover states, highlights.

## 6. Typography

Clean geometric sans-serif for UI text (headings and body): Plus Jakarta Sans, Manrope, General Sans, Satoshi, Geist, or Inter. No serif/script fonts in UI copy — the serif treatment is reserved for the logo wordmark only.

Body text minimum 16px.

## 7. Layout System

- Border radius: 10–14px.
- Shadows: subtle, modern — not skeuomorphic.
- Editorial grid, generous whitespace, large product imagery.
- Desktop-first, fully responsive down to mobile.

## 8. Brand Copy Decisions (locked)

- **Brand name:** LO BY LUWA (not a placeholder brand name).
- **Categories:** Joggers, Shirts, Face Caps, New Arrivals, Best Sellers — product-type based, not gendered (Women/Men split from the original inspo is dropped).
- **Hero headline/tone:** cozy, confident, everyday-premium — e.g. "Comfort that moves with you," adapted to reference the brand's actual product range (joggers, shirts, caps) rather than generic apparel language.
- **Nav links:** Home, Joggers, Shirts, Face Caps, New Arrivals, Best Sellers, About, Contact.
- **Icons:** Search, Account, Wishlist, Cart (cart shows item-count badge in Vibrant Pink).

## 9. Page Sections (Homepage)

1. **Announcement bar** — Burgundy background, free shipping threshold message.
2. **Header** — white background, logo left, nav center, icon cluster right (search, account, wishlist, cart).
3. **Hero** — Soft Pink background; left: eyebrow label, large headline, supporting copy, primary (burgundy solid) + secondary (burgundy-outline) buttons; right: flat-lay product photography (placeholder for now).
4. **Category cards** — four cards (Joggers, Shirts, Face Caps, New Arrivals or Best Sellers — final four TBD by Luwa's priority), alternating white/blush/burgundy/chocolate backgrounds, each with an icon, label, one-line description, and arrow link.
5. **Product grid / Best Sellers** — clean product cards: photo, title, price, quick-add, wishlist icon, subtle hover lift.
6. **Benefits strip** — Fast Delivery, Easy Returns, Premium Quality (Paystack) Secure Payment, each with a pink circular icon badge.
7. **Newsletter** — Soft Pink background, email input, Vibrant Pink subscribe button.
8. **Footer** — Chocolate (brown) background, white headings, light-grey links, pink hover states; sections: Brand, Shop, Customer Care, About, Need Help (contact + socials).

## 10. Components

**Buttons**
- Primary: burgundy background, white text.
- Secondary: white background, burgundy border and text, soft-pink hover fill.

**Product Card**
- Image (placeholder flat-lay for now), product title, price, quick-add action, wishlist heart icon, subtle lift + image zoom on hover.

**Category Card**
- Icon, label, short description line, arrow affordance, alternating background per brand palette.

## 11. Imagery

Use: neutral flat-lays, natural lighting, premium textures, Pinterest-inspired styling. Avoid: loud colours, busy backgrounds, oversaturated photography. **Phase 1 ships with placeholder/stock flat-lay imagery**; real product photography will replace it once available, with no layout changes required (images are treated as swappable assets, not hard-coded dimensions).

## 12. Animations

Fade in on scroll, gentle hover lift on cards, smooth colour/shadow transitions, image zoom on product hover. Keep subtle — nothing that fights the editorial, calm tone.

## 13. Accessibility

WCAG AA contrast minimum, 16px minimum body text, visible focus states on all interactive elements, 44×44px minimum touch targets.

## 14. Overall Goal

A premium, unisex fashion shopping experience where the interface itself — not the product photography — carries the brand identity, so that products of any colour or style sit comfortably within the design.
