import { Router } from "express";
import { siteContent } from "../data/content.js";
import { extractToken } from "../utils/auth.js";
import { verifyToken } from "../utils/sessions.js";
import {
  ensureCmsSeeded,
  listAudit,
  listRevisions,
  loadCollection,
  loadSettings,
  mapSettingsToLegacy,
  publicHome,
  publishedOnly,
  restoreRevision,
} from "../utils/cmsStore.js";

const router = Router();

function wantsPreview(req) {
  if (String(req.query.preview || "") !== "1") return false;
  return Boolean(verifyToken(extractToken(req), "admin"));
}

router.get("/", async (_req, res) => {
  try {
    await ensureCmsSeeded();
    const settings = await loadSettings();
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json({
      ...siteContent,
      ...mapSettingsToLegacy(settings),
      whatsapp: settings.contact?.whatsapp || process.env.WHATSAPP || siteContent.whatsapp,
      learningModes: siteContent.learningModes,
      booking: siteContent.booking,
    });
  } catch {
    res.json({
      ...siteContent,
      whatsapp: process.env.WHATSAPP || siteContent.whatsapp,
    });
  }
});

router.get("/settings", async (_req, res) => {
  await ensureCmsSeeded();
  const settings = await loadSettings();
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(settings);
});

router.get("/home", async (req, res) => {
  const preview = wantsPreview(req);
  res.setHeader("Cache-Control", preview ? "no-store" : "public, max-age=60");
  res.json(await publicHome({ preview }));
});

router.get("/navigation", async (req, res) => {
  await ensureCmsSeeded();
  const preview = wantsPreview(req);
  const rows = publishedOnly(await loadCollection("nav"), { preview });
  res.setHeader("Cache-Control", preview ? "no-store" : "public, max-age=60");
  res.json(rows);
});

router.get("/team", async (req, res) => {
  await ensureCmsSeeded();
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(publishedOnly(await loadCollection("team"), { preview: wantsPreview(req) }));
});

router.get("/faqs", async (req, res) => {
  await ensureCmsSeeded();
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(publishedOnly(await loadCollection("faqs"), { preview: wantsPreview(req) }));
});

router.get("/partners", async (req, res) => {
  await ensureCmsSeeded();
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(publishedOnly(await loadCollection("partners"), { preview: wantsPreview(req) }));
});

router.get("/testimonials", async (req, res) => {
  await ensureCmsSeeded();
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(publishedOnly(await loadCollection("testimonials"), { preview: wantsPreview(req) }));
});

router.get("/pages/:page", async (req, res) => {
  await ensureCmsSeeded();
  const preview = wantsPreview(req);
  const sections = publishedOnly(
    (await loadCollection("sections")).filter((row) => row.page === req.params.page),
    { preview }
  );
  res.setHeader("Cache-Control", preview ? "no-store" : "public, max-age=60");
  res.json({ page: req.params.page, sections });
});

export default router;
