import { z } from "zod";

// Shared zod schemas for API route/Server Action input validation —
// see docs/SECURITY.md: "All API route inputs should be validated with
// zod before touching the database."

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phoneNumber: z.string().trim().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  recipientName: z.string().trim().min(1).max(200),
  phoneNumber: z.string().trim().min(7).max(20),
  street: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Cart is empty"),
  addressId: z.string().min(1),
  phoneNumberAtCheckout: z.string().trim().min(7).max(20),
});

export const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(1).max(5000),
  categoryId: z.string().min(1),
  costPrice: z.number().int().min(0),
  salePrice: z.number().int().min(0),
  images: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["active", "archived"]).default("active"),
  variants: z
    .array(
      z.object({
        size: z.string().trim().min(1).max(50),
        color: z.string().trim().min(1).max(50),
        stockQuantity: z.number().int().min(0),
        sku: z.string().trim().min(1).max(100),
      })
    )
    .min(1, "At least one size/color variant is required"),
});
