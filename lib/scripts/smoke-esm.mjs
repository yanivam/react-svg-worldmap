/**
 * Smoke test: ESM import of the packed package.
 * Run from a directory that has react-svg-worldmap installed (e.g. after npm install <tarball>).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const pkg = await import("react-svg-worldmap");
const type = typeof pkg.default;
const require = createRequire(import.meta.url);
const entryPath = require.resolve("react-svg-worldmap");
const packageRoot = path.resolve(path.dirname(entryPath), "..");
const sharedAssets = [
  "map-assets/countries-reduced.topo.cjs",
  "map-assets/countries-detailed.topo.cjs",
];

console.log("ESM default export:", type);
if (type !== "function") {
  console.error("Expected default to be a function (React component)");
  process.exit(1);
}
if (typeof pkg.regions !== "undefined") {
  console.log(
    "ESM named export 'regions':",
    Array.isArray(pkg.regions) ? "array" : typeof pkg.regions,
  );
}
for (const asset of sharedAssets) {
  const assetPath = path.join(packageRoot, asset);
  if (!existsSync(assetPath)) {
    console.error(`Expected shared country asset to exist: ${asset}`);
    process.exit(1);
  }
}
for (const jsFile of ["dist/index.js", "dist/index.cjs"]) {
  const jsPath = path.join(packageRoot, jsFile);
  if (
    existsSync(jsPath) &&
    readFileSync(jsPath, "utf8").includes("sourceMappingURL")
  ) {
    console.error(`Expected ${jsFile} not to reference a source map`);
    process.exit(1);
  }
}
console.log("ESM smoke OK");
