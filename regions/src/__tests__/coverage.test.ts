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
    const result = await provider.loadRegions("us");

    expect(result.status).toBe("ready");
    expect(result.layer).toBe("regions");
    expect(result.detailLevel).toBe("regions");
    expect(result.collection).toBeDefined();
    if (!result.collection) throw new Error("Expected US region collection");

    expect(result.collection.countryCode).toBe("US");
    expect(result.collection.englishCountryName).toBe("United States");
    expect(
      result.collection.regions.some(
        ({ labels }) => labels.englishName === "California",
      ),
    ).toBe(true);
  });

  it("ships projected region geometry for the starter United States dataset", async () => {
    const provider = createRegionsDetailProvider();
    const result = await provider.loadRegions("US");

    expect(result.status).toBe("ready");
    expect(result.collection).toBeDefined();
    if (!result.collection) throw new Error("Expected US region collection");

    const [firstRegion] = result.collection.regions;

    expect(result.collection.regions.length).toBeGreaterThan(50);
    expect(firstRegion.id).toEqual(expect.any(String));
    expect(firstRegion.countryCode).toBe("US");
    expect(firstRegion.labels.englishName).toEqual(expect.any(String));
    expect(firstRegion.path).toMatch(/^M/);
    expect(firstRegion.centroid).toBeDefined();
    expect(firstRegion.centroid?.[0]).toEqual(expect.any(Number));
    expect(firstRegion.centroid?.[1]).toEqual(expect.any(Number));
    expect(firstRegion.bounds).toBeDefined();
    expect(firstRegion.bounds?.[0]?.[0]).toEqual(expect.any(Number));
    expect(firstRegion.bounds?.[0]?.[1]).toEqual(expect.any(Number));
    expect(firstRegion.bounds?.[1]?.[0]).toEqual(expect.any(Number));
    expect(firstRegion.bounds?.[1]?.[1]).toEqual(expect.any(Number));
  });

  it("returns unavailable when a country has no region dataset", async () => {
    const provider = createRegionsDetailProvider();
    await expect(provider.loadRegions("ZZ")).resolves.toMatchObject({
      status: "unavailable",
      layer: "regions",
    });
  });
});
