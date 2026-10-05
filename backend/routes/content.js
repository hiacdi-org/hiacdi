import { Router } from "express";
import mongoose from "mongoose";
import { Post, GalleryItem, Resource } from "../models/Content.js";
import { requireAdmin } from "../utils/auth.js";
import { destroyAsset } from "../config/cloudinary.js";

const router = Router();

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

router.get("/posts", async (_req, res) => {
  try {
    if (!mongoReady()) return res.json([]);
    res.json(await Post.find({ published: true }).sort({ createdAt: -1 }).lean());
  } catch {
    res.json([]);
  }
});

router.get("/gallery", async (_req, res) => {
  try {
    if (!mongoReady()) return res.json([]);
    res.json(await GalleryItem.find().sort({ order: 1, createdAt: -1 }).lean());
  } catch {
    res.json([]);
  }
});

router.get("/resources", async (_req, res) => {
  try {
    if (!mongoReady()) return res.json([]);
    res.json(await Resource.find().sort({ createdAt: -1 }).lean());
  } catch {
    res.json([]);
  }
});

router.get("/admin/posts", requireAdmin, async (_req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  res.json(await Post.find().sort({ createdAt: -1 }).lean());
});

router.get("/admin/gallery", requireAdmin, async (_req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  res.json(await GalleryItem.find().sort({ createdAt: -1 }).lean());
});

router.get("/admin/resources", requireAdmin, async (_req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  res.json(await Resource.find().sort({ createdAt: -1 }).lean());
});

router.post("/posts", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "A title is required." });
  try {
    const created = await Post.create({
      title,
      slug: String(req.body.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      category: String(req.body.category || "news").slice(0, 40),
      summary: String(req.body.summary || "").slice(0, 2000),
      body: String(req.body.body || "").slice(0, 20000),
      image: req.body.image || {},
      published: req.body.published !== false,
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ message: "Could not save this post." });
  }
});

router.delete("/posts/:id", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const row = await Post.findByIdAndDelete(req.params.id);
  if (row?.image?.publicId) await destroyAsset(row.image.publicId);
  res.json({ ok: true });
});

router.post("/gallery", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "A title is required." });
  try {
    const created = await GalleryItem.create({
      title,
      caption: String(req.body.caption || "").slice(0, 500),
      image: req.body.image || {},
      order: Number(req.body.order) || 0,
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ message: "Could not save this gallery item." });
  }
});

router.delete("/gallery/:id", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const row = await GalleryItem.findByIdAndDelete(req.params.id);
  if (row?.image?.publicId) await destroyAsset(row.image.publicId);
  res.json({ ok: true });
});

router.post("/resources", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "A title is required." });
  try {
    const created = await Resource.create({
      title,
      category: String(req.body.category || "downloads").slice(0, 40),
      summary: String(req.body.summary || "").slice(0, 2000),
      file: req.body.file || {},
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ message: "Could not save this resource." });
  }
});

router.delete("/resources/:id", requireAdmin, async (req, res) => {
  if (!mongoReady()) return res.status(400).json({ message: "MongoDB is required." });
  const row = await Resource.findByIdAndDelete(req.params.id);
  if (row?.file?.publicId) await destroyAsset(row.file.publicId);
  res.json({ ok: true });
});

export default router;
