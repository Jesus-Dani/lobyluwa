import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// next-auth v4's App Router pattern — NOT the v5 `handlers` export style.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
