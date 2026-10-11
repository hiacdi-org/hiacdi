import { Router } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { attachAdminSession, checkCredentials, extractToken, login, logout, requireAdmin } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { rateLimit } from "../utils/rateLimit.js";
import { clearAdminLoginLock, readAdminLoginLock, recordAdminLoginFailure } from "../utils/adminLoginLock.js";
import {
  consumeUnlockToken,
  createUnlockToken,
  deleteUnlockToken,
  listUnlockTokens,
} from "../utils/adminUnlockTokens.js";

const router = Router();
const LOCKED_MESSAGE = "Sign-in rejected. Too many wrong passwords. Ask a senior staff member for an unlock token.";

router.post("/login", rateLimit({ max: 10, windowMs: 15 * 60 * 1000, message: "Too many sign-in attempts. Please wait." }), async (req, res) => {
  if (readAdminLoginLock().locked) {
    return res.status(403).json({ locked: true, message: LOCKED_MESSAGE });
  }

  const body = req.body || {};
  const email = String(body.email || body.username || "").trim();
  const result = await login(email, body.password);
  if (!result) {
    const failure = recordAdminLoginFailure();
    if (failure.locked) {
      return res.status(403).json({ locked: true, message: LOCKED_MESSAGE });
    }
    const tries = failure.remaining;
    return res.status(401).json({
      remaining: tries,
      message: "Invalid credentials.",
    });
  }

  clearAdminLoginLock();
  attachAdminSession(res, result);
  res.json({ ok: true, token: result.token, expiresAt: result.expiresAt });
});

router.get("/me", requireAdmin, asyncHandler(async (_req, res) => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  let name = String(process.env.ADMIN_NAME || "").trim() || "HIACDI Admin";
  try {
    if (email) {
      const admin = await Admin.findOne({ email }).lean();
      if (admin?.name) name = admin.name;
    }
  } catch (error) {
    console.error("Admin profile lookup failed:", error);
  }
  res.json({ name, email, role: "admin" });
}));

router.post("/password", requireAdmin, asyncHandler(async (req, res) => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (!email) {
    return res.status(400).json({ message: "Admin email is not configured." });
  }
  if (newPassword.length < 10) {
    return res.status(400).json({ message: "Use a new password of at least 10 characters." });
  }
  if (!(await checkCredentials(email, currentPassword))) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const name = String(process.env.ADMIN_NAME || "").trim() || "HIACDI Admin";
  await Admin.findOneAndUpdate({ email }, { name, email, passwordHash, role: "admin" }, { upsert: true, new: true });
  res.json({ ok: true, message: "Password updated." });
}));

router.post("/logout", (req, res) => {
  logout(extractToken(req), res);
  res.json({ ok: true });
});

router.get("/lock-status", (_req, res) => {
  res.json({ locked: readAdminLoginLock().locked });
});

router.post("/unlock", (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!readAdminLoginLock().locked) {
    return res.json({ ok: true, message: "Sign-in is already open." });
  }
  if (!consumeUnlockToken(token)) {
    return res.status(401).json({ message: "That unlock token is not valid." });
  }
  clearAdminLoginLock();
  return res.json({ ok: true, message: "Restriction removed. You can sign in now." });
});

router.get("/unlock-tokens", requireAdmin, (_req, res) => {
  res.json({ tokens: listUnlockTokens() });
});

router.post("/unlock-tokens", requireAdmin, (req, res) => {
  const created = createUnlockToken(req.body?.label);
  res.status(201).json(created);
});

router.delete("/unlock-tokens/:id", requireAdmin, (req, res) => {
  if (!deleteUnlockToken(req.params.id)) {
    return res.status(404).json({ message: "That token was not found." });
  }
  res.json({ ok: true });
});

export default router;
