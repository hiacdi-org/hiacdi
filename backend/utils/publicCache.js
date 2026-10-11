const store = new Map();
const DEFAULT_TTL_MS = 60_000;

export function cacheGet(key) {
  const row = store.get(key);
  if (!row) return null;
  if (Date.now() > row.expires) {
    store.delete(key);
    return null;
  }
  return row;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  const etag = `"${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}"`;
  const row = { value, etag, expires: Date.now() + ttlMs, createdAt: Date.now() };
  store.set(key, row);
  return row;
}

export function cacheBust() {
  store.clear();
}

export function cacheAgeMs(key) {
  const row = store.get(key);
  if (!row) return null;
  return Date.now() - row.createdAt;
}

export function sendCachedJson(res, row) {
  res.setHeader("ETag", row.etag);
  res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=45");
  return res.json(row.value);
}
