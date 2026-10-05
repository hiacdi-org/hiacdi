import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import Programme from "../models/Programme.js";
import IssuedCourse from "../models/IssuedCourse.js";
import { loadProgrammeSeed } from "./loadSeed.js";

async function seedProgrammes() {
  await connectDb();
  const { programmes, courses } = loadProgrammeSeed();
  for (const row of programmes) {
    await Programme.findOneAndUpdate({ groupSlug: row.groupSlug, slug: row.slug }, row, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  for (const course of courses) {
    await IssuedCourse.findOneAndUpdate(
      { code: course.code },
      { ...course, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${programmes.length} programmes and ${courses.length} courses.`);
  await mongoose.disconnect();
}

seedProgrammes().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
