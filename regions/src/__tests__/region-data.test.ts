import type { RegionCollectionRecord } from "react-svg-worldmap";
import { beforeAll, describe, expect, it } from "vitest";

import {
  loadRegionCollections,
  regionCoverage,
  targetRegionCountries,
} from "../index.js";

const expectedTargetGroups = {
  Americas: ["US", "CA", "MX", "BR", "AR", "VE"],
  Europe: ["DE", "CH", "AT", "BE", "BA", "RU"],
  Asia: ["IN", "PK", "AE", "MY", "IQ"],
  Africa: ["NG", "ET", "ZA", "SD"],
  Oceania: ["AU", "FM"],
};
let regionCollections: Record<string, RegionCollectionRecord> = {};

describe("region data", () => {
  beforeAll(async () => {
    regionCollections = await loadRegionCollections();
  });

  it("declares the exact target-country catalog by group", () => {
    expect(targetRegionCountries).toHaveLength(23);
    expect(
      new Set(targetRegionCountries.map((country) => country.countryCode)).size,
    ).toBe(23);

    for (const [continentGroup, countryCodes] of Object.entries(
      expectedTargetGroups,
    )) {
      expect(
        targetRegionCountries
          .filter((country) => country.continentGroup === continentGroup)
          .map((country) => country.countryCode),
      ).toEqual(countryCodes);
    }
  });

  it("has coverage metadata for every target country", () => {
    expect(regionCoverage).toHaveLength(targetRegionCountries.length);

    for (const targetCountry of targetRegionCountries) {
      expect(regionCollections[targetCountry.countryCode]).toBeDefined();
      expect(regionCoverage).toContainEqual(
        expect.objectContaining({
          countryCode: targetCountry.countryCode,
          countryName: targetCountry.countryName,
        }),
      );
    }
  });

  it("has valid coverage metadata for every target collection", () => {
    for (const coverage of regionCoverage) {
      const collection = regionCollections[coverage.countryCode];

      expect(collection).toBeDefined();
      expect(coverage.countryName).toBe(collection!.countryName);
      expect(coverage.regionCount).toBe(collection!.regions.length);
      expect(coverage.expectedRegionCount).toBe(
        collection!.expectedRegionCount,
      );
      expect(["complete", "partial", "experimental"]).toContain(
        coverage.status,
      );
      if (coverage.status === "complete")
        expect(coverage.regionCount).toBe(coverage.expectedRegionCount);
      expect(coverage.sourceSummary).toBeTruthy();
      expect(coverage.sourceUrl).toMatch(/^https:\/\//);
      expect(coverage.reviewNotes).toBeTruthy();
    }
  });

  it("has unique region ids and matching parent countries", () => {
    for (const collection of Object.values(regionCollections)) {
      const ids = new Set<string>();

      for (const region of collection.regions) {
        expect(region.countryCode).toBe(collection.countryCode);
        expect(region.id).toBeTruthy();
        expect(region.kind).toBeTruthy();
        expect(ids.has(region.id)).toBe(false);
        ids.add(region.id);
      }
    }
  });

  it("has non-empty names and renderable path data", () => {
    for (const collection of Object.values(regionCollections)) {
      for (const region of collection.regions) {
        expect(region.name.trim()).not.toBe("");
        expect(region.path).toMatch(/^M/);
        expect(region.path).toContain("Z");
        expect(region.sourceId).toBeTruthy();
      }
    }
  });

  it("does not publish clipping rectangles or full-canvas artifact subpaths", () => {
    for (const collection of Object.values(regionCollections)) {
      for (const region of collection.regions) {
        const regionWidth = region.bounds[1][0] - region.bounds[0][0];
        const regionHeight = region.bounds[1][1] - region.bounds[0][1];

        expect(
          regionWidth > 900 && regionHeight > 650,
          `${region.id} has full-canvas bounds`,
        ).toBe(false);

        const subpaths = region.path
          .split(/(?=M)/u)
          .map((subpath) => subpath.trim())
          .filter(Boolean);

        for (const subpath of subpaths) {
          const numbers = Array.from(
            subpath.matchAll(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/giu),
          ).map((match) => Number(match[0]));
          const xValues = numbers.filter((_, index) => index % 2 === 0);
          const yValues = numbers.filter((_, index) => index % 2 === 1);
          const width = Math.max(...xValues) - Math.min(...xValues);
          const height = Math.max(...yValues) - Math.min(...yValues);

          expect(
            width > 900 && height > 650,
            `${region.id} contains a clipping rectangle`,
          ).toBe(false);
        }
      }
    }
  });

  it("declares complete coverage for every target country", () => {
    for (const targetCountry of targetRegionCountries) {
      const collection = regionCollections[targetCountry.countryCode];

      expect(collection).toMatchObject({
        countryCode: targetCountry.countryCode,
        coverageStatus: "complete",
      });
      expect(collection!.regions.length).toBeGreaterThan(0);
      expect(collection!.expectedRegionCount).toBe(collection!.regions.length);
    }
    expect(regionCollections.US).toMatchObject({
      countryCode: "US",
      coverageStatus: "complete",
      expectedRegionCount: 50,
    });
    expect(regionCollections.CA).toMatchObject({
      countryCode: "CA",
      coverageStatus: "complete",
      expectedRegionCount: 13,
    });
    expect(regionCollections.US.regions).toHaveLength(50);
    expect(regionCollections.CA.regions).toHaveLength(13);
  });

  it("uses Natural Earth source summaries for generated non-US and non-Canada target countries", () => {
    for (const targetCountry of targetRegionCountries.filter(
      ({ countryCode }) => countryCode !== "US" && countryCode !== "CA",
    )) {
      const collection = regionCollections[targetCountry.countryCode];

      expect(collection).toMatchObject({
        countryCode: targetCountry.countryCode,
        coverageStatus: "complete",
      });
      expect(collection!.regions.length).toBeGreaterThan(0);
      expect(collection!.expectedRegionCount).toBe(collection!.regions.length);
      expect(collection!.sourceSummary).toContain("Natural Earth Admin 1");
    }
  });
});
