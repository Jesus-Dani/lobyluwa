// Builds a delivery URL from a Cloudinary public ID stored on Product.images.
// Cloud name isn't secret, so it's safe as a NEXT_PUBLIC_ env var for use
// in both Server and Client Components.
export function cloudinaryImageUrl(publicId: string, width = 800): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}
