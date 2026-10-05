import multer from "multer";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOC_TYPES = new Set(["application/pdf"]);

function sniff(buffer) {
  if (!buffer || buffer.length < 12) return "";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer.slice(0, 4).toString() === "RIFF" && buffer.slice(8, 12).toString() === "WEBP") return "image/webp";
  if (buffer.slice(0, 5).toString() === "%PDF-") return "application/pdf";
  return "";
}

const storage = multer.memoryStorage();

export const uploadMemory = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const type = file.mimetype;
    if (IMAGE_TYPES.has(type) || DOC_TYPES.has(type)) return cb(null, true);
    return cb(new Error("Only JPG, PNG, WEBP, or PDF files are allowed."));
  },
});

export function validateUploadBuffer(file, { imagesOnly = false } = {}) {
  if (!file?.buffer) return "No file uploaded.";
  const kind = sniff(file.buffer);
  if (!kind) return "File type is not allowed.";
  if (imagesOnly && !kind.startsWith("image/")) return "Upload a JPG, PNG, or WEBP image.";
  if (kind.startsWith("image/") && file.size > 5 * 1024 * 1024) return "Images must be 5 MB or smaller.";
  if (kind === "application/pdf" && file.size > 10 * 1024 * 1024) return "PDFs must be 10 MB or smaller.";
  file.detectedType = kind;
  return "";
}
