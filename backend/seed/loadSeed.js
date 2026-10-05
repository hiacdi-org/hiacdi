import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));

export function loadProgrammeSeed() {
  const data = JSON.parse(readFileSync(join(here, "programmes.json"), "utf8"));
  return {
    programmes: data.programmes || [],
    courses: data.courses || [],
  };
}
