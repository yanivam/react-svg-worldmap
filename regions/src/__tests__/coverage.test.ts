import { describe, expect, it } from "vitest";
import { supportedRegionCountryCodes } from "../coverage.js";
import { createRegionsDetailProvider } from "../providers/createRegionsDetailProvider.js";

describe("regions package coverage", () => {
  it("exports sorted supported country codes", () => {
    expect(supportedRegionCountryCodes).toEqual(
      [...supportedRegionCountryCodes].sort((left, right) =>
        left.localeCompare(right),
      ),
    );
  });

  it("reports support for starter datasets", () => {
    const provider = createRegionsDetailProvider();
    expect(provider.supports("US")).toBe(true);
  });

  it("returns a ready result when a country has a region dataset", async () => {
    const provider = createRegionsDetailProvider();
    await expect(provider.loadRegions("us")).resolves.toMatchObject({
      status: "ready",
      layer: "regions",
      detailLevel: "regions",
      collection: {
        countryCode: "US",
        englishCountryName: "United States",
        regions: [],
      },
    });
  });

  it("returns unavailable when a country has no region dataset", async () => {
    const provider = createRegionsDetailProvider();
    await expect(provider.loadRegions("ZZ")).resolves.toMatchObject({
      status: "unavailable",
      layer: "regions",
    });
  });
});
