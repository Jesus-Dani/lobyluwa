import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const [addresses, user] = await Promise.all([
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  return <CheckoutForm addresses={addresses} defaultPhoneNumber={user?.phoneNumber ?? ""} />;
}
