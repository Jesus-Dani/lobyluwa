"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Server Actions get Next.js's built-in Origin-header CSRF check for
// free — see docs/SECURITY.md's CSRF requirement.
export async function toggleWishlist(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "You need to be signed in to save items to your wishlist." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  }

  revalidatePath("/account");
  return { wishlisted: !existing };
}
