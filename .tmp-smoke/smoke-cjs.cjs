/**
 * Smoke test: CJS require() of the packed package.
 * Run from a directory that has react-svg-worldmap installed (e.g. after npm install <tarball>).
 * Does not assume default: accepts module.exports = fn or { default: fn } or __esModule interop.
 */
const pkg = require("react-svg-worldmap");

const candidate =
  (pkg && pkg.__esModule && pkg.default) || (pkg && pkg.default) || pkg;

const type = typeof candidate;
console.log("CJS export type:", type);
if (type !== "function") {
  console.error(
    "Expected module to resolve to a function (React component). Got:",
    pkg,
  );
  process.exit(1);
}
console.log("CJS smoke OK");
