import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../src/data/starter.ts");
const countriesOutputDir = resolve(__dirname, "../src/data/countries");
const loadersOutputPath = resolve(__dirname, "../src/data/loaders.ts");
const usSourcePath =
  process.env.US_ATLAS_SOURCE_PATH ?? "/private/tmp/us-states-10m.json";
const canadaSourcePath =
  process.env.CANADA_PROVINCES_SOURCE_PATH ??
  "/private/tmp/canada-provinces.geojson";
const naturalEarthAdmin1Path =
  process.env.NATURAL_EARTH_ADMIN1_SHP_PATH ??
  "/private/tmp/ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces.shp";

const targetCountries = [
  { code: "US", name: "United States", group: "Americas" },
  { code: "CA", name: "Canada", group: "Americas" },
  { code: "MX", name: "Mexico", group: "Americas" },
  { code: "BR", name: "Brazil", group: "Americas" },
  { code: "AR", name: "Argentina", group: "Americas" },
  { code: "VE", name: "Venezuela", group: "Americas" },
  { code: "DE", name: "Germany", group: "Europe" },
  { code: "CH", name: "Switzerland", group: "Europe" },
  { code: "AT", name: "Austria", group: "Europe" },
  { code: "BE", name: "Belgium", group: "Europe" },
  { code: "BA", name: "Bosnia and Herzegovina", group: "Europe" },
  { code: "RU", name: "Russia", group: "Europe" },
  { code: "IN", name: "India", group: "Asia" },
  { code: "PK", name: "Pakistan", group: "Asia" },
  { code: "AE", name: "United Arab Emirates", group: "Asia" },
  { code: "MY", name: "Malaysia", group: "Asia" },
  { code: "IQ", name: "Iraq", group: "Asia" },
  { code: "NG", name: "Nigeria", group: "Africa" },
  { code: "ET", name: "Ethiopia", group: "Africa" },
  { code: "ZA", name: "South Africa", group: "Africa" },
  { code: "SD", name: "Sudan", group: "Africa" },
  { code: "AU", name: "Australia", group: "Oceania" },
  { code: "FM", name: "Micronesia", group: "Oceania" },
];

const naturalEarthCountries = targetCountries.filter(
  ({ code }) => code !== "US" && code !== "CA",
);

const stateFips = new Set([
  "01",
  "02",
  "04",
  "05",
  "06",
  "08",
  "09",
  "10",
  "12",
  "13",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "53",
  "54",
  "55",
  "56",
]);

const provinceKinds = new Map([
  ["Alberta", "province"],
  ["British Columbia", "province"],
  ["Manitoba", "province"],
  ["New Brunswick", "province"],
  ["Newfoundland and Labrador", "province"],
  ["Northwest Territories", "territory"],
  ["Nova Scotia", "province"],
  ["Nunavut", "territory"],
  ["Ontario", "province"],
  ["Prince Edward Island", "province"],
  ["Quebec", "province"],
  ["Saskatchewan", "province"],
  ["Yukon", "territory"],
]);

function normalizeId(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeKind(value, fallback = "region") {
  const normalized = value.trim().toLowerCase();
  return normalized === "" ? fallback : normalized;
}

const pathDecimalPlaces = Number(
  process.env.REGION_PATH_DECIMALS ?? process.env.REGION_DECIMALS ?? 1,
);

function round(value) {
  return Number(value.toFixed(pathDecimalPlaces));
}

function formatPathNumber(value) {
  const rounded = round(Number(value));
  if (Object.is(rounded, -0) || Object.is(rounded, 0)) return "0";

  return String(rounded)
    .replace(/^-0\./, "-.")
    .replace(/^0\./, ".")
    .replace(/\.0$/, "");
}

function compressPath(path) {
  return path.replace(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi, formatPathNumber);
}

function splitPathSubpaths(path) {
  return path
    .split(/(?=M)/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function measurePathSubpath(subpath) {
  const numbers = Array.from(
    subpath.matchAll(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/giu),
  ).map((match) => Number(match[0]));
  const xValues = [];
  const yValues = [];

  for (let index = 0; index < numbers.length - 1; index += 2) {
    xValues.push(numbers[index]);
    yValues.push(numbers[index + 1]);
  }

  if (xValues.length === 0 || yValues.length === 0)
    return { width: 0, height: 0 };

  return {
    width: Math.max(...xValues) - Math.min(...xValues),
    height: Math.max(...yValues) - Math.min(...yValues),
  };
}

function isArtifactSubpath(subpath) {
  const measurement = measurePathSubpath(subpath);

  return measurement.width > 900 && measurement.height > 650;
}

function removeArtifactSubpaths(path) {
  const subpaths = splitPathSubpaths(path);
  const cleanedSubpaths = subpaths.filter(
    (subpath) => !isArtifactSubpath(subpath),
  );
  if (cleanedSubpaths.length === 0)
    throw new Error("Region path cleanup removed every subpath");

  return cleanedSubpaths.join("");
}

function reversePolygonRings(coordinates) {
  return coordinates.map((ring) => [...ring].reverse());
}

function measureFeature(pathGenerator, feature) {
  const bounds = pathGenerator.bounds(feature);

  return {
    width: Math.max(0, bounds[1][0] - bounds[0][0]),
    height: Math.max(0, bounds[1][1] - bounds[0][1]),
  };
}

function isFullSphereMeasurement(pathGenerator, measurement) {
  const sphereBounds = pathGenerator.bounds({ type: "Sphere" });
  const sphereWidth = Math.max(0, sphereBounds[1][0] - sphereBounds[0][0]);
  const sphereHeight = Math.max(0, sphereBounds[1][1] - sphereBounds[0][1]);

  return (
    sphereWidth > 0 &&
    sphereHeight > 0 &&
    measurement.width >= sphereWidth * 0.99 &&
    measurement.height >= sphereHeight * 0.99
  );
}

function normalizePolygonForProjection(pathGenerator, coordinates) {
  const polygon = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates,
    },
  };
  const measurement = measureFeature(pathGenerator, polygon);
  if (!isFullSphereMeasurement(pathGenerator, measurement)) return coordinates;

  return reversePolygonRings(coordinates);
}

function normalizeFeatureForProjection(pathGenerator, feature) {
  if (feature.geometry?.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: normalizePolygonForProjection(
          pathGenerator,
          feature.geometry.coordinates,
        ),
      },
    };
  }

  if (feature.geometry?.type === "MultiPolygon") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map((coordinates) =>
          normalizePolygonForProjection(pathGenerator, coordinates),
        ),
      },
    };
  }

  return feature;
}

function roundPoint(point) {
  return [round(point[0]), round(point[1])];
}

function recordFromFeature({
  feature,
  countryCode,
  name,
  kind,
  sourceId,
  order,
  pathGenerator,
  includeSourceInId = false,
}) {
  const normalizedFeature = normalizeFeatureForProjection(
    pathGenerator,
    feature,
  );
  const generatedPath = pathGenerator(normalizedFeature);
  if (generatedPath == null || !generatedPath.startsWith("M"))
    throw new Error(`Expected renderable path for ${countryCode} ${name}`);

  const path = compressPath(removeArtifactSubpaths(generatedPath));
  const bounds = pathGenerator.bounds(normalizedFeature).map(roundPoint);
  const centroid = roundPoint(pathGenerator.centroid(normalizedFeature));

  return {
    id: `${countryCode.toLowerCase()}-${[
      normalizeId(name) || "region",
      includeSourceInId ? normalizeId(sourceId) : "",
    ]
      .filter(Boolean)
      .join("-")}`,
    countryCode,
    name,
    kind,
    path,
    centroid,
    bounds,
    order,
    sourceId,
  };
}

function getCanadaName(properties) {
  const value = properties.prov_name_en;
  return Array.isArray(value) ? value[0] : value;
}

function readDbfRecords(dbfPath) {
  const buffer = readFileSync(dbfPath);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];
  let recordOffset = 1;

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    const name = buffer
      .subarray(offset, offset + 11)
      .toString("ascii")
      .replace(/\0.*$/, "");
    const length = buffer[offset + 16];
    fields.push({ name, length, offset: recordOffset });
    recordOffset += length;
  }

  const records = [];
  for (let index = 0; index < recordCount; index += 1) {
    const offset = headerLength + index * recordLength;
    if (buffer[offset] === 0x2a) continue;

    const record = {};
    for (const field of fields) {
      record[field.name] = buffer
        .subarray(offset + field.offset, offset + field.offset + field.length)
        .toString("utf8")
        .replace(/\0/g, "")
        .trim();
    }
    records.push(record);
  }

  return records;
}

function signedArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function readShpFeatures(shpPath) {
  const buffer = readFileSync(shpPath);
  const features = [];
  let offset = 100;

  while (offset < buffer.length) {
    const contentLength = buffer.readInt32BE(offset + 4) * 2;
    const contentOffset = offset + 8;
    const shapeType = buffer.readInt32LE(contentOffset);

    if (shapeType !== 0) {
      if (shapeType !== 5)
        throw new Error(`Unsupported shapefile geometry type ${shapeType}`);

      const partCount = buffer.readInt32LE(contentOffset + 36);
      const pointCount = buffer.readInt32LE(contentOffset + 40);
      const partsOffset = contentOffset + 44;
      const pointsOffset = partsOffset + partCount * 4;
      const parts = [];

      for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
        parts.push(buffer.readInt32LE(partsOffset + partIndex * 4));
      }

      const rings = [];
      for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
        const startPoint = parts[partIndex];
        const endPoint = parts[partIndex + 1] ?? pointCount;
        const ring = [];

        for (
          let pointIndex = startPoint;
          pointIndex < endPoint;
          pointIndex += 1
        ) {
          const pointOffset = pointsOffset + pointIndex * 16;
          ring.push([
            buffer.readDoubleLE(pointOffset),
            buffer.readDoubleLE(pointOffset + 8),
          ]);
        }

        if (ring.length > 0) rings.push(ring);
      }

      const polygons = [];
      let currentPolygon = [];
      for (const ring of rings) {
        if (signedArea(ring) < 0 || currentPolygon.length === 0) {
          if (currentPolygon.length > 0) polygons.push(currentPolygon);
          currentPolygon = [ring];
        } else {
          currentPolygon.push(ring);
        }
      }
      if (currentPolygon.length > 0) polygons.push(currentPolygon);

      features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: polygons.length === 1 ? "Polygon" : "MultiPolygon",
          coordinates: polygons.length === 1 ? polygons[0] : polygons,
        },
      });
    } else {
      features.push({
        type: "Feature",
        properties: {},
        geometry: null,
      });
    }

    offset = contentOffset + contentLength;
  }

  return features;
}

function readNaturalEarthAdmin1(shpPath) {
  const dbfPath = shpPath.replace(/\.shp$/i, ".dbf");
  const geometries = readShpFeatures(shpPath);
  const records = readDbfRecords(dbfPath);
  if (geometries.length !== records.length)
    throw new Error(
      `Natural Earth geometry/record mismatch: ${geometries.length} vs ${records.length}`,
    );

  return geometries.map((feature, index) => ({
    ...feature,
    properties: records[index],
  }));
}

const pathGenerator = geoPath().projection(geoMercator());

const usTopology = JSON.parse(readFileSync(usSourcePath, "utf8"));
const usFeatures = topoFeature(usTopology, usTopology.objects.states)
  .features.filter((entry) => stateFips.has(entry.id))
  .sort((left, right) =>
    left.properties.name.localeCompare(right.properties.name),
  );

const canadaCollection = JSON.parse(readFileSync(canadaSourcePath, "utf8"));
const canadaFeatures = canadaCollection.features.sort((left, right) =>
  getCanadaName(left.properties).localeCompare(getCanadaName(right.properties)),
);

const naturalEarthFeatures = readNaturalEarthAdmin1(naturalEarthAdmin1Path);

const usRegions = usFeatures.map((entry, index) =>
  recordFromFeature({
    feature: entry,
    countryCode: "US",
    name: entry.properties.name,
    kind: "state",
    sourceId: `us-atlas@3.0.1:states-10m:${entry.id}`,
    order: index + 1,
    pathGenerator,
  }),
);

const canadaRegions = canadaFeatures.map((entry, index) => {
  const name = getCanadaName(entry.properties);
  return recordFromFeature({
    feature: entry,
    countryCode: "CA",
    name,
    kind: provinceKinds.get(name) ?? "province",
    sourceId: `opendatasoft:georef-canada-province:${
      entry.properties.prov_code?.[0] ?? name
    }`,
    order: index + 1,
    pathGenerator,
  });
});

function naturalEarthRegionsForCountry(country) {
  const features = naturalEarthFeatures
    .filter((entry) => {
      const name =
        entry.properties.name_en ||
        entry.properties.name ||
        entry.properties.gn_name ||
        "";
      return entry.properties.iso_a2 === country.code && name.trim() !== "";
    })
    .sort((left, right) =>
      (
        left.properties.name_en ||
        left.properties.name ||
        left.properties.gn_name
      ).localeCompare(
        right.properties.name_en ||
          right.properties.name ||
          right.properties.gn_name,
      ),
    );

  if (features.length === 0)
    throw new Error(
      `No Natural Earth Admin 1 records found for ${country.code}`,
    );

  return features.map((entry, index) =>
    recordFromFeature({
      feature: entry,
      countryCode: country.code,
      name:
        entry.properties.name_en ||
        entry.properties.name ||
        entry.properties.gn_name,
      kind: normalizeKind(entry.properties.type_en || entry.properties.type),
      sourceId: `naturalearth:ne_10m_admin_1_states_provinces:${
        entry.properties.adm1_code || entry.properties.ne_id
      }`,
      order: index + 1,
      pathGenerator,
      includeSourceInId: true,
    }),
  );
}

if (usRegions.length !== 50)
  throw new Error(`Expected 50 US states, generated ${usRegions.length}`);
if (canadaRegions.length !== 13)
  throw new Error(
    `Expected 13 Canada provinces/territories, generated ${canadaRegions.length}`,
  );

const regionCollections = {
  US: {
    countryCode: "US",
    countryName: "United States",
    coverageStatus: "complete",
    expectedRegionCount: 50,
    sourceSummary:
      "Generated from us-atlas@3.0.1 states-10m TopoJSON, derived from U.S. Census Bureau cartographic boundary data.",
    sourceUrl: "https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json",
    reviewNotes:
      "Coverage includes the 50 U.S. states. District of Columbia and territories are not included in this first-level states layer.",
    regions: usRegions,
  },
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    coverageStatus: "complete",
    expectedRegionCount: 13,
    sourceSummary:
      "Generated from Opendatasoft georef-canada-province GeoJSON using Statistics Canada province and territory records.",
    sourceUrl:
      "https://public.opendatasoft.com/explore/dataset/georef-canada-province/",
    reviewNotes:
      "Coverage includes Canada's 10 provinces and 3 territories as thematic map data, not legal boundary data.",
    regions: canadaRegions,
  },
};

for (const country of naturalEarthCountries) {
  const regions = naturalEarthRegionsForCountry(country);
  regionCollections[country.code] = {
    countryCode: country.code,
    countryName: country.name,
    coverageStatus: "complete",
    expectedRegionCount: regions.length,
    sourceSummary:
      "Generated from Natural Earth Admin 1 states/provinces 10m cultural vectors.",
    sourceUrl:
      "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/",
    reviewNotes:
      "Complete target-country coverage from Natural Earth Admin 1. Boundaries and names are thematic and non-authoritative; maintainers should review country-specific official sources before changing expected counts.",
    regions,
  };
}

const missing = targetCountries
  .map(({ code }) => code)
  .filter((code) => regionCollections[code] == null);
if (missing.length > 0)
  throw new Error(`Missing target region collections: ${missing.join(", ")}`);

const output = `import type { RegionCollectionRecord } from "react-svg-worldmap";

export const regionCollections: Record<string, RegionCollectionRecord> = ${JSON.stringify(
  regionCollections,
  null,
  2,
)};
`;

writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);

mkdirSync(countriesOutputDir, { recursive: true });
const countryCodes = Object.keys(regionCollections).sort((left, right) =>
  left.localeCompare(right),
);
for (const countryCode of countryCodes) {
  const countryOutput = `import type { RegionCollectionRecord } from "react-svg-worldmap";

export const regionCollection = ${JSON.stringify(
    regionCollections[countryCode],
    null,
    2,
  )} satisfies RegionCollectionRecord;
`;

  writeFileSync(join(countriesOutputDir, `${countryCode}.ts`), countryOutput);
}

const loadersOutput = `import type { ISOCode, RegionCollectionRecord } from "react-svg-worldmap";

type RegionCollectionLoader = () => Promise<RegionCollectionRecord>;

export const regionCollectionLoaders: Record<string, RegionCollectionLoader> = {
${countryCodes
  .map(
    (countryCode) =>
      `  ${countryCode}: () => import("./countries/${countryCode}.js").then((module) => module.regionCollection),`,
  )
  .join("\n")}
};

export async function loadRegionCollection(
  countryCode: ISOCode | string,
): Promise<RegionCollectionRecord | undefined> {
  return regionCollectionLoaders[countryCode.toUpperCase()]?.();
}

export async function loadRegionCollections(): Promise<
  Record<string, RegionCollectionRecord>
> {
  const entries = await Promise.all(
    Object.entries(regionCollectionLoaders).map(async ([countryCode, load]) => [
      countryCode,
      await load(),
    ] as const),
  );

  return Object.fromEntries(entries);
}
`;

writeFileSync(loadersOutputPath, loadersOutput);
console.log(`Wrote ${countriesOutputDir}`);
console.log(`Wrote ${loadersOutputPath}`);
for (const { code, name } of targetCountries) {
  console.log(
    `${name} (${code}) regions: ${regionCollections[code].regions.length}`,
  );
}
