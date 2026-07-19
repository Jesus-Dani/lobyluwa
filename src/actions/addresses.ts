"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validation";

export async function createAddress(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "You need to be signed in." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address" };

  const address = await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/checkout");
  revalidatePath("/account");
  return { address };
}

export async function deleteAddress(addressId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "You need to be signed in." };

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) return { error: "Address not found." };

  await prisma.address.delete({ where: { id: addressId } });
  revalidatePath("/account");
  return { success: true };
}
