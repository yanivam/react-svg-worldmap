/**
 * Builds the detailed country geometry that the map loads lazily when zoomed
 * in (lib/src/map-assets/countries-detailed.cjs).
 *
 * Input: Natural Earth Admin 0 10m, as redistributed by the pinned
 * `world-atlas` devDependency (countries-10m.json). The country list, names
 * and codes come from lib/src/countries.topo.ts, so both tiers describe the
 * same countries in the same order.
 *
 * Assignment policy (see docs/map-data-policy.md): the detailed tier assigns
 * land the same way the default tier does.
 * - Crimea is part of Ukraine, as in the default tier. Natural Earth's
 *   default view puts it in Russia, so it is moved and dissolved into UA.
 * - Small non-country units inside a country of the default tier are merged
 *   into it (see `mergedUnits`).
 * - Units that are not countries of the default tier are left out (see
 *   `omittedUnits`); the build fails on any unit that is in neither list.
 *
 * Run from lib/:
 *   node scripts/build-detailed-countries.mjs          # write the asset
 *   node scripts/build-detailed-countries.mjs --check  # fail if out of date
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoArea, geoContains } from "d3-geo";
import { feature, merge } from "topojson-client";
import { topology } from "topojson-server";

const require = createRequire(import.meta.url);
const libRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = path.join(libRoot, "src/map-assets/countries-detailed.cjs");
const sourceName = "world-atlas@2.0.2/countries-10m.json";
const quantization = 1e4;

// cspell:disable -- Natural Earth unit names.

// Default-tier name -> Natural Earth (world-atlas) name, where they differ.
const atlasNames = {
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Brunei Darussalam": "Brunei",
  "Central African Republic": "Central African Rep.",
  "Côted'Ivoire": "Côte d'Ivoire",
  "Czech Republic": "Czechia",
  "Dem. Rep. Korea": "North Korea",
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  Eswatini: "eSwatini",
  "Falkland Islands": "Falkland Is.",
  "Lao PDR": "Laos",
  "Northern Cyprus": "N. Cyprus",
  "Republic of Korea": "South Korea",
  "Republic of the Congo": "Congo",
  "Solomon Islands": "Solomon Is.",
  "South Sudan": "S. Sudan",
  "The Gambia": "Gambia",
  "United States": "United States of America",
  "Western Sahara": "W. Sahara",
};

// Natural Earth units that are part of a default-tier country.
const mergedUnits = {
  Akrotiri: "CY",
  Dhekelia: "CY",
  "Cyprus U.N. Buffer Zone": "CY",
  Baikonur: "KZ",
  "USNB Guantanamo Bay": "CU",
  "Hong Kong": "CN",
  Macao: "CN",
};

// Natural Earth units that are not countries of the default tier.
// Siachen Glacier is claimed by India and Pakistan; it is left out rather
// than assigned to either (the disputed-territory overlay draws it).
const omittedUnits = new Set([
  "Siachen Glacier",
  "Antarctica",
  "Fr. S. Antarctic Lands",
  "Heard I. and McDonald Is.",
  "S. Geo. and the Is.",
  // Countries and territories that the default tier does not include.
  "Andorra",
  "Liechtenstein",
  "Monaco",
  "San Marino",
  "Vatican",
  "Malta",
  "Singapore",
  "Bahrain",
  "Gibraltar",
  "Jersey",
  "Guernsey",
  "Isle of Man",
  "Åland",
  "Faeroe Is.",
  "St-Martin",
  "Sint Maarten",
  "Curaçao",
  "Aruba",
  "Turks and Caicos Is.",
  "St. Pierre and Miquelon",
  "Pitcairn Is.",
  "Fr. Polynesia",
  "Seychelles",
  "Kiribati",
  "Marshall Is.",
  "Grenada",
  "St. Vin. and Gren.",
  "Barbados",
  "Saint Lucia",
  "Dominica",
  "U.S. Minor Outlying Is.",
  "Montserrat",
  "Antigua and Barb.",
  "St. Kitts and Nevis",
  "U.S. Virgin Is.",
  "St-Barthélemy",
  "Anguilla",
  "British Virgin Is.",
  "Cayman Is.",
  "Bermuda",
  "Saint Helena",
  "Mauritius",
  "Comoros",
  "São Tomé and Principe",
  "Cabo Verde",
  "Indian Ocean Ter.",
  "Br. Indian Ocean Ter.",
  "Norfolk Island",
  "Cook Is.",
  "Tonga",
  "Wallis and Futuna Is.",
  "Samoa",
  "Tuvalu",
  "Maldives",
  "Nauru",
  "Micronesia",
  "Niue",
  "American Samoa",
  "Palau",
  "Guam",
  "N. Mariana Is.",
  "Coral Sea Is.",
  "Spratly Is.",
  "Clipperton I.",
  "Ashmore and Cartier Is.",
  "Bajo Nuevo Bank",
  "Serranilla Bank",
  "Scarborough Reef",
]);

// cspell:enable

// A point inside Crimea (Simferopol).
const crimeaPoint = [34.1, 44.95];

function readDefaultTierCountries() {
  const text = readFileSync(
    path.join(libRoot, "src/countries.topo.ts"),
    "utf8",
  );
  const match = /const topoData: any = (\{.*\});/.exec(text);
  if (match == null) throw new Error("Could not read src/countries.topo.ts");
  const topo = JSON.parse(match[1]);
  return topo.objects.countries.geometries.map(({ properties }) => ({
    N: properties.N,
    I: properties.I,
  }));
}

function polygonsOf(geometry) {
  if (geometry.type === "Polygon") return [geometry.arcs];
  if (geometry.type === "MultiPolygon") return geometry.arcs;
  return [];
}

// Each polygon in d3's winding: the exterior ring clockwise, so the polygon
// covers less than a hemisphere.
function rewind(geometry) {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const fixed = polygons.map((rings) =>
    geoArea({ type: "Polygon", coordinates: rings }) > 2 * Math.PI
      ? rings.map((ring) => ring.slice().reverse())
      : rings,
  );
  return { type: "MultiPolygon", coordinates: fixed };
}

function buildFeatures() {
  const atlas = JSON.parse(
    readFileSync(require.resolve("world-atlas/countries-10m.json"), "utf8"),
  );
  const units = atlas.objects.countries.geometries;
  const byName = new Map(units.map((unit) => [unit.properties.name, unit]));
  const countries = readDefaultTierCountries();

  // Unit geometries (in topology arcs) collected per default-tier code.
  const parts = new Map(countries.map(({ I }) => [I, []]));
  const used = new Set();
  for (const { N, I } of countries) {
    const name = atlasNames[N] ?? N;
    const unit = byName.get(name);
    if (unit == null) throw new Error(`No Natural Earth unit for ${N}`);
    used.add(name);
    parts.get(I).push(...polygonsOf(unit));
  }
  for (const [name, code] of Object.entries(mergedUnits)) {
    const unit = byName.get(name);
    if (unit == null) throw new Error(`No Natural Earth unit named ${name}`);
    used.add(name);
    parts.get(code).push(...polygonsOf(unit));
  }
  const unhandled = units
    .map((unit) => unit.properties.name)
    .filter((name) => !used.has(name) && !omittedUnits.has(name));
  if (unhandled.length > 0)
    throw new Error(`Unhandled Natural Earth units: ${unhandled.join(", ")}`);

  // Crimea: move the Russian polygon that contains it to Ukraine.
  const russia = parts.get("RU");
  const crimeaIndex = russia.findIndex((polygon) =>
    geoContains(
      feature(atlas, { type: "Polygon", arcs: polygon }),
      crimeaPoint,
    ),
  );
  if (crimeaIndex === -1) {
    const inUkraine = parts
      .get("UA")
      .some((polygon) =>
        geoContains(
          feature(atlas, { type: "Polygon", arcs: polygon }),
          crimeaPoint,
        ),
      );
    if (!inUkraine) throw new Error("Crimea is in neither Russia nor Ukraine");
  } else {
    parts.get("UA").push(...russia.splice(crimeaIndex, 1));
  }

  // Dissolve each country's parts so shared borders (Crimea and Ukraine,
  // Cyprus and its buffer zone) are not drawn inside the country.
  return countries.map(({ N, I }) => ({
    type: "Feature",
    properties: { N, I },
    geometry: rewind(
      merge(
        atlas,
        parts.get(I).map((arcs) => ({ type: "Polygon", arcs })),
      ),
    ),
  }));
}

// Quantization can collapse a tiny island or lake to a ring of repeated
// points, or flip a tiny island inside out (covering the globe). Returns each
// country's polygons without those rings and polygons, or null when nothing
// was dropped.
function withoutCollapsedRings(topo, features) {
  const zeroLength = new Set(
    topo.arcs.flatMap((arc, i) =>
      arc.slice(1).every(([dx, dy]) => dx === 0 && dy === 0) ? [i] : [],
    ),
  );
  const collapsed = (ring) =>
    ring.every((ref) => zeroLength.has(ref < 0 ? ~ref : ref));
  let changed = false;
  const next = topo.objects.countries.geometries.map((geometry, i) => {
    const source = features[i].geometry.coordinates;
    const kept = [];
    geometry.arcs.forEach((rings, j) => {
      const exterior = feature(topo, { type: "Polygon", arcs: [rings[0]] });
      const area = geoArea(exterior);
      if (collapsed(rings[0]) || area === 0 || area > 2 * Math.PI) {
        changed = true;
        return;
      }
      const holes = rings.slice(1).filter((ring) => !collapsed(ring));
      if (holes.length !== rings.length - 1) changed = true;
      kept.push([
        source[j][0],
        ...source[j].slice(1).filter((_, k) => !collapsed(rings[k + 1])),
      ]);
    });
    if (kept.length === 0)
      throw new Error(`Quantization removed all of ${geometry.properties.N}`);
    return kept;
  });
  return changed ? next : null;
}

function buildAsset() {
  let features = buildFeatures();
  for (;;) {
    const topo = topology(
      { countries: { type: "FeatureCollection", features } },
      quantization,
    );
    for (const geometry of topo.objects.countries.geometries)
      if (geometry.type === "Polygon") {
        geometry.type = "MultiPolygon";
        geometry.arcs = [geometry.arcs];
      }
    const next = withoutCollapsedRings(topo, features);
    if (next == null)
      return [
        "/* prettier-ignore */",
        "// AUTO-GENERATED by lib/scripts/build-detailed-countries.mjs - do not edit.",
        `// Source: ${sourceName} (Natural Earth Admin 0 10m), quantized to ${quantization}.`,
        `module.exports = ${JSON.stringify(topo)};`,
        "",
      ].join("\n");
    features = features.map((country, i) => ({
      ...country,
      geometry: { type: "MultiPolygon", coordinates: next[i] },
    }));
  }
}

const output = buildAsset();
if (process.argv.includes("--check")) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    console.error(
      "src/map-assets/countries-detailed.cjs is out of date. Run: node scripts/build-detailed-countries.mjs",
    );
    process.exit(1);
  }
  console.log("src/map-assets/countries-detailed.cjs is up to date.");
} else {
  writeFileSync(outputPath, output, "utf8");
  console.log(
    `Wrote src/map-assets/countries-detailed.cjs (${(
      Buffer.byteLength(output) / 1024
    ).toFixed(1)} KB)`,
  );
}
