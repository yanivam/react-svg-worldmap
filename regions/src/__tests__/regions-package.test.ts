import { describe, expect, it } from "vitest";

import {
  createRegionsDetailProvider,
  getRegionCoverage,
  regionCollections,
  regionCoverage,
} from "../index.js";

describe("regions package", () => {
  it("exports starter coverage and collections", () => {
    expect(regionCoverage.length).toBeGreaterThan(0);
    expect(regionCollections.US).toBeDefined();
    expect(getRegionCoverage("US")).toHaveLength(1);
  });

  it("creates a provider compatible with supported and unsupported countries", async () => {
    const provider = createRegionsDetailProvider();

    expect(provider.supports("US")).toBe(true);
    expect(provider.supports("CA")).toBe(false);

    await expect(provider.loadRegions("US")).resolves.toMatchObject({
      status: "ready",
      countryCode: "US",
      collection: { countryCode: "US" },
    });
    await expect(provider.loadRegions("CA")).resolves.toMatchObject({
      status: "unavailable",
      countryCode: "CA",
    });
  });

  it("exports coverage metadata through the provider", () => {
    const provider = createRegionsDetailProvider();

    expect(provider.getCoverage?.()).toEqual(regionCoverage);
    expect(provider.getCoverage?.("US")).toEqual(getRegionCoverage("US"));
  });
});
