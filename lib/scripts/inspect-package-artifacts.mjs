import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libRoot = path.resolve(__dirname, "..");

const maxPackedBytes = 1_200_000;
const maxUnpackedBytes = 7_875_000;
const requiredAssetFiles = [
  "map-assets/countries-reduced.topo.cjs",
  "map-assets/countries-detailed.topo.cjs",
];
const publishedJsFiles = ["dist/index.js", "dist/index.cjs"];

function walkFiles(directory, prefix = "") {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.join(prefix, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function fileSize(relativePath) {
  return statSync(path.join(libRoot, relativePath)).size;
}

function gzipSize(relativePath) {
  const content = readFileSync(path.join(libRoot, relativePath));
  return zlib.gzipSync(content, { level: 9 }).length;
}

function formatBytes(bytes) {
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const packageJson = JSON.parse(
  readFileSync(path.join(libRoot, "package.json"), "utf8"),
);
const allowedFiles = new Set(packageJson.files ?? []);
const distFiles = walkFiles(path.join(libRoot, "dist"), "dist");
const assetFiles = walkFiles(path.join(libRoot, "map-assets"), "map-assets");
const publishedFiles = [
  "README.md",
  "package.json",
  ...distFiles,
  ...assetFiles,
].filter((relativePath) => existsSync(path.join(libRoot, relativePath)));

for (const assetFile of requiredAssetFiles) {
  assert(
    existsSync(path.join(libRoot, assetFile)),
    `Missing shared topology asset: ${assetFile}`,
  );
  assert(
    allowedFiles.has("map-assets/"),
    "lib/package.json files must include map-assets/",
  );
}

for (const jsFile of publishedJsFiles) {
  const fullPath = path.join(libRoot, jsFile);
  assert(existsSync(fullPath), `Missing published JavaScript file: ${jsFile}`);
  const content = readFileSync(fullPath, "utf8");
  assert(
    !content.includes("sourceMappingURL"),
    `${jsFile} references a source map that is not published`,
  );
  for (const assetFile of requiredAssetFiles) {
    assert(
      !content.includes('Topology","objects"') ||
        content.length < fileSize(assetFile),
      `${jsFile} appears to contain an inlined topology payload`,
    );
  }
}

const unpackedBytes = publishedFiles.reduce(
  (total, relativePath) => total + fileSize(relativePath),
  0,
);
const packedEstimateBytes = publishedFiles.reduce(
  (total, relativePath) => total + gzipSize(relativePath),
  0,
);
const largestFiles = [...publishedFiles]
  .sort((left, right) => fileSize(right) - fileSize(left))
  .slice(0, 8)
  .map((relativePath) => ({
    path: relativePath,
    size: fileSize(relativePath),
    gzipSize: gzipSize(relativePath),
  }));

assert(
  unpackedBytes <= maxUnpackedBytes,
  `Estimated unpacked size ${formatBytes(unpackedBytes)} exceeds ${formatBytes(
    maxUnpackedBytes,
  )}`,
);
assert(
  packedEstimateBytes <= maxPackedBytes,
  `Estimated packed size ${formatBytes(
    packedEstimateBytes,
  )} exceeds ${formatBytes(maxPackedBytes)}`,
);

console.log(
  JSON.stringify(
    {
      package: packageJson.name,
      version: packageJson.version,
      fileCount: publishedFiles.length,
      unpackedBytes,
      packedEstimateBytes,
      largestFiles,
      sharedAssets: requiredAssetFiles.map((relativePath) => ({
        path: relativePath,
        size: fileSize(relativePath),
        gzipSize: gzipSize(relativePath),
      })),
      sourceMapReferences: publishedJsFiles.map((relativePath) => ({
        path: relativePath,
        hasSourceMapReference: readFileSync(
          path.join(libRoot, relativePath),
          "utf8",
        ).includes("sourceMappingURL"),
      })),
    },
    null,
    2,
  ),
);
