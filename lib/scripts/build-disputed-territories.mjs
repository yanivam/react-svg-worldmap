/**
 * Generates src/disputed-territories.topo.ts: the shapes drawn by the
 * opt-in `showDisputedTerritories` overlay.
 *
 * Source: Natural Earth 5.1.2 "Admin 0 – Breakaway and disputed areas" (10m),
 * pinned to the v5.1.2 tag so the output is reproducible.
 *
 * Run with:
 *   node scripts/build-disputed-territories.mjs [path/to/ne_10m_admin_0_disputed_areas.geojson]
 * Without a path, the file is downloaded from the pinned URL below.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { topology } from "topojson-server";

const SOURCE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_disputed_areas.geojson";
const SOURCE_SHA256 =
  "9cafef8b7dfb6b164dc58f218f981f4ace9f716f6c03795d4c62d1ac9f3d50f5";

// Simplification tolerance in degrees (Douglas–Peucker). 0.02° is well
// under one pixel at the largest built-in size even at 4x zoom.
const TOLERANCE = 0.02;
// Quantization grid for the TopoJSON transform.
const QUANTIZATION = 1e5;

// Territory id → dispute id, display name, and the Natural Earth BRK_A3
// codes merged into it. Order is the render order.
const TERRITORIES = [
  { id: "crimea", d: "crimea", n: "Crimea", src: ["B89"] },
  {
    id: "jammu-and-kashmir",
    d: "kashmir",
    n: "Jammu and Kashmir",
    src: ["B05"],
  },
  { id: "azad-kashmir", d: "kashmir", n: "Azad Kashmir", src: ["B09"] },
  { id: "gilgit-baltistan", d: "kashmir", n: "Gilgit-Baltistan", src: ["B08"] },
  { id: "aksai-chin", d: "kashmir", n: "Aksai Chin", src: ["B07"] },
  { id: "siachen-glacier", d: "kashmir", n: "Siachen Glacier", src: ["B45"] },
  // Following UN usage, the West Bank includes East Jerusalem.
  {
    id: "west-bank",
    d: "palestinian-territories",
    n: "West Bank",
    src: ["B54", "B98"],
  },
  { id: "gaza", d: "palestinian-territories", n: "Gaza", src: ["B53"] },
  {
    id: "western-sahara-moroccan-administered",
    d: "western-sahara",
    n: "Western Sahara (Moroccan-administered)",
    src: ["B19"],
  },
  {
    id: "western-sahara-sadr-administered",
    d: "western-sahara",
    n: "Western Sahara (SADR-administered)",
    src: ["B28"],
  },
  { id: "kosovo", d: "kosovo", n: "Kosovo", src: ["B57"] },
  { id: "taiwan", d: "taiwan", n: "Taiwan", src: ["B77"] },
];

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadSource(path) {
  const text =
    path == null
      ? await (await fetch(SOURCE_URL)).text()
      : readFileSync(resolve(path), "utf8");
  const hash = createHash("sha256").update(text).digest("hex");
  if (hash !== SOURCE_SHA256) {
    throw new Error(`Unexpected source checksum ${hash}`);
  }
  return JSON.parse(text);
}

function perpendicularDistance([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / length;
}

function simplifyLine(points) {
  if (points.length < 3) return points;
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1],
    );
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= TOLERANCE) return [points[0], points[points.length - 1]];
  return [
    ...simplifyLine(points.slice(0, index + 1)).slice(0, -1),
    ...simplifyLine(points.slice(index)),
  ];
}

// Simplifies a closed ring, keeping it closed and at least a triangle.
function simplifyRing(ring) {
  const half = Math.floor(ring.length / 2);
  const simplified = [
    ...simplifyLine(ring.slice(0, half + 1)).slice(0, -1),
    ...simplifyLine(ring.slice(half)),
  ];
  return simplified.length >= 4 ? simplified : ring;
}

function polygonsOf(geometry) {
  return geometry.type === "Polygon"
    ? [geometry.coordinates]
    : geometry.coordinates;
}

const source = await loadSource(process.argv[2]);
const byCode = new Map(
  source.features.map((feature) => [feature.properties.BRK_A3, feature]),
);

const features = TERRITORIES.map(({ id, d, n, src }) => {
  const parts = src.map((code) => {
    const feature = byCode.get(code);
    if (!feature) throw new Error(`Missing Natural Earth feature ${code}`);
    return feature;
  });
  return {
    type: "Feature",
    properties: {
      id,
      d,
      n,
      // Natural Earth's administration note, e.g. "Admin. by Russia; Claimed by Ukraine".
      a: parts[0].properties.NOTE_BRK || "",
    },
    geometry: {
      type: "MultiPolygon",
      coordinates: parts
        .flatMap((part) => polygonsOf(part.geometry))
        .map((polygon) => polygon.map(simplifyRing)),
    },
  };
});

const topo = topology(
  { territories: { type: "FeatureCollection", features } },
  QUANTIZATION,
);

const output = `/* prettier-ignore */
// AUTO-GENERATED by scripts/build-disputed-territories.mjs.
// Do not edit manually. Source: Natural Earth 5.1.2, Admin 0
// breakaway and disputed areas (10m), public domain.
// Properties: id = territory id, d = dispute id, n = name,
// a = Natural Earth administration note.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const disputedTerritoriesTopo: any = ${JSON.stringify(topo)};

export default disputedTerritoriesTopo;
`;

const outPath = resolve(__dirname, "../src/disputed-territories.topo.ts");
writeFileSync(outPath, output, "utf-8");
console.log(
  `Wrote ${outPath} (${Buffer.byteLength(output)} bytes, ${features.length} territories)`,
);
