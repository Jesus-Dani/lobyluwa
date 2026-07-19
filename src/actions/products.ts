"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createProduct(input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product" };

  const { variants, ...productData } = parsed.data;

  const existingSlug = await prisma.product.findUnique({ where: { slug: productData.slug } });
  if (existingSlug) return { error: "A product with that slug already exists" };

  const product = await prisma.product.create({
    data: { ...productData, variants: { create: variants } },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { product };
}

export async function updateProduct(productId: string, input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product" };

  const { variants, ...productData } = parsed.data;

  const existingSlug = await prisma.product.findFirst({
    where: { slug: productData.slug, id: { not: productId } },
  });
  if (existingSlug) return { error: "A product with that slug already exists" };

  // Simplest correct approach for a small variant list: replace them
  // wholesale rather than diffing — Phase 1 scope doesn't need partial
  // variant-update UX. This fails if any existing variant is referenced
  // by an OrderItem (FK restrict) — acceptable for now since a brand-new
  // store has no order history yet; revisit if editing a product with
  // real sales becomes a real workflow.
  try {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.product.update({
        where: { id: productId },
        data: { ...productData, variants: { create: variants } },
      }),
    ]);
  } catch {
    return {
      error:
        "Couldn't update variants — this product likely has existing orders referencing its current sizes/colors. Archive it and create a new listing instead.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${productData.slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function setProductStatus(productId: string, status: "active" | "archived") {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}
