import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CMS_MODELS } from "../models/cms.js";
import { readJson, writeJson } from "./localJson.js";
import { destroyAsset } from "../config/cloudinary.js";
import { sanitizeHtml, sanitizePlain, isValidEmail, isValidHttpUrl, isValidPhone } from "./htmlSanitize.js";
import {
  defaultFaqs,
  defaultNav,
  defaultPartners,
  defaultSections,
  defaultSettings,
  defaultSlides,
  defaultStats,
  defaultTeam,
  defaultTestimonials,
} from "../data/cmsDefaults.js";

const here = dirname(fileURLToPath(import.meta.url));
const storePath = join(here, "../data/cms-store.json");

export function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function emptyStore() {
  return {
    settings: null,
    sections: [],
    stats: [],
    slides: [],
    team: [],
    partners: [],
    testimonials: [],
    faqs: [],
    nav: [],
    revisions: [],
    audit: [],
  };
}

export function readStore() {
  return readJson(storePath, emptyStore());
}

function writeStore(store) {
  writeJson(storePath, store);
}

function withId(row) {
  return { ...row, id: row._id ? String(row._id) : row.id };
}

export function publishedOnly(rows, { preview = false } = {}) {
  return (rows || []).filter((row) => {
    if (row.visible === false) return false;
    if (preview) return true;
    return (row.status || "published") === "published";
  });
}

function sortRows(rows) {
  return [...rows].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function loadCollection(name) {
  if (mongoReady() && CMS_MODELS[name] && name !== "settings") {
    const rows = await CMS_MODELS[name].find().sort({ order: 1, createdAt: 1 }).lean();
    return rows.map(withId);
  }
  return sortRows(readStore()[name] || []);
}

export async function loadSettings() {
  if (mongoReady()) {
    let row = await CMS_MODELS.settings.findOne().lean();
    if (!row) {
      row = (await CMS_MODELS.settings.create({ ...defaultSettings, fromSeed: true })).toObject();
    }
    return withId(row);
  }
  const store = readStore();
  if (!store.settings) {
    store.settings = { ...defaultSettings, id: "settings", fromSeed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    writeStore(store);
  }
  return store.settings;
}

export async function saveRevision(model, documentId, snapshot, editedBy) {
  const entry = {
    id: randomUUID(),
    model,
    documentId: String(documentId),
    snapshot,
    editedBy: editedBy || "admin",
    createdAt: new Date().toISOString(),
  };
  if (mongoReady()) {
    await CMS_MODELS.revisions.create(entry);
    const extras = await CMS_MODELS.revisions.find({ model, documentId: String(documentId) }).sort({ createdAt: -1 }).skip(20);
    for (const extra of extras) await extra.deleteOne();
    return;
  }
  const store = readStore();
  store.revisions = store.revisions || [];
  store.revisions.unshift(entry);
  store.revisions = store.revisions.filter((row, index, list) => {
    if (row.model !== model || String(row.documentId) !== String(documentId)) return true;
    return list.filter((item) => item.model === model && String(item.documentId) === String(documentId)).indexOf(row) < 20;
  });
  writeStore(store);
}

export async function saveAudit(admin, action, entity, entityId, summary) {
  const entry = {
    id: randomUUID(),
    admin: admin || "admin",
    action,
    entity,
    entityId: String(entityId || ""),
    summary: sanitizePlain(summary, 500),
    createdAt: new Date().toISOString(),
  };
  if (mongoReady()) {
    await CMS_MODELS.audit.create(entry);
    return;
  }
  const store = readStore();
  store.audit = store.audit || [];
  store.audit.unshift(entry);
  store.audit = store.audit.slice(0, 500);
  writeStore(store);
}

export async function maybeDestroyFile(previous, next) {
  const prevId = previous?.publicId;
  if (!prevId) return;
  const nextId = next?.publicId;
  if (!nextId || nextId !== prevId) await destroyAsset(prevId);
}

export function cleanSettings(body) {
  const contact = body.contact || {};
  const social = body.social || {};
  const seo = body.seo || {};
  const announcementBar = body.announcementBar || {};
  if (contact.email && !isValidEmail(contact.email)) throw new Error("Enter a valid contact email.");
  if (!isValidPhone(contact.phone) || !isValidPhone(contact.whatsapp)) throw new Error("Enter a valid phone number.");
  ["facebook", "x", "instagram", "linkedin", "youtube", "tiktok"].forEach((key) => {
    if (social[key] && !isValidHttpUrl(social[key], { allowRelative: false })) throw new Error("Social links must be valid URLs.");
  });
  if (contact.mapEmbedUrl && !isValidHttpUrl(contact.mapEmbedUrl, { allowRelative: false })) throw new Error("Map URL is not valid.");
  if (body.educationSiteUrl && !isValidHttpUrl(body.educationSiteUrl, { allowRelative: false })) throw new Error("Education site URL is not valid.");
  return {
    organizationName: sanitizePlain(body.organizationName, 200) || defaultSettings.organizationName,
    shortName: sanitizePlain(body.shortName, 40) || "HIACDI",
    tagline: sanitizePlain(body.tagline, 300),
    logo: body.logo || {},
    favicon: body.favicon || {},
    primaryColor: /^#[0-9A-Fa-f]{6}$/.test(body.primaryColor || "") ? body.primaryColor : "#0A2E6D",
    accentColor: /^#[0-9A-Fa-f]{6}$/.test(body.accentColor || "") ? body.accentColor : "#D4AF37",
    contact: {
      email: sanitizePlain(contact.email, 120),
      phone: sanitizePlain(contact.phone, 40),
      whatsapp: sanitizePlain(contact.whatsapp, 40),
      address: sanitizePlain(contact.address, 300),
      mapEmbedUrl: String(contact.mapEmbedUrl || "").trim(),
      officeHours: sanitizePlain(contact.officeHours, 200),
    },
    social: {
      facebook: String(social.facebook || "").trim(),
      x: String(social.x || "").trim(),
      instagram: String(social.instagram || "").trim(),
      linkedin: String(social.linkedin || "").trim(),
      youtube: String(social.youtube || "").trim(),
      tiktok: String(social.tiktok || "").trim(),
    },
    footerText: sanitizeHtml(body.footerText || ""),
    copyright: sanitizePlain(body.copyright, 200),
    educationSiteUrl: String(body.educationSiteUrl || "https://hiacdi.org/").trim() || "https://hiacdi.org/",
    certificatePrefix: sanitizePlain(body.certificatePrefix, 8) || "HIA",
    seo: {
      defaultTitle: sanitizePlain(seo.defaultTitle, 120),
      defaultDescription: sanitizePlain(seo.defaultDescription, 300),
      ogImage: seo.ogImage || {},
    },
    pageSeo: body.pageSeo && typeof body.pageSeo === "object" ? body.pageSeo : {},
    announcementBar: {
      enabled: Boolean(announcementBar.enabled),
      text: sanitizePlain(announcementBar.text, 300),
      link: String(announcementBar.link || "").trim(),
    },
    fromSeed: false,
  };
}

export function cleanSection(body) {
  const buttons = Array.isArray(body.buttons) ? body.buttons : [];
  return {
    page: sanitizePlain(body.page, 40) || "home",
    key: sanitizePlain(body.key, 60) || "section",
    title: sanitizePlain(body.title, 200),
    subtitle: sanitizePlain(body.subtitle, 300),
    body: sanitizeHtml(body.body || ""),
    image: body.image || {},
    buttons: buttons.slice(0, 6).map((item) => ({
      label: sanitizePlain(item.label, 80),
      url: String(item.url || "").trim().slice(0, 400),
      style: ["primary", "secondary", "navy", "gold"].includes(item.style) ? item.style : "primary",
      openInNewTab: Boolean(item.openInNewTab),
    })),
    visible: body.visible !== false,
    status: body.status === "draft" ? "draft" : "published",
    order: Number(body.order) || 0,
    extra: body.extra && typeof body.extra === "object" ? body.extra : {},
    locked: Boolean(body.locked),
    fromSeed: false,
  };
}

function cleanSimple(kind, body) {
  const base = {
    visible: body.visible !== false,
    status: body.status === "draft" ? "draft" : "published",
    order: Number(body.order) || 0,
    fromSeed: false,
  };
  if (kind === "stats") return { ...base, label: sanitizePlain(body.label, 120), value: sanitizePlain(body.value, 40), suffix: sanitizePlain(body.suffix, 20), icon: sanitizePlain(body.icon, 40) };
  if (kind === "slides") return { ...base, heading: sanitizePlain(body.heading, 200), subheading: sanitizePlain(body.subheading, 400), image: body.image || {}, buttonLabel: sanitizePlain(body.buttonLabel, 80), buttonUrl: String(body.buttonUrl || "").trim() };
  if (kind === "team") return { ...base, name: sanitizePlain(body.name, 120), role: sanitizePlain(body.role, 120), bio: sanitizeHtml(body.bio || ""), photo: body.photo || {} };
  if (kind === "partners") return { ...base, name: sanitizePlain(body.name, 120), logo: body.logo || {}, website: String(body.website || "").trim() };
  if (kind === "testimonials") return { ...base, name: sanitizePlain(body.name, 120), role: sanitizePlain(body.role, 120), quote: sanitizePlain(body.quote, 800), photo: body.photo || {} };
  if (kind === "faqs") return { ...base, question: sanitizePlain(body.question, 200), answer: sanitizeHtml(body.answer || ""), category: sanitizePlain(body.category, 40) || "general" };
  if (kind === "nav") return { ...base, label: sanitizePlain(body.label, 80), url: String(body.url || "").trim(), parent: sanitizePlain(body.parent, 80), openInNewTab: Boolean(body.openInNewTab), locked: Boolean(body.locked) };
  return cleanSection(body);
}

export async function upsertSettings(body, admin) {
  const previous = await loadSettings();
  await saveRevision("settings", previous.id || "settings", previous, admin);
  const next = { ...cleanSettings(body), updatedBy: admin || "admin" };
  await maybeDestroyFile(previous.logo, next.logo);
  await maybeDestroyFile(previous.favicon, next.favicon);
  await maybeDestroyFile(previous.seo?.ogImage, next.seo?.ogImage);
  if (mongoReady()) {
    const row = await CMS_MODELS.settings.findOneAndUpdate({}, next, { upsert: true, new: true, setDefaultsOnInsert: true });
    await saveAudit(admin, "update", "settings", row._id, "Updated site settings");
    return withId(row.toObject());
  }
  const store = readStore();
  store.settings = { ...previous, ...next, id: previous.id || "settings", updatedAt: new Date().toISOString() };
  writeStore(store);
  await saveAudit(admin, "update", "settings", store.settings.id, "Updated site settings");
  return store.settings;
}

export async function createItem(kind, body, admin) {
  const payload = { ...cleanSimple(kind, body), updatedBy: admin || "admin", createdAt: new Date().toISOString() };
  if (mongoReady()) {
    const created = await CMS_MODELS[kind].create(payload);
    await saveAudit(admin, "create", kind, created._id, `Created ${kind}`);
    return withId(created.toObject());
  }
  const store = readStore();
  const created = { ...payload, id: randomUUID() };
  store[kind] = store[kind] || [];
  store[kind].push(created);
  writeStore(store);
  await saveAudit(admin, "create", kind, created.id, `Created ${kind}`);
  return created;
}

export async function updateItem(kind, id, body, admin) {
  const rows = await loadCollection(kind);
  const previous = rows.find((row) => String(row.id) === String(id) || String(row._id) === String(id));
  if (!previous) throw new Error("Not found.");
  await saveRevision(kind, id, previous, admin);
  const payload = { ...cleanSimple(kind, { ...previous, ...body }), updatedBy: admin || "admin", locked: previous.locked };
  const imageFields = ["image", "photo", "logo"];
  for (const field of imageFields) {
    if (previous[field]) await maybeDestroyFile(previous[field], payload[field]);
  }
  if (mongoReady()) {
    const row = await CMS_MODELS[kind].findByIdAndUpdate(id, payload, { new: true });
    if (!row) throw new Error("Not found.");
    await saveAudit(admin, "update", kind, id, `Updated ${kind}`);
    return withId(row.toObject());
  }
  const store = readStore();
  store[kind] = (store[kind] || []).map((row) => (String(row.id) === String(id) ? { ...row, ...payload, updatedAt: new Date().toISOString() } : row));
  writeStore(store);
  await saveAudit(admin, "update", kind, id, `Updated ${kind}`);
  return store[kind].find((row) => String(row.id) === String(id));
}

export async function deleteItem(kind, id, admin) {
  const rows = await loadCollection(kind);
  const previous = rows.find((row) => String(row.id) === String(id) || String(row._id) === String(id));
  if (!previous) throw new Error("Not found.");
  if (previous.locked) throw new Error("This item is required and cannot be deleted.");
  await saveRevision(kind, id, previous, admin);
  for (const field of ["image", "photo", "logo"]) {
    if (previous[field]?.publicId) await destroyAsset(previous[field].publicId);
  }
  if (mongoReady()) {
    await CMS_MODELS[kind].findByIdAndDelete(id);
  } else {
    const store = readStore();
    store[kind] = (store[kind] || []).filter((row) => String(row.id) !== String(id));
    writeStore(store);
  }
  await saveAudit(admin, "delete", kind, id, `Deleted ${kind}`);
  return { ok: true };
}

export async function reorderItems(kind, ids, admin) {
  const list = Array.isArray(ids) ? ids.map(String) : [];
  if (mongoReady()) {
    await Promise.all(list.map((id, index) => CMS_MODELS[kind].findByIdAndUpdate(id, { order: index + 1, fromSeed: false })));
  } else {
    const store = readStore();
    store[kind] = (store[kind] || []).map((row) => {
      const index = list.indexOf(String(row.id));
      return index >= 0 ? { ...row, order: index + 1, fromSeed: false } : row;
    });
    writeStore(store);
  }
  await saveAudit(admin, "reorder", kind, "", `Reordered ${kind}`);
  return loadCollection(kind);
}

export async function setVisibility(kind, id, visible, admin) {
  return updateItem(kind, id, { visible: Boolean(visible) }, admin);
}

export async function listRevisions(model, id) {
  if (mongoReady()) {
    return CMS_MODELS.revisions.find({ model, documentId: String(id) }).sort({ createdAt: -1 }).limit(20).lean();
  }
  return (readStore().revisions || [])
    .filter((row) => row.model === model && String(row.documentId) === String(id))
    .slice(0, 20);
}

export async function restoreRevision(model, id, revisionId, admin) {
  const revisions = await listRevisions(model, id);
  const revision = revisions.find((row) => String(row._id || row.id) === String(revisionId));
  if (!revision) throw new Error("Revision not found.");
  const snapshot = { ...revision.snapshot };
  delete snapshot._id;
  delete snapshot.id;
  if (model === "settings") return upsertSettings(snapshot, admin);
  return updateItem(model, id, snapshot, admin);
}

export async function listAudit({ page = 1, limit = 20 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;
  if (mongoReady()) {
    const [rows, total] = await Promise.all([
      CMS_MODELS.audit.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CMS_MODELS.audit.countDocuments(),
    ]);
    return { rows, total, page, limit };
  }
  const rows = readStore().audit || [];
  return { rows: rows.slice(skip, skip + limit), total: rows.length, page, limit };
}

export async function ensureCmsSeeded() {
  const stamp = (row, extra = {}) => ({
    ...row,
    visible: true,
    status: "published",
    fromSeed: true,
    ...extra,
  });
  if (mongoReady()) {
    const dedupe = async (kind, keyFn) => {
      const rows = await CMS_MODELS[kind].find().sort({ updatedAt: -1, createdAt: -1 }).lean();
      const seen = new Set();
      for (const row of rows) {
        const key = keyFn(row);
        if (seen.has(key)) await CMS_MODELS[kind].deleteOne({ _id: row._id });
        else seen.add(key);
      }
    };
    await dedupe("sections", (row) => `${row.page}::${row.key}`);
    await dedupe("stats", (row) => row.label);
    await dedupe("slides", (row) => row.heading);
    await dedupe("team", (row) => row.name);
    await dedupe("partners", (row) => row.name);
    await dedupe("testimonials", (row) => row.quote);
    await dedupe("faqs", (row) => row.question);
    await dedupe("nav", (row) => `${row.url}::${row.label}`);
    if (!(await CMS_MODELS.settings.findOne())) await CMS_MODELS.settings.create(stamp(defaultSettings));
    const insertMissing = async (kind, rows, match) => {
      for (const row of rows) {
        const exists = await CMS_MODELS[kind].findOne(match(row));
        if (!exists) await CMS_MODELS[kind].create(stamp(row, { order: row.order || 0 }));
      }
    };
    await insertMissing("sections", defaultSections, (row) => ({ page: row.page, key: row.key }));
    await insertMissing("stats", defaultStats, (row) => ({ label: row.label }));
    await insertMissing("slides", defaultSlides, (row) => ({ heading: row.heading }));
    await insertMissing("team", defaultTeam, (row) => ({ name: row.name }));
    await insertMissing("partners", defaultPartners, (row) => ({ name: row.name }));
    await insertMissing("testimonials", defaultTestimonials, (row) => ({ quote: row.quote }));
    await insertMissing("faqs", defaultFaqs, (row) => ({ question: row.question }));
    await insertMissing("nav", defaultNav, (row) => ({ url: row.url, label: row.label }));
    return;
  }
  const store = readStore();
  let changed = false;
  if (!store.settings) {
    store.settings = { ...stamp(defaultSettings), id: "settings" };
    changed = true;
  }
  const fill = (key, rows, match) => {
    store[key] = store[key] || [];
    for (const row of rows) {
      const exists = store[key].some((item) => match(item, row));
      if (!exists) {
        store[key].push({ ...stamp(row), id: randomUUID() });
        changed = true;
      }
    }
  };
  fill("sections", defaultSections, (item, row) => item.page === row.page && item.key === row.key);
  fill("stats", defaultStats, (item, row) => item.label === row.label);
  fill("slides", defaultSlides, (item, row) => item.heading === row.heading);
  fill("team", defaultTeam, (item, row) => item.name === row.name);
  fill("partners", defaultPartners, (item, row) => item.name === row.name);
  fill("testimonials", defaultTestimonials, (item, row) => item.quote === row.quote);
  fill("faqs", defaultFaqs, (item, row) => item.question === row.question);
  fill("nav", defaultNav, (item, row) => item.url === row.url && item.label === row.label);
  if (changed) writeStore(store);
}

export async function publicHome({ preview = false } = {}) {
  await ensureCmsSeeded();
  const [settings, sections, stats, slides, partners, testimonials] = await Promise.all([
    loadSettings(),
    loadCollection("sections"),
    loadCollection("stats"),
    loadCollection("slides"),
    loadCollection("partners"),
    loadCollection("testimonials"),
  ]);
  const homeSections = publishedOnly(sections.filter((row) => row.page === "home"), { preview });
  return {
    settings,
    sections: sortRows(homeSections),
    stats: sortRows(publishedOnly(stats, { preview })),
    slides: sortRows(publishedOnly(slides, { preview })),
    partners: sortRows(publishedOnly(partners, { preview })),
    testimonials: sortRows(publishedOnly(testimonials, { preview })),
  };
}

export function mapSettingsToLegacy(settings) {
  return {
    name: settings.shortName || "HIACDI",
    fullName: settings.organizationName,
    tagline: settings.tagline,
    motto: settings.tagline,
    announcement: settings.announcementBar?.text || "",
    email: settings.contact?.email || "",
    admissionsEmail: settings.contact?.email || "",
    location: settings.contact?.address || "Kenya",
    whatsapp: settings.contact?.whatsapp || "",
    hero: {
      title: "",
      text: "",
      logoSrc: settings.logo?.url || "/brand/logo-wordmark.png",
    },
    educationSiteUrl: settings.educationSiteUrl,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    seo: settings.seo,
    announcementBar: settings.announcementBar,
    contact: settings.contact,
    social: settings.social,
    footerText: settings.footerText,
    copyright: settings.copyright,
    logo: settings.logo,
    favicon: settings.favicon,
    pageSeo: settings.pageSeo,
  };
}
