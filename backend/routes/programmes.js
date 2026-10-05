import { Router } from "express";
import mongoose from "mongoose";
import Programme from "../models/Programme.js";
import { requireAdmin } from "../utils/auth.js";
import { loadProgrammeSeed } from "../seed/loadSeed.js";
import { destroyAsset } from "../config/cloudinary.js";

const router = Router();

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

router.get("/", async (_req, res) => {
  try {
    if (mongoReady()) {
      let rows = await Programme.find().sort({ order: 1 }).lean();
      if (!rows.length) {
        await Programme.insertMany(loadProgrammeSeed().programmes);
        rows = await Programme.find().sort({ order: 1 }).lean();
      }
      return res.json(rows);
    }
    res.json(loadProgrammeSeed().programmes);
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
    res.json(row);
  } catch {
    res.status(400).json({ message: "Could not update this programme." });
  }
});

export default router;
