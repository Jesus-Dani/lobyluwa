import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCardData } from "@/components/storefront/ProductCard";

const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  salePrice: true,
  images: true,
  variants: { select: { id: true, stockQuantity: true } },
} as const;

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  salePrice: number;
  images: string[];
  variants: { id: string; stockQuantity: number }[];
};

export { PRODUCT_CARD_SELECT };

export async function toProductCards(products: RawProduct[]): Promise<ProductCardData[]> {
  const session = await getServerSession(authOptions);
  let wishlistedIds = new Set<string>();

  if (session?.user?.id) {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id, productId: { in: products.map((p) => p.id) } },
      select: { productId: true },
    });
    wishlistedIds = new Set(wishlistItems.map((item) => item.productId));
  }

  return products.map((product) => ({
    ...product,
    isWishlisted: wishlistedIds.has(product.id),
  }));
}
