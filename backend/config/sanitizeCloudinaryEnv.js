import dotenv from "dotenv";

dotenv.config();

const raw = String(process.env.CLOUDINARY_URL || "").trim();
if (!raw) {
  delete process.env.CLOUDINARY_URL;
} else if (!raw.toLowerCase().startsWith("cloudinary://")) {
  const stripped = raw.replace(/^CLOUDINARY_URL=/i, "").trim();
  if (stripped.toLowerCase().startsWith("cloudinary://")) {
    process.env.CLOUDINARY_URL = stripped;
  } else {
    delete process.env.CLOUDINARY_URL;
  }
}
