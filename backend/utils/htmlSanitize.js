const ALLOWED_TAGS = new Set(["h1", "h2", "h3", "h4", "p", "strong", "b", "em", "i", "ul", "ol", "li", "a", "blockquote", "img", "br", "span"]);
const VOID_TAGS = new Set(["br", "img"]);

function isSafeUrl(value, { image = false } = {}) {
  const url = String(value || "").trim();
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return false;
    if (image) {
      const host = parsed.hostname.toLowerCase();
      return host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
    }
    return true;
  } catch {
    return false;
  }
}

function isCloudinaryOrLocalImage(value) {
  const url = String(value || "").trim();
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    return host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
  } catch {
    return false;
  }
}

function decode(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z:_][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = re.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? "";
  }
  return attrs;
}

export function sanitizeHtml(input) {
  const source = String(input || "");
  if (!source.trim()) return "";
  let out = "";
  const re = /<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
  let match;
  while ((match = re.exec(source))) {
    if (match[3] != null) {
      out += decode(match[3]).replace(/&amp;(#\d+|#x[0-9a-f]+|[a-z]+);/gi, "&$1;");
      continue;
    }
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) continue;
    if (closing) {
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`;
      continue;
    }
    if (tag === "br") {
      out += "<br>";
      continue;
    }
    const attrs = parseAttrs(match[2] || "");
    const safe = [];
    if (tag === "a") {
      const href = attrs.href || "";
      if (!isSafeUrl(href) || /^javascript:/i.test(href) || /^data:/i.test(href)) continue;
      safe.push(`href="${decode(href)}"`);
      if (attrs.target === "_blank") safe.push('target="_blank" rel="noopener noreferrer"');
    }
    if (tag === "img") {
      const src = attrs.src || "";
      if (!isCloudinaryOrLocalImage(src)) continue;
      safe.push(`src="${decode(src)}"`);
      if (attrs.alt) safe.push(`alt="${decode(attrs.alt)}"`);
      safe.push('loading="lazy"');
    }
    out += `<${tag}${safe.length ? ` ${safe.join(" ")}` : ""}>`;
    if (VOID_TAGS.has(tag) && tag !== "br") out += "";
  }
  return out.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

export function sanitizePlain(value, max = 5000) {
  return String(value || "").replace(/<[^>]*>/g, "").trim().slice(0, max);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isValidPhone(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  return /^[+0-9()\s.-]{6,30}$/.test(text);
}

export function isValidHttpUrl(value, { allowRelative = true } = {}) {
  const url = String(value || "").trim();
  if (!url) return true;
  if (allowRelative && url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
