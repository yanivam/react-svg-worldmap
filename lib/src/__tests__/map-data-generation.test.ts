import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it } from "vitest";
import topoData, { topologyMetadata } from "../countries.topo.js";

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

const typedTopoData = topoData as unknown as CountryTopology;
const countryCollection = topoFeature(
  typedTopoData,
  typedTopoData.objects.countries,
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

describe("generated country topology", () => {
  it("preserves the package country records and ISO/name properties", () => {
    expect(countryCollection.features).toHaveLength(175);

    const countries = new Map(
      countryCollection.features.map((country) => [
        country.properties.I,
        country.properties.N,
      ]),
    );

    expect(countries.get("US")).toBe("United States");
    expect(countries.get("CA")).toBe("Canada");
    expect(countries.get("EH")).toBe("Western Sahara");
    expect(countries.get("XK")).toBe("Kosovo");
    expect(countries.get("CYP")).toBe("Northern Cyprus");
  });

  it("retains high-detail coordinates with at least 6 decimal places", () => {
    const summary = countryCollection.features.reduce<CoordinateScan>(
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
    expect(topologyMetadata.minimumCoordinatePrecision).toBe(6);
    expect(topologyMetadata.maximumQuantizationStepDegrees).toBeLessThanOrEqual(
      topologyMetadata.qualityBudget.maximumMaterialBoundsDeltaDegrees,
    );
  });

  it("renders every country geometry to a non-empty SVG path", () => {
    const projection = geoMercator().fitSize([800, 600], countryCollection);
    const path = geoPath().projection(projection);

    for (const country of countryCollection.features)
      expect(path(country)).toEqual(expect.stringMatching(/^M/));
  });

  it("uses quality-budgeted optimization to reduce topology size", () => {
    expect(topologyMetadata.optimization).toBe("quality-budgeted");
    expect(topologyMetadata.quantization).toBe(10_000);
    expect(topologyMetadata.optimizedSourceBytes).toBeLessThan(
      topologyMetadata.highDetailSourceBytes,
    );
    expect(topologyMetadata.sourceSizeReductionRatio).toBeGreaterThan(0.86);
  });

  it("passes small-island, coastline, border, and small-country fixtures", () => {
    const fixtureCategories = new Set(
      topologyMetadata.qualityBudget.fixtures.flatMap(
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

    for (const fixture of topologyMetadata.qualityBudget.fixtures) {
      expect(fixture.passed).toBe(true);
      expect(fixture.areaDeltaRatio).toBeLessThanOrEqual(
        topologyMetadata.qualityBudget.maximumMaterialAreaDeltaRatio,
      );
      expect(fixture.maximumBoundsDeltaDegrees).toBeLessThanOrEqual(
        topologyMetadata.qualityBudget.maximumMaterialBoundsDeltaDegrees,
      );
    }
  });
});
