import "./sanitizeCloudinaryEnv.js";
import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  if (String(process.env.CLOUDINARY_URL || "").trim()) return true;
  return Boolean(
    String(process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
      String(process.env.CLOUDINARY_API_KEY || "").trim() &&
      String(process.env.CLOUDINARY_API_SECRET || "").trim()
  );
}

export function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in backend/.env.");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function optimizedImage(url, width = 1200) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export async function destroyAsset(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await getCloudinary().uploader.destroy(publicId, { invalidate: true });
  } catch {
    /* ignore missing assets */
  }
}
