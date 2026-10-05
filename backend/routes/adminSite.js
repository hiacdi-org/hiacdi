import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { rateLimitStrict } from "../utils/rateLimit.js";
import {
  createItem,
  deleteItem,
  listAudit,
  listRevisions,
  loadCollection,
  loadSettings,
  reorderItems,
  restoreRevision,
  setVisibility,
  updateItem,
  upsertSettings,
} from "../utils/cmsStore.js";

const COLLECTIONS = ["sections", "stats", "slides", "team", "partners", "testimonials", "faqs", "nav"];
const router = Router();
const limitAdmin = rateLimitStrict({ max: 80, windowMs: 15 * 60 * 1000, message: "Too many admin edits. Please wait." });

function actor(req) {
  return req.adminSession?.subject || "admin";
}

router.use(requireAdmin, limitAdmin);

router.get("/site/settings", async (_req, res) => {
  res.json(await loadSettings());
});

router.put("/site/settings", async (req, res) => {
  try {
    res.json(await upsertSettings(req.body, actor(req)));
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not save settings." });
  }
});

router.patch("/site/reorder", async (req, res) => {
  try {
    const kind = String(req.body.collection || "");
    if (!COLLECTIONS.includes(kind)) return res.status(400).json({ message: "Unknown collection." });
    res.json(await reorderItems(kind, req.body.ids, actor(req)));
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not reorder." });
  }
});

router.get("/revisions/:model/:id", async (req, res) => {
  res.json(await listRevisions(req.params.model, req.params.id));
});

router.post("/revisions/:model/:id/restore", async (req, res) => {
  try {
    res.json(await restoreRevision(req.params.model, req.params.id, req.body.revisionId, actor(req)));
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not restore." });
  }
});

router.get("/audit-log", async (req, res) => {
  res.json(await listAudit({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 }));
});

for (const kind of COLLECTIONS) {
  router.get(`/site/${kind}`, async (_req, res) => {
    res.json(await loadCollection(kind));
  });
  router.post(`/site/${kind}`, async (req, res) => {
    try {
      res.status(201).json(await createItem(kind, req.body, actor(req)));
    } catch (error) {
      res.status(400).json({ message: error.message || "Could not create." });
    }
  });
  router.patch(`/site/${kind}/:id/visibility`, async (req, res) => {
    try {
      res.json(await setVisibility(kind, req.params.id, req.body.visible, actor(req)));
    } catch (error) {
      res.status(400).json({ message: error.message || "Could not update visibility." });
    }
  });
  router.patch(`/site/${kind}/:id`, async (req, res) => {
    try {
      res.json(await updateItem(kind, req.params.id, req.body, actor(req)));
    } catch (error) {
      res.status(400).json({ message: error.message || "Could not update." });
    }
  });
  router.delete(`/site/${kind}/:id`, async (req, res) => {
    try {
      res.json(await deleteItem(kind, req.params.id, actor(req)));
    } catch (error) {
      res.status(400).json({ message: error.message || "Could not delete." });
    }
  });
}

export default router;
