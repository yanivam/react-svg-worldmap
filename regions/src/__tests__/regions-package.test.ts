import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createRegionsDetailProvider,
  getRegionCoverage,
  regionCollections,
  regionCoverage,
  targetRegionCountries,
} from "../index.js";

describe("regions package", () => {
  it("exports target-country coverage and collections", () => {
    expect(targetRegionCountries).toHaveLength(23);
    expect(regionCoverage).toHaveLength(23);
    expect(regionCollections.US).toBeDefined();
    expect(regionCollections.CA).toBeDefined();
    expect(regionCollections.MX).toBeDefined();
    expect(regionCollections.FM).toBeDefined();
    expect(getRegionCoverage("US")).toHaveLength(1);
    expect(getRegionCoverage("CA")).toHaveLength(1);
    expect(getRegionCoverage("MX")).toHaveLength(1);
    expect(getRegionCoverage("FM")).toHaveLength(1);
    expect(getRegionCoverage("MX")[0]?.sourceUrl).toMatch(/^https:\/\//);
    expect(regionCoverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          countryCode: "US",
          status: "complete",
          expectedRegionCount: 50,
        }),
        expect.objectContaining({
          countryCode: "CA",
          status: "complete",
          expectedRegionCount: 13,
        }),
        expect.objectContaining({
          countryCode: "MX",
          status: "experimental",
        }),
        expect.objectContaining({
          countryCode: "FM",
          status: "experimental",
          regionCount: 4,
        }),
      ]),
    );
  });

  it("creates a provider compatible with supported and unsupported countries", async () => {
    const provider = createRegionsDetailProvider();

    expect(provider.supports("US")).toBe(true);
    expect(provider.supports("CA")).toBe(true);
    expect(provider.supports("MX")).toBe(true);
    expect(provider.supports("FM")).toBe(true);
    expect(provider.supports("FR")).toBe(false);

    await expect(provider.loadRegions("US")).resolves.toMatchObject({
      status: "ready",
      countryCode: "US",
      collection: { countryCode: "US" },
    });
    await expect(provider.loadRegions("CA")).resolves.toMatchObject({
      status: "ready",
      countryCode: "CA",
      collection: { countryCode: "CA" },
    });
    await expect(provider.loadRegions("MX")).resolves.toMatchObject({
      status: "ready",
      countryCode: "MX",
      coverageStatus: "experimental",
      collection: { countryCode: "MX" },
    });
    await expect(provider.loadRegions("FR")).resolves.toMatchObject({
      status: "unavailable",
      countryCode: "FR",
    });
  });

  it("exports coverage metadata through the provider", () => {
    const provider = createRegionsDetailProvider();

    expect(provider.getCoverage?.()).toEqual(regionCoverage);
    expect(provider.getCoverage?.("US")).toEqual(getRegionCoverage("US"));
  });

  it("keeps the core package independent from optional region data", () => {
    const corePackage = JSON.parse(
      readFileSync(resolve("../lib/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };

    expect(corePackage.dependencies).not.toHaveProperty(
      "@react-svg-worldmap/regions",
    );
  });

  it("supports website examples through the optional package import", () => {
    const zoomExample = readFileSync(
      resolve("../website/src/components/ZoomExample.tsx"),
      "utf8",
    );
    const xlSizingExample = readFileSync(
      resolve("../website/src/components/sizing/XL.tsx"),
      "utf8",
    );

    expect(zoomExample).toContain("@react-svg-worldmap/regions");
    expect(xlSizingExample).toContain("@react-svg-worldmap/regions");
    expect(zoomExample).not.toContain("Simplified starter region shapes");
  });

  it("keeps sizing examples from rendering the visible region list", () => {
    const xlSizingExample = readFileSync(
      resolve("../website/src/components/sizing/XL.tsx"),
      "utf8",
    );
    const xxlSizingExample = readFileSync(
      resolve("../website/src/components/sizing/XXL.tsx"),
      "utf8",
    );

    expect(xlSizingExample).toContain("showRegionList={false}");
    expect(xxlSizingExample).toContain("showRegionList={false}");
  });
});
