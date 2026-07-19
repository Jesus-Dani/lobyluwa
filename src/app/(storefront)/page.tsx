import { Hero } from "@/components/storefront/Hero";
import { CategoryCards } from "@/components/storefront/CategoryCards";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SectionHead } from "@/components/storefront/SectionHead";
import { BenefitsStrip } from "@/components/storefront/BenefitsStrip";
import { Newsletter } from "@/components/storefront/Newsletter";
import { prisma } from "@/lib/prisma";
import { toProductCards, PRODUCT_CARD_SELECT } from "@/lib/products";

export const revalidate = 300;

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { status: "active", featured: true },
    select: PRODUCT_CARD_SELECT,
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  const products = await toProductCards(featured);

  return (
    <main>
      <Hero />
      <CategoryCards />
      <section style={{ padding: "64px 0", background: "var(--white)" }}>
        <SectionHead title="Best Sellers" viewAllHref="/products?sort=featured" />
        <ProductGrid products={products} />
      </section>
      <BenefitsStrip />
      <Newsletter />
    </main>
  );
}
