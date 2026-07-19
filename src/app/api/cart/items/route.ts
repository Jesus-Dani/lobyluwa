import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Read-only lookup so the client-side cart (localStorage variantId/quantity
// pairs) can render product name/price/image/stock — no mutation, so no
// CSRF concern here.
export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({ variants: [] });

  const variantIds = ids.split(",").filter(Boolean).slice(0, 50);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: {
      id: true,
      size: true,
      color: true,
      stockQuantity: true,
      product: {
        select: { id: true, slug: true, name: true, salePrice: true, images: true, status: true },
      },
    },
  });

  return NextResponse.json({ variants });
}
