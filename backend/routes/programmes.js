import { Router } from "express";
import mongoose from "mongoose";
import Programme from "../models/Programme.js";
import { requireAdmin } from "../utils/auth.js";
import { loadProgrammeSeed } from "../seed/loadSeed.js";
import { destroyAsset } from "../config/cloudinary.js";
import { cacheBust, cacheGet, cacheSet, sendCachedJson } from "../utils/publicCache.js";

const router = Router();

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

router.get("/", async (req, res) => {
  const groupsOnly = String(req.query.groups || "") === "1";
  const groupSlug = String(req.query.group || "").trim();
  const cacheKey = groupsOnly ? "programmes:groups" : groupSlug ? `programmes:group:${groupSlug}` : "programmes:all";
  const hit = cacheGet(cacheKey);
  if (hit) return sendCachedJson(res, hit);
  try {
    let rows;
    if (mongoReady()) {
      const query = groupsOnly ? { isGroup: true } : groupSlug ? { groupSlug } : {};
      const select = groupsOnly
        ? "title slug summary coverImage order educationSite isGroup group groupSlug"
        : undefined;
      rows = await Programme.find(query).select(select).sort({ order: 1 }).lean();
      if (!rows.length && !groupSlug) {
        await Programme.insertMany(loadProgrammeSeed().programmes);
        rows = await Programme.find(query).select(select).sort({ order: 1 }).lean();
      }
    } else {
      rows = loadProgrammeSeed().programmes;
      if (groupsOnly) rows = rows.filter((row) => row.isGroup);
      if (groupSlug) rows = rows.filter((row) => row.groupSlug === groupSlug);
    }
    return sendCachedJson(res, cacheSet(cacheKey, rows));
  } catch {
    res.json(loadProgrammeSeed().programmes);
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required to edit programmes." });
  try {
    const row = await Programme.findById(req.params.id);
    if (!row) return res.status(404).json({ message: "Programme not found." });
    ["title", "summary", "content", "order", "issuesCertificates"].forEach((key) => {
      if (req.body[key] != null) row[key] = req.body[key];
    });
    if (req.body.coverImage) {
      if (row.coverImage?.publicId && req.body.coverImage.publicId !== row.coverImage.publicId) {
        await destroyAsset(row.coverImage.publicId);
      }
      row.coverImage = req.body.coverImage;
    }
    await row.save();
    cacheBust();
    res.json(row);
  } catch {
    res.status(400).json({ message: "Could not update this programme." });
  }
});

export default router;
