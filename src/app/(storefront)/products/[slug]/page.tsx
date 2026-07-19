import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductCards, PRODUCT_CARD_SELECT } from "@/lib/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductDetail } from "./ProductDetail";

export const revalidate = 300;

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });

  if (!product || product.status !== "active") notFound();

  const session = await getServerSession(authOptions);
  let isWishlisted = false;
  if (session?.user?.id) {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    });
    isWishlisted = Boolean(wishlistItem);
  }

  const related = await prisma.product.findMany({
    where: { status: "active", categoryId: product.categoryId, id: { not: product.id } },
    select: PRODUCT_CARD_SELECT,
    take: 4,
  });
  const relatedCards = await toProductCards(related);

  return <ProductDetail product={product} isWishlisted={isWishlisted} relatedProducts={relatedCards} />;
}
