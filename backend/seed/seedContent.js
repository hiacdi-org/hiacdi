import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { CMS_MODELS } from "../models/cms.js";
import {
  defaultFaqs,
  defaultNav,
  defaultPartners,
  defaultSections,
  defaultSettings,
  defaultSlides,
  defaultStats,
  defaultTeam,
  defaultTestimonials,
} from "../data/cmsDefaults.js";
import { ensureCmsSeeded } from "../utils/cmsStore.js";

function stamp(row) {
  return { ...row, visible: true, status: "published", fromSeed: true };
}

async function seedIfMissing(Model, defaults, match) {
  for (const row of defaults) {
    const query = match(row);
    const existing = await Model.findOne(query);
    if (existing) {
      if (!existing.fromSeed) continue;
      continue;
    }
    await Model.create(stamp(row));
  }
}

async function seedContent() {
  try {
    await connectDb();
  } catch {
    await ensureCmsSeeded();
    console.log("MongoDB not available. Seeded local CMS JSON store.");
    return;
  }
  if (!(await CMS_MODELS.settings.findOne())) {
    await CMS_MODELS.settings.create(stamp(defaultSettings));
  }
  await seedIfMissing(CMS_MODELS.sections, defaultSections, (row) => ({ page: row.page, key: row.key }));
  await seedIfMissing(CMS_MODELS.stats, defaultStats, (row) => ({ label: row.label }));
  await seedIfMissing(CMS_MODELS.slides, defaultSlides, (row) => ({ heading: row.heading }));
  await seedIfMissing(CMS_MODELS.team, defaultTeam, (row) => ({ name: row.name }));
  await seedIfMissing(CMS_MODELS.partners, defaultPartners, (row) => ({ name: row.name }));
  await seedIfMissing(CMS_MODELS.testimonials, defaultTestimonials, (row) => ({ quote: row.quote }));
  await seedIfMissing(CMS_MODELS.faqs, defaultFaqs, (row) => ({ question: row.question }));
  await seedIfMissing(CMS_MODELS.nav, defaultNav, (row) => ({ url: row.url, label: row.label }));
  console.log("CMS content seed complete. Existing admin edits were left unchanged.");
  await mongoose.disconnect();
}

seedContent().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
