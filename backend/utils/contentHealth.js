import mongoose from "mongoose";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import { Post, GalleryItem, Resource } from "../models/Content.js";
import Programme from "../models/Programme.js";
import { hostnameOf, isLoopbackOrPrivateHost } from "./hosts.js";
import { isProduction, usesHttps, frontendOrigin, publicBaseUrl } from "./env.js";
import { loadCollection, loadSettings, mongoReady } from "./cmsStore.js";
import { cacheAgeMs } from "./publicCache.js";

function countBy(rows, pred) {
  return (rows || []).filter(pred).length;
}

export function envHealthNotes() {
  const frontend = frontendOrigin();
  const publicUrl = publicBaseUrl();
  const warnings = [];
  if (isProduction() && isLoopbackOrPrivateHost(publicUrl)) {
    warnings.push("PUBLIC_URL is a local address while NODE_ENV=production. Certificate and email links will point at this machine, not hiacdi.org.");
  }
  if (isProduction() && usesHttps()) {
    warnings.push("HTTPS is on for public hosts. Localhost and private LAN hosts skip the HTTPS redirect so Vite on port 5175 can reach this API.");
  }
  if (frontend && !isLoopbackOrPrivateHost(frontend) && isProduction()) {
    warnings.push(`CORS allows ${hostnameOf(frontend)} plus localhost. Browse the public site from the same origin you publish to.`);
  }
  if (!isCloudinaryConfigured()) {
    warnings.push("Cloudinary is not configured. Uploaded images will not persist to the CDN.");
  }
  if (!mongoReady()) {
    warnings.push("MongoDB is not connected. Public pages fall back to local JSON and will not match Atlas admin writes.");
  }
  return warnings;
}

export async function publicContentHealth() {
  let mongoLatencyMs = null;
  if (mongoReady()) {
    const started = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      mongoLatencyMs = Date.now() - started;
    } catch {
      mongoLatencyMs = -1;
    }
  }
  return {
    ok: true,
    name: "HIACDI API",
    server: {
      up: true,
      port: Number(process.env.PORT || 5000),
      uptimeSec: Math.round(process.uptime()),
    },
    database: {
      ready: mongoReady(),
      latencyMs: mongoLatencyMs,
      state: mongoose.connection.readyState,
    },
    mongo: { ready: mongoReady(), latencyMs: mongoLatencyMs },
    cloudinary: { configured: isCloudinaryConfigured() },
    cache: { homeAgeMs: cacheAgeMs("site:home") },
    uptimeSec: Math.round(process.uptime()),
    env: {
      nodeEnv: process.env.NODE_ENV || "development",
      usesHttps: usesHttps(),
      localhostHttpsSkipped: true,
    },
  };
}

export async function adminContentHealth() {
  const [settings, sections, stats, slides, team, partners, testimonials, faqs, nav] = await Promise.all([
    loadSettings(),
    loadCollection("sections"),
    loadCollection("stats"),
    loadCollection("slides"),
    loadCollection("team"),
    loadCollection("partners"),
    loadCollection("testimonials"),
    loadCollection("faqs"),
    loadCollection("nav"),
  ]);

  const collections = { sections, stats, slides, team, partners, testimonials, faqs, nav };
  const summary = {};
  for (const [name, rows] of Object.entries(collections)) {
    summary[name] = {
      total: rows.length,
      published: countBy(rows, (row) => row.visible !== false && (row.status || "published") === "published"),
      draft: countBy(rows, (row) => (row.status || "published") === "draft"),
      hidden: countBy(rows, (row) => row.visible === false),
    };
  }

  let programmes = { total: 0 };
  let posts = { published: 0, unpublished: 0 };
  let gallery = { total: 0 };
  let resources = { total: 0 };
  if (mongoReady()) {
    programmes = { total: await Programme.countDocuments() };
    posts = {
      published: await Post.countDocuments({ published: true }),
      unpublished: await Post.countDocuments({ published: false }),
    };
    gallery = { total: await GalleryItem.countDocuments() };
    resources = { total: await Resource.countDocuments() };
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    mongo: {
      ready: mongoReady(),
      state: mongoose.connection.readyState,
      dbName: mongoose.connection.name || "",
    },
    cloudinary: { configured: isCloudinaryConfigured() },
    settings: {
      organizationName: settings.organizationName || "",
      updatedAt: settings.updatedAt || null,
    },
    cms: summary,
    programmes,
    posts,
    gallery,
    resources,
    publicPaths: {
      home: "/",
      about: "/about",
      programmes: "/programmes",
      news: "/news",
      resources: "/resources",
      gallery: "/projects/gallery",
      faqs: "/about/faqs",
      contact: "/contact",
      verify: "/verify",
    },
    warnings: envHealthNotes(),
    env: {
      nodeEnv: process.env.NODE_ENV || "development",
      usesHttps: usesHttps(),
      frontendHost: hostnameOf(frontendOrigin()),
      publicHost: hostnameOf(publicBaseUrl()),
      localhostHttpsSkipped: true,
    },
  };
}
