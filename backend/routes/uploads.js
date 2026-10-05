import { Router } from "express";
import { Readable } from "stream";
import { getCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { requireAdmin } from "../utils/auth.js";
import { uploadMemory, validateUploadBuffer } from "../middleware/upload.js";

const FOLDERS = new Set([
  "hiacdi/programmes",
  "hiacdi/gallery",
  "hiacdi/news",
  "hiacdi/students",
  "hiacdi/certificates",
  "hiacdi/resources",
  "hiacdi/cms",
  "hiacdi/brand",
  "hiacdi/seo",
]);

function resolveFolder(raw) {
  const value = String(raw || "").trim();
  if (FOLDERS.has(value)) return value;
  const prefixed = value.startsWith("hiacdi/") ? value : `hiacdi/${value}`;
  if (FOLDERS.has(prefixed)) return prefixed;
  return "hiacdi/resources";
}

const router = Router();

function receiveFile(req, res, next) {
  uploadMemory.single("file")(req, res, (error) => {
    if (!error) return next();
    res.status(400).json({ message: error.message || "Upload failed." });
  });
}

router.post("/", requireAdmin, receiveFile, async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env, then restart the API.",
      });
    }
    const folder = resolveFolder(req.body?.folder);
    const imagesOnly = String(req.body?.imagesOnly || "") === "true";
    const problem = validateUploadBuffer(req.file, { imagesOnly });
    if (problem) return res.status(400).json({ message: problem });

    const resourceType = req.file.detectedType === "application/pdf" ? "raw" : "image";
    const uploaded = await new Promise((resolve, reject) => {
      const stream = getCloudinary().uploader.upload_stream(
        { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      Readable.from(req.file.buffer).pipe(stream);
    });

    res.status(201).json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      resourceType: uploaded.resource_type,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Upload failed." });
  }
});

export default router;
