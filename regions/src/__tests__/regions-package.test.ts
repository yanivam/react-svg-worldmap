import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createRegionsDetailProvider,
  getRegionCoverage,
  loadRegionCollection,
  regionCoverage,
  targetRegionCountries,
} from "../index.js";

describe("regions package", () => {
  it("exports target-country coverage and loadable collections", async () => {
    expect(targetRegionCountries).toHaveLength(23);
    expect(regionCoverage).toHaveLength(23);
    await expect(loadRegionCollection("US")).resolves.toMatchObject({
      countryCode: "US",
    });
    await expect(loadRegionCollection("CA")).resolves.toMatchObject({
      countryCode: "CA",
    });
    await expect(loadRegionCollection("MX")).resolves.toMatchObject({
      countryCode: "MX",
    });
    await expect(loadRegionCollection("FM")).resolves.toMatchObject({
      countryCode: "FM",
    });
    await expect(
      loadRegionCollection("FR").then((value) => value),
    ).resolves.toBe(undefined);
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
          status: "complete",
          expectedRegionCount: 32,
        }),
        expect.objectContaining({
          countryCode: "FM",
          status: "complete",
          regionCount: 4,
        }),
      ]),
    );
  });

  it("publishes package support files", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve("../regions/package.json"), "utf8"),
    ) as { license?: string; files?: string[] };
    const changelogPath = resolve("../regions/CHANGELOG.md");
    const licensePath = resolve("../regions/LICENSE");
    const readmePath = resolve("../regions/README.md");
    const contributingPath = resolve("../regions/CONTRIBUTING.md");
    const codeOfConductPath = resolve("../regions/CODE_OF_CONDUCT.md");

    expect(packageJson.license).toBe("MIT");
    expect(packageJson.files).toEqual(
      expect.arrayContaining([
        "CODE_OF_CONDUCT.md",
        "CONTRIBUTING.md",
        "CHANGELOG.md",
        "LICENSE",
        "README.md",
      ]),
    );
    expect(packageJson.files).toContain("LICENSE");
    expect(existsSync(licensePath)).toBe(true);
    expect(readFileSync(licensePath, "utf8")).toContain("MIT License");
    expect(existsSync(readmePath)).toBe(true);
    expect(readFileSync(readmePath, "utf8")).toContain(
      "@react-svg-worldmap/regions",
    );
    expect(existsSync(contributingPath)).toBe(true);
    expect(readFileSync(contributingPath, "utf8")).toContain("Contributing");
    expect(existsSync(codeOfConductPath)).toBe(true);
    expect(readFileSync(codeOfConductPath, "utf8")).toContain(
      "Code of Conduct",
    );
    expect(existsSync(changelogPath)).toBe(true);
    expect(readFileSync(changelogPath, "utf8")).toContain("2.1.0");
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
      coverageStatus: "complete",
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
    expect(zoomExample).toContain("AWS locations");
    expect(zoomExample).toContain("zoom");
    expect(zoomExample).not.toContain("../data/CountryData");
    expect(zoomExample).not.toContain("initialScale:");
    expect(zoomExample).not.toContain("Simplified starter region shapes");
  });

  it("keeps AWS location sample data global and explicit about unpublished fallbacks", () => {
    const awsLocations = readFileSync(
      resolve("../website/src/data/awsRegionLocations.ts"),
      "utf8",
    );
    const regionCodes = Array.from(
      awsLocations.matchAll(/regionCode: "(?<regionCode>[^"]+)"/g),
    ).map((match) => match.groups!.regionCode);

    expect(regionCodes).toHaveLength(38);
    expect(regionCodes).toEqual(
      expect.arrayContaining([
        "us-east-1",
        "us-gov-east-1",
        "cn-north-1",
        "af-south-1",
        "ap-southeast-2",
        "eu-central-1",
        "me-central-1",
        "sa-east-1",
      ]),
    );
    expect(awsLocations).toContain(
      "https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html",
    );
    expect(awsLocations).toContain("(location not published)");
    expect(awsLocations).toContain("state-capital-fallback");
    expect(awsLocations).toContain("country-capital-fallback");
  });

  it("keeps sizing examples from rendering the removed visible region list", () => {
    const xlSizingExample = readFileSync(
      resolve("../website/src/components/sizing/XL.tsx"),
      "utf8",
    );
    const xxlSizingExample = readFileSync(
      resolve("../website/src/components/sizing/XXL.tsx"),
      "utf8",
    );

    expect(xlSizingExample).not.toContain("showRegionList");
    expect(xxlSizingExample).not.toContain("showRegionList");
    expect(xlSizingExample).not.toContain("United States regions");
    expect(xxlSizingExample).not.toContain("India regions");
    expect(xlSizingExample).not.toContain("initialScale:");
    expect(xxlSizingExample).not.toContain("initialScale:");
  });
});
