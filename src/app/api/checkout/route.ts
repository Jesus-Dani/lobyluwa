import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { isSameOrigin } from "@/lib/same-origin";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You need to be signed in to check out" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { items, addressId, phoneNumberAtCheckout } = parsed.data;

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Live stock check + reservation, inside the same transaction as
      // order creation — the product-detail page's stock display is only
      // ISR-cached/cosmetic (see docs/CACHING.md); this is the
      // authoritative check.
      const variants = await tx.productVariant.findMany({
        where: { id: { in: items.map((i) => i.variantId) } },
        include: { product: true },
      });

      let subtotal = 0;
      const orderItemsData: { variantId: string; quantity: number; unitPrice: number }[] = [];

      for (const item of items) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant || variant.product.status !== "active") {
          throw new Error(`One of the items in your cart is no longer available.`);
        }
        if (variant.stockQuantity < item.quantity) {
          throw new Error(`"${variant.product.name}" (${variant.size}/${variant.color}) just sold out.`);
        }
        subtotal += variant.product.salePrice * item.quantity;
        orderItemsData.push({ variantId: item.variantId, quantity: item.quantity, unitPrice: variant.product.salePrice });
      }

      // Reserve stock immediately at order creation — Phase 1 accepted
      // simplification: no auto-release job yet for abandoned/failed
      // checkouts (see docs/TRD.md's Phase 1 scope notes).
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          addressId,
          phoneNumberAtCheckout,
          subtotal,
          total: subtotal,
          items: { create: orderItemsData },
        },
      });
    });

    const paystack = await initializeTransaction({
      email: session.user.email,
      amountKobo: order.total,
      reference: order.id,
      callbackUrl: `${process.env.NEXTAUTH_URL}/checkout/callback`,
    });

    return NextResponse.json({ authorizationUrl: paystack.data.authorization_url, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
