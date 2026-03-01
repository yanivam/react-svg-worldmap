/**
 * Smoke test: ESM import of the packed package.
 * Run from a directory that has react-svg-worldmap installed (e.g. after npm install <tarball>).
 */
const pkg = await import("react-svg-worldmap");
const type = typeof pkg.default;
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
console.log("ESM smoke OK");
