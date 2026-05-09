import type { RegionCollectionRecord } from "react-svg-worldmap";
import { beforeAll, describe, expect, it } from "vitest";

import {
  getRegionCoverage,
  loadRegionCollections,
  regionCoverage,
  targetRegionCountries,
} from "../index.js";

const targetCountryCodes = targetRegionCountries.map(
  ({ countryCode }) => countryCode,
);
let regionCollections: Record<string, RegionCollectionRecord>;

describe("target region coverage completeness", () => {
  beforeAll(async () => {
    regionCollections = await loadRegionCollections();
  });

  it("marks every target country as complete", () => {
    expect(targetRegionCountries).toHaveLength(23);
    expect(regionCoverage).toHaveLength(23);

    for (const target of targetRegionCountries) {
      const [coverage] = getRegionCoverage(target.countryCode);

      expect(coverage).toMatchObject({
        countryCode: target.countryCode,
        countryName: target.countryName,
        status: "complete",
      });
      expect(coverage.regionCount).toBeGreaterThan(0);
      expect(coverage.expectedRegionCount).toBe(coverage.regionCount);
      expect(coverage.status).not.toBe("experimental");
      expect(coverage.status).not.toBe("partial");
    }
  });

  it("exports complete collections for the same target countries", () => {
    expect(
      Object.keys(regionCollections).sort((left, right) =>
        left.localeCompare(right),
      ),
    ).toEqual(
      [...targetCountryCodes].sort((left, right) => left.localeCompare(right)),
    );

    for (const target of targetRegionCountries) {
      const collection = regionCollections[target.countryCode];

      expect(collection).toBeDefined();
      expect(collection.coverageStatus).toBe("complete");
      expect(collection.regions).toHaveLength(collection.expectedRegionCount!);
      expect(collection.sourceSummary).toBeTruthy();
      expect(collection.reviewNotes).toBeTruthy();
    }
  });
});
