export function hostnameOf(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).hostname;
    return raw.split("/")[0].split(":")[0];
  } catch {
    return raw.split("/")[0].split(":")[0];
  }
}

export function isLoopbackOrPrivateHost(host) {
  const hostname = hostnameOf(host);
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname) || /^10\./.test(hostname)) return true;
  return false;
}

export function isLocalDevOrigin(origin) {
  if (!origin) return false;
  try {
    return isLoopbackOrPrivateHost(new URL(origin).hostname);
  } catch {
    return false;
  }
}
