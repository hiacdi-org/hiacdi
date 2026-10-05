import { catalog as fallbackCatalog, flattenPrograms } from "../data/catalog";
import { site as fallbackSite } from "../data/site";
import { clearSession, getToken, peekCmsPreviewToken } from "./auth";
import { userHeaders } from "./userAuth";

import { apiUrl } from "./apiBase";

function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), { credentials: "include", ...options });
}

async function getJson(path) {
  const response = await apiFetch(path);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

const SESSION_EXPIRED = "Your admin session expired. Please sign in again.";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getJsonAuthed(path) {
  const response = await apiFetch(path, { headers: authHeaders() });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

export async function fetchSite() {
  try {
    return await getJson("/api/site");
  } catch {
    return fallbackSite;
  }
}

function previewAuthHeaders() {
  const token = getToken() || peekCmsPreviewToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function previewQuery() {
  if (typeof window === "undefined") return "";
  const preview = new URLSearchParams(window.location.search).get("cmsPreview") === "1";
  return preview && (getToken() || peekCmsPreviewToken()) ? "?preview=1" : "";
}

export async function fetchCmsHome() {
  const suffix = previewQuery();
  const headers = suffix ? previewAuthHeaders() : {};
  const response = await apiFetch(`/api/site/home${suffix}`, { headers });
  if (!response.ok) throw new Error("Could not load home content.");
  return response.json();
}

export async function fetchCmsNavigation() {
  const suffix = previewQuery();
  const headers = suffix ? previewAuthHeaders() : {};
  const response = await apiFetch(`/api/site/navigation${suffix}`, { headers });
  if (!response.ok) throw new Error("Could not load navigation.");
  return response.json();
}

export async function fetchCmsPage(page) {
  const suffix = previewQuery();
  const headers = suffix ? previewAuthHeaders() : {};
  const response = await apiFetch(`/api/site/pages/${encodeURIComponent(page)}${suffix}`, { headers });
  if (!response.ok) throw new Error("Could not load page.");
  return response.json();
}

export function fetchCmsTeam() {
  const suffix = previewQuery();
  const headers = suffix ? previewAuthHeaders() : {};
  return apiFetch(`/api/site/team${suffix}`, { headers }).then((response) => {
    if (!response.ok) throw new Error("Could not load team.");
    return response.json();
  });
}
export function fetchCmsFaqs() {
  const suffix = previewQuery();
  const headers = suffix ? previewAuthHeaders() : {};
  return apiFetch(`/api/site/faqs${suffix}`, { headers }).then((response) => {
    if (!response.ok) throw new Error("Could not load FAQs.");
    return response.json();
  });
}

export function fetchAdminSettings() {
  return getJsonAuthed("/api/admin/site/settings");
}
export function saveAdminSettings(payload) {
  return jsonAuthed("/api/admin/site/settings", "PUT", payload);
}
export function fetchAdminCollection(kind) {
  return getJsonAuthed(`/api/admin/site/${kind}`);
}
export function createAdminItem(kind, payload) {
  return jsonAuthed(`/api/admin/site/${kind}`, "POST", payload);
}
export function updateAdminItem(kind, id, payload) {
  return jsonAuthed(`/api/admin/site/${kind}/${encodeURIComponent(id)}`, "PATCH", payload);
}
export function deleteAdminItem(kind, id) {
  return jsonAuthed(`/api/admin/site/${kind}/${encodeURIComponent(id)}`, "DELETE");
}
export function reorderAdminItems(kind, ids) {
  return jsonAuthed("/api/admin/site/reorder", "PATCH", { collection: kind, ids });
}
export function setAdminVisibility(kind, id, visible) {
  return jsonAuthed(`/api/admin/site/${kind}/${encodeURIComponent(id)}/visibility`, "PATCH", { visible });
}
export function fetchAdminRevisions(model, id) {
  return getJsonAuthed(`/api/admin/revisions/${encodeURIComponent(model)}/${encodeURIComponent(id)}`);
}
export function restoreAdminRevision(model, id, revisionId) {
  return jsonAuthed(`/api/admin/revisions/${encodeURIComponent(model)}/${encodeURIComponent(id)}/restore`, "POST", { revisionId });
}
export function fetchAdminAudit(page = 1) {
  return getJsonAuthed(`/api/admin/audit-log?page=${page}&limit=20`);
}

export async function fetchCatalog() {
  try {
    return await getJson("/api/courses/catalog");
  } catch {
    return fallbackCatalog;
  }
}

export async function fetchCourses() {
  try {
    return await getJson("/api/courses");
  } catch {
    return flattenPrograms(fallbackCatalog);
  }
}

export async function fetchBookingConfig() {
  try {
    return await getJson("/api/bookings/config");
  } catch {
    return {
      ...fallbackSite.booking,
      name: fallbackSite.name,
      motto: fallbackSite.motto,
      logoSrc: fallbackSite.hero.logoSrc,
      slotsByDate: {},
    };
  }
}

export async function createBooking(payload) {
  const response = await apiFetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not book this call.");
  }
  return response.json();
}

export async function fetchApplications() {
  return getJsonAuthed("/api/applications");
}

export async function fetchBookings() {
  return getJsonAuthed("/api/bookings");
}

export async function updateBookingStatus(id, status) {
  const response = await apiFetch(`/api/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not update this booking.");
  }
  return response.json();
}

export async function deleteBooking(id) {
  const response = await apiFetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this booking.");
  }
  return response.json();
}

export async function updateApplicationState(applicationNumber, state) {
  const response = await apiFetch(`/api/applications/${encodeURIComponent(applicationNumber)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ state }),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not update the application.");
  }
  return response.json();
}

export async function updateApplicationStatus(applicationNumber, status) {
  const response = await apiFetch(`/api/applications/${encodeURIComponent(applicationNumber)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not update this applicant's status.");
  }
  return response.json();
}

export async function deleteApplication(applicationNumber) {
  const response = await apiFetch(`/api/applications/${encodeURIComponent(applicationNumber)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this applicant.");
  }
  return response.json();
}

export async function downloadApplicationsFile(kind, applicationNumber, filters = {}) {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set("categorySlug", filters.categorySlug);
  if (filters.programSlug) params.set("programSlug", filters.programSlug);
  if (filters.intakeKey) params.set("intakeKey", filters.intakeKey);
  const query = params.toString();
  const path = applicationNumber
    ? `/api/applications/${encodeURIComponent(applicationNumber)}/export/excel`
    : kind === "pdf"
      ? `/api/applications/export/pdf${query ? `?${query}` : ""}`
      : `/api/applications/export/excel${query ? `?${query}` : ""}`;
  const response = await apiFetch(path, { headers: authHeaders() });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) throw new Error("Could not download this file.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filterName = [filters.programSlug, filters.categorySlug].filter(Boolean).join("-");
  link.download = applicationNumber
    ? `hiacdi-applicant-${applicationNumber}.xlsx`
    : kind === "pdf"
      ? "hiacdi-applications.pdf"
      : filterName
        ? `hiacdi-applications-${filterName}.xlsx`
        : "hiacdi-applications.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function fetchGraduates() {
  return getJsonAuthed("/api/graduates");
}

export async function createGraduate(payload) {
  const response = await apiFetch("/api/graduates", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not register this graduate.");
  }
  return response.json();
}

export async function deleteGraduate(certificateId) {
  const response = await apiFetch(`/api/graduates/${encodeURIComponent(certificateId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this certificate record.");
  }
  return response.json();
}

export async function verifyCertificate(payload) {
  const response = await apiFetch("/api/graduates/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not process this verification. Please try again.");
  }
  return data;
}

export async function confirmCertificateVerification(token) {
  const response = await apiFetch(`/api/graduates/verify/confirm/${encodeURIComponent(token)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "This verification link is invalid.");
  }
  return data;
}

export async function verifyIssuedCertificate(number) {
  const response = await apiFetch(`/api/certificates/verify/${encodeURIComponent(number)}`);
  const data = await response.json().catch(() => ({}));
  if (response.status === 404) {
    return { status: "not_found", message: data.message || "We couldn't find that certificate number. Check it and try again." };
  }
  if (!response.ok) {
    throw new Error(data.message || "Could not check this number just now.");
  }
  return data;
}

export async function fetchIssuedCertificates(params = {}) {
  const query = new URLSearchParams(params);
  return getJsonAuthed(`/api/certificates?${query}`);
}

export async function fetchIssuedCourses() {
  return getJsonAuthed("/api/certificates/courses");
}

export async function createIssuedCourse(payload) {
  const response = await apiFetch("/api/certificates/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not save this course.");
  return data;
}

export async function issueCertificate(payload) {
  const response = await apiFetch("/api/certificates", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not issue this certificate.");
  return data;
}

export async function updateIssuedCertificate(id, payload) {
  const response = await apiFetch(`/api/certificates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not update this certificate.");
  return data;
}

export async function deleteIssuedCertificate(id) {
  const response = await apiFetch(`/api/certificates/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not delete this certificate.");
  return data;
}

export async function importCertificates(rows) {
  const response = await apiFetch("/api/certificates/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ rows }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Import failed.");
  return data;
}

export async function exportCertificatesCsv(params = {}) {
  const query = new URLSearchParams(params);
  const response = await apiFetch(`/api/certificates/export?${query}`, { headers: authHeaders() });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) throw new Error("Could not export certificates.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hiacdi-certificates.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function jsonAuthed(path, method, payload) {
  const response = await apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export function fetchAdminPosts() {
  return getJsonAuthed("/api/content/admin/posts");
}
export function fetchAdminGallery() {
  return getJsonAuthed("/api/content/admin/gallery");
}
export function fetchAdminResources() {
  return getJsonAuthed("/api/content/admin/resources");
}
export function createPost(payload) {
  return jsonAuthed("/api/content/posts", "POST", payload);
}
export function deletePost(id) {
  return jsonAuthed(`/api/content/posts/${encodeURIComponent(id)}`, "DELETE");
}
export function createGalleryItem(payload) {
  return jsonAuthed("/api/content/gallery", "POST", payload);
}
export function deleteGalleryItem(id) {
  return jsonAuthed(`/api/content/gallery/${encodeURIComponent(id)}`, "DELETE");
}
export function createResource(payload) {
  return jsonAuthed("/api/content/resources", "POST", payload);
}
export function deleteResource(id) {
  return jsonAuthed(`/api/content/resources/${encodeURIComponent(id)}`, "DELETE");
}

export async function uploadAdminFile(file, folder, imagesOnly = false) {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  if (imagesOnly) body.append("imagesOnly", "true");
  const response = await apiFetch("/api/uploads", {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Upload failed.");
  return data;
}

export async function fetchApplicationWindow(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.program) query.set("program", params.program);
    const suffix = query.toString() ? `?${query}` : "";
    return await getJson(`/api/settings/applications${suffix}`);
  } catch {
    return null;
  }
}

export async function updateApplicationWindow(payload) {
  const response = await apiFetch("/api/settings/applications", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not update the application window.");
  }
  return response.json();
}

export async function fetchDatabase() {
  return getJsonAuthed("/api/database");
}

export async function submitContact(payload) {
  const response = await apiFetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not send your message. Please try again.");
  }
  return data;
}

export async function submitApplication(payload) {
  // Note: this intentionally does NOT fall back to a local/offline "fake success" on failure.
  // Applications must actually reach the admin backend, including the closed-window rejection,
  // so no applicant is ever shown a success screen for a submission the admin never received.
  const response = await apiFetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...userHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Could not submit the application.");
    error.title = data.title || "";
    error.status = response.status;
    error.applicationNumber = data.applicationNumber || "";
    throw error;
  }
  return data;
}

export async function fetchMyApplications() {
  const response = await apiFetch("/api/applications/mine", { headers: userHeaders() });
  if (!response.ok) return [];
  return response.json();
}

export async function fetchMyEnrollments() {
  const response = await apiFetch("/api/enrollments/me", { headers: userHeaders() });
  if (!response.ok) return [];
  return response.json();
}

export async function enrollInCourse(payload) {
  const response = await apiFetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...userHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Could not register for this course.");
    error.title = data.title || "";
    throw error;
  }
  return data;
}

export async function fetchContactMessages() {
  return getJsonAuthed("/api/contact");
}

export async function updateContactStatus(id, status) {
  const response = await apiFetch(`/api/contact/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not update this message.");
  }
  return response.json();
}

export async function deleteContactMessage(id) {
  const response = await apiFetch(`/api/contact/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this message.");
  }
  return response.json();
}

export async function fetchBroadcastPreview(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return getJsonAuthed(`/api/broadcast/recipients${query ? `?${query}` : ""}`);
}

export async function sendBroadcast(payload) {
  const response = await apiFetch("/api/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not send this message.");
  }
  return data;
}

export async function recordVisit(payload) {
  try {
    await apiFetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // tracking must not interrupt browsing
  }
}

export async function fetchVisitors() {
  return getJsonAuthed("/api/visits");
}

export async function sendChat(messages) {
  const response = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "HIACDI AI could not reply. Please try again.");
  }
  return data;
}

export async function fetchIntakes() {
  try {
    return await getJson("/api/intakes");
  } catch {
    return { year: new Date().getFullYear(), heading: "Intakes in progress", offers: [] };
  }
}

export async function fetchAdminIntakes() {
  return getJsonAuthed("/api/intakes/admin");
}

async function sendJsonAuthed(path, method, body, fallbackMessage) {
  const response = await apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function updateIntakeSettings(payload) {
  return sendJsonAuthed("/api/intakes/settings", "PUT", payload, "Could not save intake settings.");
}

export async function createIntakeOffer(payload) {
  return sendJsonAuthed("/api/intakes", "POST", payload, "Could not add this learning mode.");
}

export async function updateIntakeOffer(id, payload) {
  return sendJsonAuthed(`/api/intakes/${encodeURIComponent(id)}`, "PUT", payload, "Could not save this learning mode.");
}

export async function deleteIntakeOffer(id) {
  const response = await apiFetch(`/api/intakes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this learning mode.");
  }
  return response.json();
}

export async function deleteVisitor(id) {
  const response = await apiFetch(`/api/visits/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not delete this visitor.");
  }
  return response.json();
}

export async function fetchUnlockTokens() {
  return getJsonAuthed("/api/auth/unlock-tokens");
}

export async function createUnlockToken(label) {
  const response = await apiFetch("/api/auth/unlock-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ label }),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not create an unlock token.");
  }
  return data;
}

export async function deleteUnlockToken(id) {
  const response = await apiFetch(`/api/auth/unlock-tokens/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearSession();
    throw new Error(SESSION_EXPIRED);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not delete that token.");
  }
  return data;
}
