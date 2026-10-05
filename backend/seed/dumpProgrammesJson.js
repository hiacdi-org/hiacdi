import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defaultCourses, programmesForSeed } from "../../Frontend/src/data/programmes.js";

const here = dirname(fileURLToPath(import.meta.url));
const payload = { programmes: programmesForSeed(), courses: defaultCourses };
writeFileSync(join(here, "programmes.json"), JSON.stringify(payload, null, 2));
console.log(`Wrote ${payload.programmes.length} programmes and ${payload.courses.length} courses.`);
