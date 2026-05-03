/**
 * Regenerates countries.topo.ts from the documented Natural Earth Admin 0
 * source path while preserving the package's current country records.
 *
 * Run with: yarn workspace react-svg-worldmap tsx scripts/migrate-to-topo.ts
 *
 * The default source is world-atlas@2.0.2 countries-10m.json, a TopoJSON
 * redistribution of Natural Earth Admin 0 10m data. Override with:
 * WORLD_ATLAS_SOURCE_PATH=/path/to/countries-10m.json
 */

import { geoArea, geoBounds } from "d3-geo";
import { readFileSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { feature as topoFeature } from "topojson-client";
import { topology } from "topojson-server";
import type { GeometryCollection, Topology } from "topojson-specification";
import currentTopoData from "../src/countries.topo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json";
const outputPath = resolve(__dirname, "../src/countries.topo.ts");
const baselineOutputPath = process.env.WORLD_ATLAS_BASELINE_OUTPUT_PATH;
const sourcePath = process.env.WORLD_ATLAS_SOURCE_PATH;
const minimumCoordinatePrecision = 6;
const defaultQuantization = 10_000;
const optimizationMode =
  process.env.WORLD_ATLAS_OPTIMIZATION === "none" ? "none" : "quality-budgeted";
const quantization = Number(
  process.env.WORLD_ATLAS_QUANTIZATION ?? defaultQuantization,
);
const maximumMaterialBoundsDeltaDegrees = 0.05;
const maximumMaterialAreaDeltaRatio = 0.1;

const atlasNameByCurrentName: Record<string, string> = {
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Brunei Darussalam": "Brunei",
  "Central African Republic": "Central African Rep.",
  "Czech Republic": "Czechia",
  "Dem. Rep. Korea": "North Korea",
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
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

type CurrentCountry = {
  N: string;
  I: string;
};

type AtlasCountryProperties = {
  name: string;
};

type CountryTopology = Topology<{
  countries: GeometryCollection<CurrentCountry>;
}>;

type AtlasTopology = Topology<{
  countries: GeometryCollection<AtlasCountryProperties>;
}>;

type CoordinateScan = {
  count: number;
  maxPrecision: number;
};

type QualityFixture = {
  countryCode: string;
  categories: string[];
};

type QualityFixtureResult = QualityFixture & {
  areaDeltaRatio: number;
  maximumBoundsDeltaDegrees: number;
  passed: boolean;
};

type TopologyMetadata = {
  source: string;
  countries: number;
  coordinates: number;
  maximumSourcePrecision: number;
  minimumCoordinatePrecision: number;
  optimization: "none" | "quality-budgeted";
  quantization: number | null;
  maximumQuantizationStepDegrees: number | null;
  compression: string[];
  lossyReduction: string;
  highDetailSourceBytes: number;
  optimizedSourceBytes: number;
  sourceSizeReductionRatio: number;
  qualityBudget: {
    maximumMaterialBoundsDeltaDegrees: number;
    maximumMaterialAreaDeltaRatio: number;
    fixtures: QualityFixtureResult[];
  };
};

const qualityFixtures: QualityFixture[] = [
  { countryCode: "CY", categories: ["small-island"] },
  { countryCode: "NO", categories: ["coastline"] },
  { countryCode: "EH", categories: ["border"] },
  { countryCode: "XK", categories: ["small-country", "border"] },
  { countryCode: "LU", categories: ["small-country"] },
];

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getPropertyString(
  properties: GeoJSON.GeoJsonProperties | undefined,
  propertyName: string,
): string {
  const value = properties?.[propertyName] as unknown;
  if (typeof value !== "string")
    throw new Error(`Expected string property ${propertyName}`);

  return value;
}

function readCurrentCountries(): CurrentCountry[] {
  const typedCurrentTopoData = currentTopoData as unknown as CountryTopology;
  const collection = topoFeature(
    typedCurrentTopoData,
    typedCurrentTopoData.objects.countries,
  );

  return collection.features.map((country) => ({
    N: getPropertyString(country.properties, "N"),
    I: getPropertyString(country.properties, "I"),
  }));
}

function loadSource(): Promise<unknown> {
  if (sourcePath != null && sourcePath.length > 0)
    return Promise.resolve(JSON.parse(readFileSync(sourcePath, "utf-8")));

  return new Promise((resolvePromise, rejectPromise) => {
    get(sourceUrl, (response) => {
      if (response.statusCode !== 200) {
        const statusCode = response.statusCode ?? "unknown";
        rejectPromise(
          new Error(`Failed to download ${sourceUrl}: ${statusCode}`),
        );
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolvePromise(JSON.parse(body));
      });
    }).on("error", rejectPromise);
  });
}

function decimalPlaces(value: number): number {
  const text = value.toFixed(12).replace(/0+$/, "");
  const decimal = text.split(".")[1];
  return decimal?.length ?? 0;
}

function isPosition(value: unknown): value is [number, number, ...number[]] {
  if (
    Array.isArray(value) &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  )
    return true;

  return false;
}

function scanCoordinates(coordinates: unknown): CoordinateScan {
  if (isPosition(coordinates)) {
    return {
      count: 1,
      maxPrecision: Math.max(
        decimalPlaces(coordinates[0]),
        decimalPlaces(coordinates[1]),
      ),
    };
  }

  if (!Array.isArray(coordinates)) {
    return {
      count: 0,
      maxPrecision: 0,
    };
  }

  return coordinates.reduce<CoordinateScan>(
    (summary, value) => {
      const child = scanCoordinates(value);
      return {
        count: summary.count + child.count,
        maxPrecision: Math.max(summary.maxPrecision, child.maxPrecision),
      };
    },
    { count: 0, maxPrecision: 0 },
  );
}

function hasCoordinates(
  geometry: GeoJSON.Geometry,
): geometry is Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection> {
  return "coordinates" in geometry;
}

function scanGeometry(geometry: GeoJSON.Geometry): CoordinateScan {
  if (hasCoordinates(geometry)) return scanCoordinates(geometry.coordinates);

  return geometry.geometries.reduce<CoordinateScan>(
    (summary, childGeometry) => {
      const child = scanGeometry(childGeometry);
      return {
        count: summary.count + child.count,
        maxPrecision: Math.max(summary.maxPrecision, child.maxPrecision),
      };
    },
    { count: 0, maxPrecision: 0 },
  );
}

function getFeatureCollection(source: unknown): GeoJSON.FeatureCollection {
  const sourceTopology = source as AtlasTopology;
  const currentCountries = readCurrentCountries();
  const atlasNameLookup = new Map(
    sourceTopology.objects.countries.geometries.map((geometry) => {
      const name = getPropertyString(geometry.properties, "name");
      return [normalizeName(name), name];
    }),
  );
  const atlasCollection = topoFeature(
    sourceTopology,
    sourceTopology.objects.countries,
  );
  const atlasFeatures = new Map(
    atlasCollection.features.map((country) => {
      const name = getPropertyString(country.properties, "name");
      return [normalizeName(name), country];
    }),
  );

  const features = currentCountries.map((country) => {
    const atlasName = atlasNameByCurrentName[country.N] ?? country.N;
    const canonicalAtlasName = atlasNameLookup.get(normalizeName(atlasName));
    if (canonicalAtlasName == null)
      throw new Error(`No Natural Earth geometry found for ${country.N}`);

    const atlasFeature = atlasFeatures.get(normalizeName(canonicalAtlasName));
    if (atlasFeature == null)
      throw new Error(`No decoded geometry found for ${country.N}`);

    return {
      type: "Feature",
      properties: {
        N: country.N,
        I: country.I,
      },
      geometry: atlasFeature.geometry,
    } satisfies GeoJSON.Feature;
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function getCountryByIsoCode(
  collection: GeoJSON.FeatureCollection,
  countryCode: string,
): GeoJSON.Feature {
  const country = collection.features.find(
    (feature) => getPropertyString(feature.properties, "I") === countryCode,
  );
  if (country == null)
    throw new Error(`No generated country found for ${countryCode}`);

  return country;
}

function getBoundsDeltaDegrees(
  baselineBounds: [[number, number], [number, number]],
  optimizedBounds: [[number, number], [number, number]],
): number {
  return Math.max(
    Math.abs(baselineBounds[0][0] - optimizedBounds[0][0]),
    Math.abs(baselineBounds[0][1] - optimizedBounds[0][1]),
    Math.abs(baselineBounds[1][0] - optimizedBounds[1][0]),
    Math.abs(baselineBounds[1][1] - optimizedBounds[1][1]),
  );
}

function getFixtureResults(
  baselineTopology: Topology,
  optimizedTopology: Topology,
): QualityFixtureResult[] {
  const baselineCollection = topoFeature(
    baselineTopology,
    baselineTopology.objects.countries,
  );
  const optimizedCollection = topoFeature(
    optimizedTopology,
    optimizedTopology.objects.countries,
  );

  return qualityFixtures.map((fixture) => {
    const baselineCountry = getCountryByIsoCode(
      baselineCollection,
      fixture.countryCode,
    );
    const optimizedCountry = getCountryByIsoCode(
      optimizedCollection,
      fixture.countryCode,
    );
    const baselineArea = geoArea(baselineCountry);
    const optimizedArea = geoArea(optimizedCountry);
    const areaDeltaRatio =
      baselineArea === 0
        ? 0
        : Math.abs(baselineArea - optimizedArea) / baselineArea;
    const maximumBoundsDeltaDegrees = getBoundsDeltaDegrees(
      geoBounds(baselineCountry),
      geoBounds(optimizedCountry),
    );

    return {
      ...fixture,
      areaDeltaRatio,
      maximumBoundsDeltaDegrees,
      passed:
        areaDeltaRatio <= maximumMaterialAreaDeltaRatio &&
        maximumBoundsDeltaDegrees <= maximumMaterialBoundsDeltaDegrees,
    };
  });
}

function getMaximumQuantizationStepDegrees(topo: Topology): number | null {
  if (topo.transform == null) return null;

  return Math.max(topo.transform.scale[0], topo.transform.scale[1]);
}

function createOutput(topo: Topology, metadata: TopologyMetadata): string {
  return `/* prettier-ignore */
// AUTO-GENERATED by lib/scripts/migrate-to-topo.ts - do not edit manually.
// Regenerate: yarn workspace react-svg-worldmap tsx scripts/migrate-to-topo.ts

export const topologyMetadata = ${JSON.stringify(metadata, null, 2)} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topoData: any = ${JSON.stringify(topo)};

export default topoData;
`;
}

const source = await loadSource();
const featureCollection = getFeatureCollection(source);
const coordinateSummary = featureCollection.features.reduce<CoordinateScan>(
  (summary, country) => {
    const child = scanGeometry(country.geometry);
    return {
      count: summary.count + child.count,
      maxPrecision: Math.max(summary.maxPrecision, child.maxPrecision),
    };
  },
  { count: 0, maxPrecision: 0 },
);

if (coordinateSummary.maxPrecision < minimumCoordinatePrecision) {
  throw new Error(
    `Expected source precision >= ${minimumCoordinatePrecision}, got ${coordinateSummary.maxPrecision}`,
  );
}

const highDetailTopo = topology({ countries: featureCollection });
const optimizedTopo =
  optimizationMode === "quality-budgeted"
    ? topology({ countries: featureCollection }, quantization)
    : highDetailTopo;
const fixtureResults = getFixtureResults(highDetailTopo, optimizedTopo);
const failedFixture = fixtureResults.find((fixture) => !fixture.passed);
if (failedFixture != null) {
  throw new Error(
    `Quality-budget fixture failed for ${failedFixture.countryCode}`,
  );
}

const highDetailSourceBytes = Buffer.byteLength(
  JSON.stringify(highDetailTopo),
  "utf-8",
);
const optimizedSourceBytes = Buffer.byteLength(
  JSON.stringify(optimizedTopo),
  "utf-8",
);
if (
  optimizationMode === "quality-budgeted" &&
  optimizedSourceBytes >= highDetailSourceBytes
)
  throw new Error("Optimized topology did not reduce source size");

const maximumQuantizationStepDegrees =
  getMaximumQuantizationStepDegrees(optimizedTopo);
if (
  maximumQuantizationStepDegrees != null &&
  maximumQuantizationStepDegrees > maximumMaterialBoundsDeltaDegrees
) {
  throw new Error(
    `Expected quantization step <= ${maximumMaterialBoundsDeltaDegrees}, got ${maximumQuantizationStepDegrees}`,
  );
}

const metadata: TopologyMetadata = {
  source: sourcePath ?? sourceUrl,
  countries: featureCollection.features.length,
  coordinates: coordinateSummary.count,
  maximumSourcePrecision: coordinateSummary.maxPrecision,
  minimumCoordinatePrecision,
  optimization: optimizationMode,
  quantization: optimizationMode === "quality-budgeted" ? quantization : null,
  maximumQuantizationStepDegrees,
  compression: [
    "TopoJSON arc sharing",
    "TopoJSON delta encoding",
    "JSON minification",
  ],
  lossyReduction:
    optimizationMode === "quality-budgeted"
      ? "quality-budgeted TopoJSON quantization"
      : "none beyond source topology quantization",
  highDetailSourceBytes,
  optimizedSourceBytes,
  sourceSizeReductionRatio:
    highDetailSourceBytes === 0
      ? 0
      : 1 - optimizedSourceBytes / highDetailSourceBytes,
  qualityBudget: {
    maximumMaterialBoundsDeltaDegrees,
    maximumMaterialAreaDeltaRatio,
    fixtures: fixtureResults,
  },
};

if (baselineOutputPath != null && baselineOutputPath.length > 0)
  writeFileSync(baselineOutputPath, createOutput(highDetailTopo, metadata));

const output = createOutput(optimizedTopo, metadata);
writeFileSync(outputPath, output, "utf-8");

const bytes = Buffer.byteLength(output, "utf-8");
console.log("Written to lib/src/countries.topo.ts");
console.log(`Source: ${metadata.source}`);
console.log(`Countries: ${metadata.countries}`);
console.log(`Coordinates: ${metadata.coordinates}`);
console.log(`Max source precision: ${metadata.maximumSourcePrecision}`);
console.log(`Optimization: ${metadata.optimization}`);
console.log(`Quantization: ${metadata.quantization ?? "none"}`);
console.log(
  `Max quantization step: ${
    metadata.maximumQuantizationStepDegrees?.toString() ?? "none"
  }`,
);
console.log(`Compression: ${metadata.compression.join(" + ")}`);
console.log(`Lossy reduction: ${metadata.lossyReduction}`);
console.log(
  `High-detail source: ${(highDetailSourceBytes / 1024).toFixed(1)} KB`,
);
console.log(`Optimized source: ${(optimizedSourceBytes / 1024).toFixed(1)} KB`);
console.log(
  `Source size reduction: ${(metadata.sourceSizeReductionRatio * 100).toFixed(
    1,
  )}%`,
);
console.log(
  `Quality fixtures: ${fixtureResults
    .map((fixture) => `${fixture.countryCode}=pass`)
    .join(", ")}`,
);
console.log(`Output: ${(bytes / 1024).toFixed(1)} KB`);
