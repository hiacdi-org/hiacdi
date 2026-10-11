import { Router } from "express";
import { siteContent } from "../data/content.js";
import { defaultSettings } from "../data/cmsDefaults.js";
import { extractToken } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/sessions.js";
import { cacheGet, cacheSet, sendCachedJson } from "../utils/publicCache.js";
import {
  ensureCmsSeeded,
  loadCollection,
  loadSettings,
  mapSettingsToLegacy,
  publicHome,
  publishedOnly,
} from "../utils/cmsStore.js";

const router = Router();

function wantsPreview(req) {
  if (String(req.query.preview || "") !== "1") return false;
  return Boolean(verifyToken(extractToken(req), "admin"));
}

function cachedOrFresh(res, key, builder) {
  const hit = cacheGet(key);
  if (hit) return sendCachedJson(res, hit);
  return builder().then((value) => sendCachedJson(res, cacheSet(key, value)));
}

function emptyHome(settings) {
  return {
    settings: settings || { ...defaultSettings, id: "settings" },
    sections: [],
    stats: [],
    slides: [],
    partners: [],
    testimonials: [],
    nav: [],
    programmeGroups: [],
    posts: [],
  };
}

router.get("/", asyncHandler(async (_req, res) => {
  try {
    await cachedOrFresh(res, "site:legacy", async () => {
      await ensureCmsSeeded();
      const settings = await loadSettings();
      return {
        ...siteContent,
        ...mapSettingsToLegacy(settings),
        whatsapp: settings.contact?.whatsapp || process.env.WHATSAPP || siteContent.whatsapp,
        learningModes: siteContent.learningModes,
        booking: siteContent.booking,
      };
    });
  } catch (error) {
    console.error("GET /api/site failed:", error.message);
    res.json({
      ...siteContent,
      whatsapp: process.env.WHATSAPP || siteContent.whatsapp,
    });
  }
}));

router.get("/settings", asyncHandler(async (_req, res) => {
  try {
    await cachedOrFresh(res, "site:settings", async () => {
      await ensureCmsSeeded();
      return loadSettings();
    });
  } catch (error) {
    console.error("GET /api/site/settings failed:", error.message);
    res.json({ ...defaultSettings, id: "settings" });
  }
}));

router.get("/home", asyncHandler(async (req, res) => {
  try {
    const preview = wantsPreview(req);
    if (preview) {
      res.setHeader("Cache-Control", "no-store");
      return res.json(await publicHome({ preview: true }));
    }
    await cachedOrFresh(res, "site:home", () => publicHome({ preview: false }));
  } catch (error) {
    console.error("GET /api/site/home failed:", error.message);
    try {
      const settings = await loadSettings();
      res.json(emptyHome(settings));
    } catch {
      res.json(emptyHome());
    }
  }
}));

router.get("/navigation", asyncHandler(async (req, res) => {
  const preview = wantsPreview(req);
  if (preview) {
    res.setHeader("Cache-Control", "no-store");
    return res.json(publishedOnly(await loadCollection("nav"), { preview: true }));
  }
  await cachedOrFresh(res, "site:nav", async () => {
    await ensureCmsSeeded();
    return publishedOnly(await loadCollection("nav"), { preview: false });
  });
}));

router.get("/team", asyncHandler(async (req, res) => {
  await cachedOrFresh(res, "site:team", async () => {
    await ensureCmsSeeded();
    return publishedOnly(await loadCollection("team"), { preview: wantsPreview(req) });
  });
}));

router.get("/faqs", asyncHandler(async (req, res) => {
  await cachedOrFresh(res, "site:faqs", async () => {
    await ensureCmsSeeded();
    return publishedOnly(await loadCollection("faqs"), { preview: wantsPreview(req) });
  });
}));

router.get("/partners", asyncHandler(async (req, res) => {
  await cachedOrFresh(res, "site:partners", async () => {
    await ensureCmsSeeded();
    return publishedOnly(await loadCollection("partners"), { preview: wantsPreview(req) });
  });
}));

router.get("/testimonials", asyncHandler(async (req, res) => {
  await cachedOrFresh(res, "site:testimonials", async () => {
    await ensureCmsSeeded();
    return publishedOnly(await loadCollection("testimonials"), { preview: wantsPreview(req) });
  });
}));

router.get("/pages/:page", asyncHandler(async (req, res) => {
  const preview = wantsPreview(req);
  const key = `site:page:${req.params.page}`;
  if (preview) {
    await ensureCmsSeeded();
    const sections = publishedOnly(
      (await loadCollection("sections")).filter((row) => row.page === req.params.page),
      { preview: true }
    );
    res.setHeader("Cache-Control", "no-store");
    return res.json({ page: req.params.page, sections });
  }
  await cachedOrFresh(res, key, async () => {
    await ensureCmsSeeded();
    const sections = publishedOnly(
      (await loadCollection("sections")).filter((row) => row.page === req.params.page),
      { preview: false }
    );
    return { page: req.params.page, sections };
  });
}));

export default router;
