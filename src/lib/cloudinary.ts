import { v2 as cloudinary } from "cloudinary";

/**
 * Product images are uploaded and hosted on Cloudinary, not our own
 * storage/DB. The admin product form uploads directly to Cloudinary
 * (signed upload) and we store only the returned public ID / secure URL
 * on the Product record — Cloudinary handles resizing, format
 * conversion, and CDN delivery for us.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a short-lived signature so the admin UI can upload directly
 * from the browser to Cloudinary without our server proxying the file
 * bytes (faster, and keeps large image uploads off our own compute).
 */
export function getUploadSignature(paramsToSign: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp },
    process.env.CLOUDINARY_API_SECRET as string
  );
  return { timestamp, signature };
}

export default cloudinary;
