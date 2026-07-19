import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Edit Product</h1>
      <ProductForm
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          images: product.images,
          featured: product.featured,
          status: product.status as "active" | "archived",
          variants: product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
            sku: v.sku,
          })),
        }}
      />
    </div>
  );
}
