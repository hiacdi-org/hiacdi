import crypto from "crypto";
import { isLoopbackOrPrivateHost } from "./hosts.js";

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function frontendOrigin() {
  return String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
}

export function backendOrigin() {
  return String(process.env.BACKEND_URL || "").replace(/\/$/, "");
}

// Base URL used in links sent to users (verification emails, QR codes).
// Set PUBLIC_URL (or FRONTEND_URL) to the live domain in production, e.g. https://hiacdi.org
export function publicBaseUrl(req) {
  const configured = String(process.env.PUBLIC_URL || "").replace(/\/$/, "") || frontendOrigin();
  if (configured) return configured;
  if (req && req.get) {
    const host = req.get("host");
    if (host) return `${req.protocol || "http"}://${host}`;
  }
  return "";
}

export function usesHttps() {
  if (String(process.env.FORCE_HTTPS || "").toLowerCase() === "false") return false;
  if (isProduction()) return true;
  return /^https:\/\//i.test(frontendOrigin()) || /^https:\/\//i.test(backendOrigin());
}

export function shouldRedirectToHttps(req) {
  if (!usesHttps()) return false;
  const host = String(req?.headers?.host || "");
  if (isLoopbackOrPrivateHost(host)) return false;
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "");
  if (proto === "https" || req.secure) return false;
  return Boolean(host);
}

let cachedSecret = "";

export function sessionSecret() {
  if (cachedSecret) return cachedSecret;
  const explicit = String(process.env.SESSION_SECRET || process.env.JWT_SECRET || "").trim();
  if (explicit.length >= 16) {
    cachedSecret = explicit;
    return cachedSecret;
  }
  if (isProduction()) {
    throw new Error("SESSION_SECRET must be set to at least 16 characters in production.");
  }
  cachedSecret = crypto
    .createHash("sha256")
    .update(`hiacdi-dev|${process.env.ADMIN_PASSWORD || "dev"}`)
    .digest("hex");
  return cachedSecret;
}

export function assertProductionConfig() {
  if (!isProduction()) return;
  const missing = [];
  if (!String(process.env.ADMIN_PASSWORD || "").trim()) missing.push("ADMIN_PASSWORD");
  if (!String(process.env.SESSION_SECRET || "").trim() || String(process.env.SESSION_SECRET).trim().length < 16) {
    missing.push("SESSION_SECRET");
  }
  if (missing.length) {
    console.error(`Missing required production environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

export function validateStartupEnv() {
  const checks = [
    { name: "PORT", value: process.env.PORT, recommended: false },
    { name: "MONGO_URI", value: process.env.MONGO_URI, recommended: true },
    { name: "ALLOW_REMOTE_MONGO", value: process.env.ALLOW_REMOTE_MONGO },
    { name: "MONGO_DB_NAME", value: process.env.MONGO_DB_NAME },
    { name: "SESSION_SECRET", value: process.env.SESSION_SECRET, required: isProduction() },
    { name: "ADMIN_EMAIL", value: process.env.ADMIN_EMAIL, recommended: true },
    { name: "ADMIN_PASSWORD", value: process.env.ADMIN_PASSWORD, required: isProduction() },
    { name: "CLOUDINARY_CLOUD_NAME", value: process.env.CLOUDINARY_CLOUD_NAME, recommended: true },
    { name: "FRONTEND_URL", value: process.env.FRONTEND_URL },
    { name: "PUBLIC_URL", value: process.env.PUBLIC_URL },
  ];
  const present = [];
  const missingRequired = [];
  const missingRecommended = [];
  for (const item of checks) {
    const set = Boolean(String(item.value || "").trim());
    if (set) present.push(item.name);
    else if (item.required) missingRequired.push(item.name);
    else if (item.recommended) missingRecommended.push(item.name);
  }
  console.log(`Startup env present: ${present.join(", ") || "(none of the checked keys)"}`);
  console.log(`Listening port will be ${process.env.PORT || 5000} (process.env.PORT ${process.env.PORT ? "is set" : "falls back to 5000"})`);
  if (missingRecommended.length) {
    console.warn(`Startup env recommended but missing: ${missingRecommended.join(", ")}`);
  }
  if (missingRequired.length) {
    console.error(`Startup env required but missing: ${missingRequired.join(", ")}`);
  }
}
