import { Prisma } from "@prisma/client";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SectionHead } from "@/components/storefront/SectionHead";
import { prisma } from "@/lib/prisma";
import { toProductCards, PRODUCT_CARD_SELECT } from "@/lib/products";

export const revalidate = 300;

function titleFor(searchParams: { category?: string; sort?: string; q?: string }) {
  if (searchParams.q) return `Search results for "${searchParams.q}"`;
  if (searchParams.sort === "new") return "New Arrivals";
  if (searchParams.sort === "featured") return "Best Sellers";
  if (searchParams.category) {
    return searchParams.category
      .split("-")
      .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1) : word))
      .join(" ");
  }
  return "All Products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = { status: "active" };
  if (params.category) where.category = { slug: params.category };
  if (params.sort === "featured") where.featured = true;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "new" || !params.sort ? { createdAt: "desc" } : { createdAt: "desc" };

  const rawProducts = await prisma.product.findMany({
    where,
    select: PRODUCT_CARD_SELECT,
    orderBy,
  });
  const products = await toProductCards(rawProducts);

  return (
    <main style={{ padding: "48px 0 80px" }}>
      <SectionHead title={titleFor(params)} />
      <ProductGrid products={products} />
    </main>
  );
}
