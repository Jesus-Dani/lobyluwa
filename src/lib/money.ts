// Prices are stored as integers in kobo (NGN minor unit) throughout —
// see prisma/schema.prisma's comments on Product.costPrice/salePrice.
export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}
