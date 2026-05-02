import type { ISOCode, RegionCoverageRecord } from "react-svg-worldmap";
import { regionCollections } from "./data/starter.js";

export const regionCoverage: RegionCoverageRecord[] = Object.values(
  regionCollections,
).map((collection) => {
  const coverage: RegionCoverageRecord = {
    countryCode: collection.countryCode,
    countryName: collection.countryName,
    status: collection.coverageStatus,
    regionCount: collection.regions.length,
    sourceSummary: "Simplified starter region shapes for integration examples.",
  };

  if (collection.reviewNotes != null)
    coverage.reviewNotes = collection.reviewNotes;

  return coverage;
});

export function getRegionCoverage(
  countryCode?: ISOCode,
): RegionCoverageRecord[] {
  if (countryCode == null) return regionCoverage;

  const normalizedCountryCode = countryCode.toUpperCase();
  return regionCoverage.filter(
    (coverage) => coverage.countryCode.toUpperCase() === normalizedCountryCode,
  );
}
