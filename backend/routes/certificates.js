import { Router } from "express";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import IssuedCourse from "../models/IssuedCourse.js";
import Graduate from "../models/Graduate.js";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";
import { readJson, writeJson } from "../utils/localJson.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { destroyAsset } from "../config/cloudinary.js";
import {
  isValidCertificateNumber,
  makeCertificateNumber,
  maskEmail,
  normalizeCertificateNumber,
} from "../utils/certNumbers.js";
import { loadProgrammeSeed } from "../seed/loadSeed.js";

const here = dirname(fileURLToPath(import.meta.url));
const storePath = join(here, "../data/certificates-store.json");
const courseStorePath = join(here, "../data/issued-courses-store.json");
const graduateStorePath = join(here, "../data/graduates-store.json");
const router = Router();

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function readCerts() {
  return readJson(storePath, []);
}

function writeCerts(rows) {
  writeJson(storePath, rows);
}

function readCourses() {
  const rows = readJson(courseStorePath, []);
  return rows.length ? rows : loadProgrammeSeed().courses.map((item) => ({ ...item, active: true, id: item.code }));
}

function writeCourses(rows) {
  writeJson(courseStorePath, rows);
}

function publicCertificate(row) {
  if (!row) return null;
  return {
    certificateNumber: row.certificateNumber,
    studentName: row.studentName,
    studentEmailMasked: maskEmail(row.studentEmail),
    courseName: row.courseName,
    courseCode: row.courseCode,
    issueDate: row.issueDate,
    status: row.status,
    studentPhoto: row.studentPhoto?.url ? { url: row.studentPhoto.url } : null,
  };
}

function adminCertificate(row) {
  return {
    id: row._id || row.id,
    certificateNumber: row.certificateNumber,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    courseName: row.courseName,
    courseCode: row.courseCode,
    issueDate: row.issueDate,
    status: row.status,
    studentPhoto: row.studentPhoto || {},
    certificateFile: row.certificateFile || {},
    createdAt: row.createdAt,
  };
}

async function findByNumber(number) {
  if (mongoReady()) {
    return Certificate.findOne({ certificateNumber: number }).lean();
  }
  return readCerts().find((row) => row.certificateNumber === number) || null;
}

async function uniqueNumber(courseCode, custom) {
  if (custom) {
    const value = normalizeCertificateNumber(custom);
    if (!isValidCertificateNumber(value)) {
      throw new Error("Certificate number must look like HIA-DIGLIT-A1B2C3.");
    }
    if (await findByNumber(value)) throw new Error("That certificate number is already in use.");
    return value;
  }
  for (let i = 0; i < 12; i += 1) {
    const value = makeCertificateNumber(courseCode);
    if (!(await findByNumber(value))) return value;
  }
  throw new Error("Could not generate a unique certificate number.");
}

async function legacyGraduate(number) {
  const list = mongoReady()
    ? await Graduate.find().lean()
    : readJson(graduateStorePath, []);
  const match = list.find((row) => String(row.certificateId || "").toUpperCase() === number);
  if (!match || match.awarded === false) return null;
  return {
    certificateNumber: match.certificateId,
    studentName: match.fullName,
    studentEmail: match.email,
    courseName: match.program,
    courseCode: "LEGACY",
    issueDate: match.awardedAt || match.createdAt,
    status: "active",
    studentPhoto: {},
  };
}

router.get(
  "/verify/:number",
  rateLimit({ max: 10, windowMs: 60 * 1000, message: "Too many checks. Please wait a minute." }),
  async (req, res) => {
    try {
      const number = normalizeCertificateNumber(req.params.number);
      if (!number) return res.status(400).json({ status: "invalid", message: "Enter a certificate number." });
      let row = await findByNumber(number);
      if (!row) row = await legacyGraduate(number);
      if (!row) {
        return res.status(404).json({
          status: "not_found",
          message: "We couldn't find that certificate number. Check it and try again.",
        });
      }
      if (row.status === "revoked") {
        return res.json({
          status: "revoked",
          message: "This certificate has been revoked",
          certificate: publicCertificate(row),
        });
      }
      return res.json({
        status: "valid",
        message: "Certificate verified",
        certificate: publicCertificate(row),
      });
    } catch {
      return res.status(500).json({ status: "error", message: "Could not check this number just now." });
    }
  }
);

router.get("/courses", requireAdmin, async (_req, res) => {
  try {
    if (mongoReady()) {
      let rows = await IssuedCourse.find().sort({ name: 1 }).lean();
      if (!rows.length) {
        await IssuedCourse.insertMany(loadProgrammeSeed().courses.map((item) => ({ ...item, active: true })));
        rows = await IssuedCourse.find().sort({ name: 1 }).lean();
      }
      return res.json(rows);
    }
    res.json(readCourses());
  } catch {
    res.status(400).json({ message: "Could not load courses." });
  }
});

router.post("/courses", requireAdmin, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const code = String(req.body.code || "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (!name || code.length < 2) return res.status(400).json({ message: "Name and a short course code are required." });
  try {
    if (mongoReady()) {
      const created = await IssuedCourse.create({ name, code, active: true });
      return res.status(201).json(created);
    }
    const rows = readCourses();
    if (rows.some((row) => row.code === code)) return res.status(400).json({ message: "That course code already exists." });
    const created = { id: randomUUID(), name, code, active: true };
    rows.push(created);
    writeCourses(rows);
    res.status(201).json(created);
  } catch {
    res.status(400).json({ message: "Could not save this course." });
  }
});

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

async function filteredCertificates(query) {
  const q = String(query.q || "").trim().toLowerCase();
  const status = String(query.status || "").trim();
  const course = String(query.course || "").trim();
  const sort = String(query.sort || "createdAt");
  let rows = mongoReady() ? await Certificate.find().lean() : readCerts();
  if (status) rows = rows.filter((row) => row.status === status);
  if (course) rows = rows.filter((row) => row.courseCode === course || row.courseName === course);
  if (q) {
    rows = rows.filter((row) =>
      [row.studentName, row.studentEmail, row.certificateNumber, row.courseName]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  rows.sort((a, b) => {
    if (sort === "studentName") return String(a.studentName || "").localeCompare(String(b.studentName || ""));
    if (sort === "issueDate") return new Date(b.issueDate || 0) - new Date(a.issueDate || 0);
    return new Date(b.createdAt || b.issueDate || 0) - new Date(a.createdAt || a.issueDate || 0);
  });
  return rows;
}

router.get("/export", requireAdmin, async (req, res) => {
  try {
    const rows = await filteredCertificates(req.query);
    const header = "studentName,studentEmail,courseName,courseCode,certificateNumber,issueDate,status";
    const lines = rows.map((row) =>
      [
        row.studentName,
        row.studentEmail,
        row.courseName,
        row.courseCode,
        row.certificateNumber,
        row.issueDate ? new Date(row.issueDate).toISOString().slice(0, 10) : "",
        row.status,
      ]
        .map(csvEscape)
        .join(",")
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=hiacdi-certificates.csv");
    res.send([header, ...lines].join("\n"));
  } catch {
    res.status(400).json({ message: "Could not export certificates." });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(10, Number(req.query.limit) || 20));
    const rows = await filteredCertificates(req.query);
    const total = rows.length;
    const slice = rows.slice((page - 1) * limit, page * limit).map(adminCertificate);
    const active = rows.filter((row) => row.status !== "revoked").length;
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    const issuedThisMonth = rows.filter((row) => new Date(row.issueDate || row.createdAt) >= month).length;
    res.json({
      total,
      active,
      revoked: total - active,
      issuedThisMonth,
      page,
      limit,
      rows: slice,
    });
  } catch {
    res.status(400).json({ message: "Could not load certificates." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const studentName = String(req.body.studentName || "").trim();
  const studentEmail = String(req.body.studentEmail || "").trim().toLowerCase();
  const courseName = String(req.body.courseName || "").trim();
  const courseCode = String(req.body.courseCode || "").trim().toUpperCase();
  const issueDate = req.body.issueDate ? new Date(req.body.issueDate) : new Date();
  if (!studentName || !studentEmail.includes("@") || !courseName || !courseCode) {
    return res.status(400).json({ message: "Name, email, course name, and course code are required." });
  }
  try {
    const certificateNumber = await uniqueNumber(courseCode, req.body.certificateNumber);
    const record = {
      certificateNumber,
      studentName,
      studentEmail,
      courseName,
      courseCode,
      issueDate,
      status: "active",
      studentPhoto: req.body.studentPhoto || {},
      certificateFile: req.body.certificateFile || {},
      issuedBy: "admin",
    };
    if (mongoReady()) {
      const created = await Certificate.create(record);
      return res.status(201).json(adminCertificate(created.toObject()));
    }
    const rows = readCerts();
    const created = { ...record, id: randomUUID(), createdAt: new Date().toISOString() };
    rows.unshift(created);
    writeCerts(rows);
    res.status(201).json(adminCertificate(created));
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not issue this certificate." });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const patch = {};
    ["studentName", "studentEmail", "courseName", "courseCode", "status"].forEach((key) => {
      if (req.body[key] != null) patch[key] = req.body[key];
    });
    if (req.body.issueDate) patch.issueDate = new Date(req.body.issueDate);
    if (req.body.status && !["active", "revoked"].includes(req.body.status)) {
      return res.status(400).json({ message: "Status must be active or revoked." });
    }
    if (mongoReady()) {
      const previous = await Certificate.findById(id);
      if (!previous) return res.status(404).json({ message: "Certificate not found." });
      if (req.body.studentPhoto?.publicId && previous.studentPhoto?.publicId && req.body.studentPhoto.publicId !== previous.studentPhoto.publicId) {
        await destroyAsset(previous.studentPhoto.publicId);
      }
      Object.assign(previous, patch);
      if (req.body.studentPhoto) previous.studentPhoto = req.body.studentPhoto;
      if (req.body.certificateFile) previous.certificateFile = req.body.certificateFile;
      await previous.save();
      return res.json(adminCertificate(previous.toObject()));
    }
    const rows = readCerts();
    const index = rows.findIndex((row) => String(row.id) === id);
    if (index < 0) return res.status(404).json({ message: "Certificate not found." });
    rows[index] = { ...rows[index], ...patch };
    writeCerts(rows);
    res.json(adminCertificate(rows[index]));
  } catch {
    res.status(400).json({ message: "Could not update this certificate." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (mongoReady()) {
      const row = await Certificate.findByIdAndDelete(id);
      if (!row) return res.status(404).json({ message: "Certificate not found." });
      await destroyAsset(row.studentPhoto?.publicId);
      await destroyAsset(row.certificateFile?.publicId);
      return res.json({ ok: true });
    }
    const rows = readCerts();
    const next = rows.filter((row) => String(row.id) !== id);
    writeCerts(next);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ message: "Could not delete this certificate." });
  }
});

router.post("/import", requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  const report = [];
  for (const [index, row] of rows.entries()) {
    try {
      req.body = {
        studentName: row.name || row.studentName,
        studentEmail: row.email || row.studentEmail,
        courseName: row.course || row.courseName,
        courseCode: row.courseCode || String(row.course || "GEN").slice(0, 6).toUpperCase(),
        issueDate: row.issueDate,
      };
      const studentName = String(req.body.studentName || "").trim();
      const studentEmail = String(req.body.studentEmail || "").trim().toLowerCase();
      const courseName = String(req.body.courseName || "").trim();
      const courseCode = String(req.body.courseCode || "GEN").trim().toUpperCase();
      if (!studentName || !studentEmail.includes("@") || !courseName) throw new Error("Missing name, email, or course.");
      const certificateNumber = await uniqueNumber(courseCode);
      const record = {
        certificateNumber,
        studentName,
        studentEmail,
        courseName,
        courseCode,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
        status: "active",
      };
      if (mongoReady()) await Certificate.create(record);
      else {
        const list = readCerts();
        list.unshift({ ...record, id: randomUUID(), createdAt: new Date().toISOString() });
        writeCerts(list);
      }
      report.push({ row: index + 1, ok: true, certificateNumber });
    } catch (error) {
      report.push({ row: index + 1, ok: false, error: error.message });
    }
  }
  res.json({ report });
});

export default router;
