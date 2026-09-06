import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it } from "vitest";
import reducedTopoData, {
  topologyMetadata as reducedTopologyMetadata,
} from "../countries-reduced.topo.js";
import detailedTopoData, {
  topologyMetadata as detailedTopologyMetadata,
} from "../countries-detailed.topo.js";
import { getGeometryTierParseGuards } from "../map-data/geometry-tiers.js";
import {
  measureFeature,
  normalizeFeatureForProjection,
} from "../zoom/geometry.js";

type CountryProperties = {
  N: string;
  I: string;
};

type CountryTopology = Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;

type CoordinateScan = {
  count: number;
  maxPrecision: number;
};

const typedReducedTopoData = reducedTopoData as unknown as CountryTopology;
const typedDetailedTopoData = detailedTopoData as unknown as CountryTopology;
const reducedCountryCollection = topoFeature(
  typedReducedTopoData,
  typedReducedTopoData.objects.countries,
);
const detailedCountryCollection = topoFeature(
  typedDetailedTopoData,
  typedDetailedTopoData.objects.countries,
);

function decimalPlaces(value: number): number {
  const text = value.toFixed(12).replace(/0+$/, "");
  return text.split(".")[1]?.length ?? 0;
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

function countPolygonParts(geometry: GeoJSON.Geometry): number {
  if (geometry.type === "Polygon") return 1;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.length;
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.reduce(
      (count, childGeometry) => count + countPolygonParts(childGeometry),
      0,
    );
  }

  return 0;
}

describe("generated country topology", () => {
  it("preserves the package country records and ISO/name properties", () => {
    expect(reducedCountryCollection.features).toHaveLength(175);
    expect(detailedCountryCollection.features).toHaveLength(175);

    const countries = new Map(
      reducedCountryCollection.features.map((country) => [
        country.properties.I,
        country.properties.N,
      ]),
    );

    expect(countries.get("US")).toBe("United States");
    expect(countries.get("CA")).toBe("Canada");
    expect(countries.get("EH")).toBe("Western Sahara");
    expect(countries.get("XK")).toBe("Kosovo");
    expect(countries.get("CYP")).toBe("Northern Cyprus");
    expect(countries.get("CY")).toBe("Cyprus");
  });

  it("retains high-detail coordinates with at least 6 decimal places", () => {
    const summary = detailedCountryCollection.features.reduce<CoordinateScan>(
      (accumulator, country) => {
        const child = scanGeometry(country.geometry);
        return {
          count: accumulator.count + child.count,
          maxPrecision: Math.max(accumulator.maxPrecision, child.maxPrecision),
        };
      },
      { count: 0, maxPrecision: 0 },
    );

    expect(summary.count).toBeGreaterThan(400_000);
    expect(summary.maxPrecision).toBeGreaterThanOrEqual(6);
    expect(detailedTopologyMetadata.minimumCoordinatePrecision).toBe(6);
    expect(
      detailedTopologyMetadata.maximumQuantizationStepDegrees,
    ).toBeLessThanOrEqual(
      detailedTopologyMetadata.qualityBudget.maximumMaterialBoundsDeltaDegrees,
    );
  });

  it("renders every country geometry tier to non-empty closed SVG paths", () => {
    const projection = geoMercator().fitSize(
      [800, 600],
      detailedCountryCollection,
    );
    const path = geoPath().projection(projection);

    for (const collection of [
      reducedCountryCollection,
      detailedCountryCollection,
    ]) {
      for (const country of collection.features) {
        const renderedPath = path(country);
        expect(renderedPath).toEqual(expect.stringMatching(/^M/));
        expect(renderedPath).toEqual(expect.stringMatching(/Z$/));
      }
    }
  });

  it("normalizes inverted spherical rings for antimeridian and multipolygon countries", () => {
    const projection = geoMercator();
    const path = geoPath().projection(projection);
    const sphereBounds = path.bounds({ type: "Sphere" });
    const sphereWidth = sphereBounds[1][0] - sphereBounds[0][0];
    const sphereHeight = sphereBounds[1][1] - sphereBounds[0][1];

    for (const collection of [
      reducedCountryCollection,
      detailedCountryCollection,
    ]) {
      for (const countryCode of ["US", "RU"] as const) {
        const country = collection.features.find(
          (feature) => feature.properties.I === countryCode,
        )!;
        const normalizedCountry = normalizeFeatureForProjection(path, country);
        const measurement = measureFeature(path, normalizedCountry);

        expect(
          measurement.width >= sphereWidth * 0.99 &&
            measurement.height >= sphereHeight * 0.99,
        ).toBe(false);
      }
    }
  });

  it("keeps all Cyprus island land visible instead of rendering omitted source records as ocean", () => {
    for (const collection of [
      reducedCountryCollection,
      detailedCountryCollection,
    ]) {
      const cyprus = collection.features.find(
        (feature) => feature.properties.I === "CY",
      )!;

      expect(countPolygonParts(cyprus.geometry)).toBeGreaterThanOrEqual(9);
    }
  });

  it("uses quality-budgeted optimization to reduce topology size", () => {
    expect(reducedTopologyMetadata.optimization).toBe("quality-budgeted");
    expect(reducedTopologyMetadata.tier).toBe("reduced");
    expect(detailedTopologyMetadata.tier).toBe("detailed");
    expect(reducedTopologyMetadata.quantization).toBe(4_000);
    expect(detailedTopologyMetadata.quantization).toBe(10_000);
    expect(reducedTopologyMetadata.optimizedSourceBytes).toBeLessThan(
      detailedTopologyMetadata.optimizedSourceBytes,
    );
    expect(detailedTopologyMetadata.optimizedSourceBytes).toBeLessThan(
      detailedTopologyMetadata.highDetailSourceBytes,
    );
    expect(reducedTopologyMetadata.sourceSizeReductionRatio).toBeGreaterThan(
      0.87,
    );
    expect(detailedTopologyMetadata.sourceSizeReductionRatio).toBeGreaterThan(
      0.86,
    );
  });

  it("passes small-island, coastline, border, and small-country fixtures", () => {
    const fixtureCategories = new Set(
      detailedTopologyMetadata.qualityBudget.fixtures.flatMap(
        (fixture) => fixture.categories,
      ),
    );

    expect(Array.from(fixtureCategories)).toEqual(
      expect.arrayContaining([
        "small-island",
        "coastline",
        "border",
        "small-country",
      ]),
    );

    for (const fixture of [
      ...reducedTopologyMetadata.qualityBudget.fixtures,
      ...detailedTopologyMetadata.qualityBudget.fixtures,
    ]) {
      expect(fixture.passed).toBe(true);
      expect(fixture.areaDeltaRatio).toBeLessThanOrEqual(
        detailedTopologyMetadata.qualityBudget.maximumMaterialAreaDeltaRatio,
      );
      expect(fixture.maximumBoundsDeltaDegrees).toBeLessThanOrEqual(
        detailedTopologyMetadata.qualityBudget
          .maximumMaterialBoundsDeltaDegrees,
      );
    }
  });

  it("does not parse detailed topology through initial geometry tier imports", () => {
    expect(getGeometryTierParseGuards().reducedParsed).toBe(true);
    expect(getGeometryTierParseGuards().detailedParsed).toBe(false);
  });
});
