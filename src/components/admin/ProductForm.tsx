"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { createProduct, updateProduct } from "@/actions/products";
import { ImageUploader } from "./ImageUploader";
import styles from "./ProductForm.module.css";

type VariantInput = { size: string; color: string; stockQuantity: number; sku: string };

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  images: string[];
  featured: boolean;
  status: "active" | "archived";
  variants: VariantInput[];
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ categories, initialData }: { categories: Category[]; initialData?: ProductFormData }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      costPrice: 0,
      salePrice: 0,
      images: [],
      featured: false,
      status: "active",
      variants: [{ size: "", color: "", stockQuantity: 0, sku: "" }],
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData));

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  function addVariant() {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { size: "", color: "", stockQuantity: 0, sku: "" }] }));
  }

  function removeVariant(index: number) {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = initialData?.id
      ? await updateProduct(initialData.id, form)
      : await createProduct(form);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <label>
        Name
        <input
          required
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
          }}
        />
      </label>

      <label>
        Slug (used in the product URL)
        <input
          required
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm({ ...form, slug: e.target.value });
          }}
        />
      </label>

      <label>
        Description
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label>
        Category
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.row}>
        <label>
          Cost price (₦)
          <input
            type="number"
            required
            min={0}
            value={form.costPrice / 100}
            onChange={(e) => setForm({ ...form, costPrice: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          Sale price (₦)
          <input
            type="number"
            required
            min={0}
            value={form.salePrice / 100}
            onChange={(e) => setForm({ ...form, salePrice: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
      </div>

      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Feature on &quot;Best Sellers&quot;
      </label>

      <div>
        <span className={styles.sectionLabel}>Images</span>
        <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
      </div>

      <div>
        <span className={styles.sectionLabel}>Size / Color Variants</span>
        {form.variants.map((variant, index) => (
          <div key={index} className={styles.variantRow}>
            <input
              placeholder="Size (e.g. M)"
              required
              value={variant.size}
              onChange={(e) => updateVariant(index, "size", e.target.value)}
            />
            <input
              placeholder="Color"
              required
              value={variant.color}
              onChange={(e) => updateVariant(index, "color", e.target.value)}
            />
            <input
              type="number"
              placeholder="Stock"
              required
              min={0}
              value={variant.stockQuantity}
              onChange={(e) => updateVariant(index, "stockQuantity", Number(e.target.value))}
            />
            <input
              placeholder="SKU"
              required
              value={variant.sku}
              onChange={(e) => updateVariant(index, "sku", e.target.value)}
            />
            {form.variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(index)} className={styles.removeVariant}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVariant} className={styles.addVariant}>
          + Add variant
        </button>
      </div>

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? "Saving..." : initialData?.id ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
