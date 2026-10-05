import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE, USER_COOKIE, clearAuthCookie, readCookie } from "./cookies.js";
import { revokeToken, signToken, verifyToken } from "./sessions.js";

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const rawAdminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
const ADMIN_PASSWORD_HASH = rawAdminPassword ? bcrypt.hashSync(rawAdminPassword, 12) : "";

function timingEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export function extractToken(req) {
  return bearerToken(req);
}

export function extractUserToken(req) {
  return bearerToken(req) || readCookie(req, USER_COOKIE);
}

export async function checkCredentials(email, password) {
  if (typeof email !== "string" || typeof password !== "string") return false;
  const entered = email.trim().toLowerCase();
  if (!entered || !password || !entered.includes("@")) return false;
  if (ADMIN_EMAIL && ADMIN_PASSWORD_HASH) {
    const emailOk = timingEqual(entered, ADMIN_EMAIL);
    const passOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (emailOk && passOk) return true;
  }
  try {
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState !== 1) return false;
    const Admin = (await import("../models/Admin.js")).default;
    const admin = await Admin.findOne({ email: entered });
    if (!admin?.passwordHash) return false;
    return bcrypt.compare(password, admin.passwordHash);
  } catch {
    return false;
  }
}

export async function login(email, password) {
  if (!(await checkCredentials(email, password))) return null;
  return signToken("admin", "staff");
}

export function attachAdminSession(res, _issued) {
  if (res) clearAuthCookie(res, ADMIN_COOKIE);
}

export function logout(token, res) {
  revokeToken(token);
  if (res) clearAuthCookie(res, ADMIN_COOKIE);
}

export function requireAdmin(req, res, next) {
  const token = extractToken(req);
  const session = verifyToken(token, "admin");
  if (!session) {
    return res.status(401).json({ message: "Please sign in as admin to continue." });
  }
  req.adminSession = session;
  next();
}
