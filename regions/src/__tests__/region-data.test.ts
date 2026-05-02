import { describe, expect, it } from "vitest";

import { regionCollections, regionCoverage } from "../index.js";

describe("region data", () => {
  it("has valid coverage metadata for every starter collection", () => {
    for (const coverage of regionCoverage) {
      const collection = regionCollections[coverage.countryCode];

      expect(collection).toBeDefined();
      expect(coverage.countryName).toBe(collection!.countryName);
      expect(coverage.regionCount).toBe(collection!.regions.length);
      expect(["complete", "partial", "experimental"]).toContain(
        coverage.status,
      );
      expect(coverage.reviewNotes).toBeTruthy();
    }
  });

  it("has unique region ids and matching parent countries", () => {
    for (const collection of Object.values(regionCollections)) {
      const ids = new Set<string>();

      for (const region of collection.regions) {
        expect(region.countryCode).toBe(collection.countryCode);
        expect(region.id).toBeTruthy();
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
      }
    }
  });
});
