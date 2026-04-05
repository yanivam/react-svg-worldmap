import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootReadmePath = resolve(__dirname, "../../README.md");
const outputReadmePath = resolve(__dirname, "../README.md");

const startMarker = "<!-- npm-readme:start -->";
const endMarker = "<!-- npm-readme:end -->";

const rootReadme = readFileSync(rootReadmePath, "utf8");
const start = rootReadme.indexOf(startMarker);
const end = rootReadme.indexOf(endMarker);

if (start === -1 || end === -1 || end <= start) {
  throw new Error("README npm markers are missing or invalid.");
}

const generated = `${rootReadme
  .slice(start + startMarker.length, end)
  .trim()}\n`;

writeFileSync(outputReadmePath, generated, "utf8");
console.log("Generated lib/README.md from README.md");
