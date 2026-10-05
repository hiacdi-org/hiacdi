import crypto from "crypto";
import { CERT_ALPHABET, CERT_PATTERN, CERT_PREFIX } from "../config/certNumbers.js";

export function normalizeCertificateNumber(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidCertificateNumber(value) {
  return CERT_PATTERN.test(normalizeCertificateNumber(value));
}

function randomChar() {
  return CERT_ALPHABET[crypto.randomInt(0, CERT_ALPHABET.length)];
}

export function randomSuffix() {
  return Array.from({ length: 6 }, randomChar).join("");
}

export function makeCertificateNumber(courseCode) {
  const code = String(courseCode || "GEN")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 12);
  return `${CERT_PREFIX}-${code || "GEN"}-${randomSuffix()}`;
}

export function maskEmail(email) {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (at < 1) return "***";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const first = local[0] || "*";
  return `${first}***@${domain}`;
}
