import { apiUrl } from "./apiBase";

const TOKEN_KEY = "hiacdiAdminToken";
const EXPIRES_KEY = "hiacdiAdminTokenExpiresAt";

let liveToken = "";
let liveExpiresAt = 0;

function dropSavedLogin() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
  } catch {
    // ignore storage access errors
  }
}

dropSavedLogin();

export function saveSession({ token, expiresAt }) {
  dropSavedLogin();
  liveToken = String(token || "");
  liveExpiresAt = Number(expiresAt) || 0;
}

export function clearSession() {
  liveToken = "";
  liveExpiresAt = 0;
  dropSavedLogin();
}

export function getToken() {
  if (!liveToken || !liveExpiresAt || Date.now() > liveExpiresAt) {
    clearSession();
    return null;
  }
  return liveToken;
}

const PREVIEW_KEY = "hiacdiCmsPreview";

export function grantCmsPreview(minutes = 15) {
  const token = getToken();
  if (!token) return;
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify({ token, until: Date.now() + minutes * 60 * 1000 }));
  } catch {
    // ignore storage access errors
  }
}

export function peekCmsPreviewToken() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null");
    if (!raw?.token || Date.now() > Number(raw.until || 0)) {
      localStorage.removeItem(PREVIEW_KEY);
      return null;
    }
    return raw.token;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function adminLogin(email, password) {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Incorrect email or password.");
    error.locked = Boolean(data.locked);
    throw error;
  }
  saveSession(data);
  return data;
}

export async function fetchAdminLockStatus() {
  const response = await fetch(apiUrl("/api/auth/lock-status"), { credentials: "include" });
  const data = await response.json().catch(() => ({}));
  return Boolean(data.locked);
}

export async function unlockAdminWithToken(token) {
  const response = await fetch(apiUrl("/api/auth/unlock"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "That unlock token is not valid.");
  }
  return data;
}

export async function adminLogout() {
  const token = getToken();
  clearSession();
  try {
    await fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // ignore network errors on logout
  }
}
