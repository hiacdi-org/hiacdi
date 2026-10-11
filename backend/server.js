import "dotenv/config";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { connectDb, disconnectDb } from "./config/db.js";
import { isCloudinaryConfigured } from "./config/cloudinary.js";
import courseRoutes from "./routes/courses.js";
import inquiryRoutes from "./routes/inquiries.js";
import siteRoutes from "./routes/site.js";
import bookingRoutes from "./routes/bookings.js";
import applicationRoutes from "./routes/applications.js";
import graduateRoutes from "./routes/graduates.js";
import settingsRoutes from "./routes/settings.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import enrollmentRoutes from "./routes/enrollments.js";
import broadcastRoutes from "./routes/broadcast.js";
import visitRoutes from "./routes/visits.js";
import databaseRoutes from "./routes/database.js";
import intakeRoutes from "./routes/intakes.js";
import certificateRoutes from "./routes/certificates.js";
import programmeRoutes from "./routes/programmes.js";
import uploadRoutes from "./routes/uploads.js";
import contentRoutes from "./routes/content.js";
import adminSiteRoutes from "./routes/adminSite.js";
import { assertProductionConfig, frontendOrigin, isProduction, shouldRedirectToHttps, usesHttps, validateStartupEnv } from "./utils/env.js";
import { isLocalDevOrigin } from "./utils/hosts.js";
import { publicContentHealth } from "./utils/contentHealth.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { rateLimit } from "./utils/rateLimit.js";

dotenv.config();
validateStartupEnv();
assertProductionConfig();

const app = express();
const port = process.env.PORT || 5000;
const here = dirname(fileURLToPath(import.meta.url));
const frontendDist = join(here, "../Frontend/dist");

app.disable("x-powered-by");
app.use(
  compression({
    filter(req, res) {
      if (String(req.originalUrl || req.url || "").includes("/export/")) return false;
      return compression.filter(req, res);
    },
  })
);
  if (isProduction()) {
    app.set("trust proxy", 1);
  } else {
    app.set("trust proxy", "loopback");
  }

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    const frontend = frontendOrigin();
    if (frontend && origin === frontend) return true;
    const extra = String(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter(Boolean);
    if (extra.includes(origin)) return true;
    if (isLocalDevOrigin(origin)) return true;
    return false;
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  if (!shouldRedirectToHttps(req)) return next();
  return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: https://res.cloudinary.com",
      "media-src 'self' https: blob:",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://res.cloudinary.com",
      "frame-src https://accounts.google.com https://apis.google.com https://maps.google.com https://www.google.com",
    ].join("; ")
  );
  if (usesHttps()) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use((req, _res, next) => {
  const strip = (value) => {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(strip);
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = strip(nested);
    }
    return out;
  };
  if (req.body) req.body = strip(req.body);
  next();
});

app.use("/api", (req, res, next) => {
  const path = req.path || "";
  const liveContent =
    path === "/site" ||
    path.startsWith("/site/") ||
    path.startsWith("/programmes") ||
    path.startsWith("/content");
  if (liveContent) return next();
  const publicCache =
    req.method === "GET" &&
    (path === "/health" ||
      path === "/diagnostics" ||
      path === "/courses" ||
      path === "/courses/catalog" ||
      path === "/bookings/config" ||
      path === "/intakes");
  res.setHeader("Cache-Control", publicCache ? "public, max-age=60" : "no-store");
  next();
});

app.use("/api", rateLimit({ max: 400, windowMs: 15 * 60 * 1000, message: "Too many requests. Please wait a moment." }));

app.get("/api/health", asyncHandler(async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(await publicContentHealth());
  } catch (error) {
    console.error("GET /api/health failed:", error.message);
    res.json({
      ok: true,
      name: "HIACDI API",
      server: { up: true, port: Number(process.env.PORT || 5000), uptimeSec: Math.round(process.uptime()) },
      database: { ready: false, error: "Could not read database status." },
      mongo: { ready: false, latencyMs: null },
    });
  }
}));

app.get("/api/diagnostics", asyncHandler(async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(await publicContentHealth());
  } catch (error) {
    console.error("GET /api/diagnostics failed:", error.message);
    res.status(500).json({ ok: false, message: "Could not load diagnostics." });
  }
}));

app.get("/api/public/email-logo.png", (_req, res) => {
  const file = join(here, "assets/logo-email.png");
  if (!existsSync(file)) return res.status(404).end();
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.type("png");
  res.sendFile(file);
});

app.use("/api/courses", courseRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/graduates", graduateRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/broadcast", broadcastRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/intakes", intakeRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminSiteRoutes);

if (existsSync(join(frontendDist, "index.html"))) {
  app.use(
    express.static(frontendDist, {
      maxAge: isProduction() ? "7d" : 0,
      index: false,
      redirect: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
          return;
        }
        // Vite emits content-hashed files under /assets — safe to cache forever.
        if (/[\\/]assets[\\/]/.test(filePath) && isProduction()) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(frontendDist, "index.html"), (err) => (err ? next() : undefined));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  if (String(err?.message || "").includes("CORS")) {
    return res.status(403).json({ message: "Request blocked." });
  }
  const status = Number(err.status || err.statusCode || 500);
  const message =
    status >= 500
      ? "Something went wrong."
      : err.message || "Could not complete this request.";
  res.status(status).json({ message });
});

let httpServer = null;
let shuttingDown = false;

function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.error(`${signal}: closing HTTP server`);
  const finish = () => {
    disconnectDb()
      .catch((error) => console.error("MongoDB disconnect failed:", error.message))
      .finally(() => process.exit(exitCode));
  };
  if (!httpServer) {
    finish();
    return;
  }
  httpServer.close(() => finish());
  setTimeout(() => {
    console.error("Graceful shutdown timed out. Exiting.");
    process.exit(exitCode);
  }, 2000).unref();
}

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("uncaughtException:", error);
  shutdown("uncaughtException", 1);
});

process.on("SIGINT", () => shutdown("SIGINT", 0));
process.on("SIGTERM", () => shutdown("SIGTERM", 0));

async function start() {
  try {
    await connectDb({ retries: 3 });
  } catch (error) {
    console.error("MongoDB connection failed after retries:", error.message);
    if (String(process.env.REQUIRE_MONGO || "").toLowerCase() === "true") {
      console.error("REQUIRE_MONGO=true — exiting.");
      process.exit(1);
    }
    console.warn("Starting with local JSON fallback so Vite on port 5175 can still reach this API.");
  }

  httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`HIACDI backend listening on http://127.0.0.1:${port} (bind 0.0.0.0:${port})`);
    console.log(
      isCloudinaryConfigured()
        ? "Cloudinary uploads: ready"
        : "Cloudinary uploads: not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env."
    );
  });

  httpServer.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. On Windows run: netstat -ano | findstr :${port}   then   taskkill /PID <pid> /F`
      );
    } else {
      console.error("HTTP server error:", error);
    }
    process.exit(1);
  });
}

start();
