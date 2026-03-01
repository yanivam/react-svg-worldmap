/**
 * Inline source content into .js.map / .cjs.map files so DevTools can resolve
 * sources without needing ../src/ on disk (fixes "Failed to parse source map"
 * when only dist/ is published). See Issue #149.
 *
 * Run from lib directory: node scripts/inline-sourcemaps.cjs
 * Exits with code 1 if any source file could not be inlined (so CI catches it).
 */

const fs = require("fs");
const path = require("path");

const libRoot = path.resolve(__dirname, "..");
const distDir = path.join(libRoot, "dist");

function isVirtualOrNonFile(source) {
  if (typeof source !== "string") return true;
  if (source.startsWith("webpack://") || source.includes("://")) return true;
  return false;
}

function findJsMapFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      findJsMapFiles(full, list);
    } else if (
      e.isFile() &&
      (e.name.endsWith(".js.map") || e.name.endsWith(".cjs.map"))
    ) {
      list.push(full);
    }
  }
  return list;
}

function inlineSourcemaps() {
  const mapFiles = findJsMapFiles(distDir);
  let totalMissing = 0;
  const missingByMap = [];

  for (const mapPath of mapFiles) {
    const mapDir = path.dirname(mapPath);
    const raw = fs.readFileSync(mapPath, "utf8");
    const map = JSON.parse(raw);

    if (!map.sources || map.sources.length === 0) continue;

    const sourcesContent = [];
    let missing = 0;

    for (const source of map.sources) {
      if (isVirtualOrNonFile(source)) {
        sourcesContent.push(null);
        continue;
      }

      const resolved = path.isAbsolute(source)
        ? source
        : path.resolve(mapDir, source);
      if (!resolved.startsWith(libRoot)) {
        sourcesContent.push(null);
        missing++;
        continue;
      }

      try {
        const content = fs.readFileSync(resolved, "utf8");
        sourcesContent.push(content);
      } catch (_) {
        sourcesContent.push(null);
        missing++;
      }
    }

    if (missing > 0) {
      totalMissing += missing;
      missingByMap.push({ map: path.relative(libRoot, mapPath), missing });
    }

    map.sourcesContent = sourcesContent;
    fs.writeFileSync(mapPath, JSON.stringify(map), "utf8");
  }

  if (totalMissing > 0) {
    console.error(
      "[inline-sourcemaps] Warning: some sources could not be inlined:",
    );
    missingByMap.forEach(({ map: m, missing }) =>
      console.error(`  ${m}: ${missing} missing`),
    );
    console.error(`  Total missing: ${totalMissing}`);
    process.exit(1);
  }
}

inlineSourcemaps();
