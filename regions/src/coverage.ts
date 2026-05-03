import type { ISOCode, RegionCoverageRecord } from "react-svg-worldmap";
import { regionCollections } from "./data/starter.js";

export interface TargetRegionCountry {
  countryCode: ISOCode;
  countryName: string;
  continentGroup: "Americas" | "Europe" | "Asia" | "Africa" | "Oceania";
}

export const targetRegionCountries: TargetRegionCountry[] = [
  {
    countryCode: "US",
    countryName: "United States",
    continentGroup: "Americas",
  },
  { countryCode: "CA", countryName: "Canada", continentGroup: "Americas" },
  { countryCode: "MX", countryName: "Mexico", continentGroup: "Americas" },
  { countryCode: "BR", countryName: "Brazil", continentGroup: "Americas" },
  { countryCode: "AR", countryName: "Argentina", continentGroup: "Americas" },
  { countryCode: "VE", countryName: "Venezuela", continentGroup: "Americas" },
  { countryCode: "DE", countryName: "Germany", continentGroup: "Europe" },
  { countryCode: "CH", countryName: "Switzerland", continentGroup: "Europe" },
  { countryCode: "AT", countryName: "Austria", continentGroup: "Europe" },
  { countryCode: "BE", countryName: "Belgium", continentGroup: "Europe" },
  {
    countryCode: "BA",
    countryName: "Bosnia and Herzegovina",
    continentGroup: "Europe",
  },
  { countryCode: "RU", countryName: "Russia", continentGroup: "Europe" },
  { countryCode: "IN", countryName: "India", continentGroup: "Asia" },
  { countryCode: "PK", countryName: "Pakistan", continentGroup: "Asia" },
  {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    continentGroup: "Asia",
  },
  { countryCode: "MY", countryName: "Malaysia", continentGroup: "Asia" },
  { countryCode: "IQ", countryName: "Iraq", continentGroup: "Asia" },
  { countryCode: "NG", countryName: "Nigeria", continentGroup: "Africa" },
  { countryCode: "ET", countryName: "Ethiopia", continentGroup: "Africa" },
  { countryCode: "ZA", countryName: "South Africa", continentGroup: "Africa" },
  { countryCode: "SD", countryName: "Sudan", continentGroup: "Africa" },
  { countryCode: "AU", countryName: "Australia", continentGroup: "Oceania" },
  { countryCode: "FM", countryName: "Micronesia", continentGroup: "Oceania" },
];

export const regionCoverage: RegionCoverageRecord[] = Object.values(
  regionCollections,
).map((collection) => {
  const coverage: RegionCoverageRecord = {
    countryCode: collection.countryCode,
    countryName: collection.countryName,
    status: collection.coverageStatus,
    regionCount: collection.regions.length,
  };

  if (collection.expectedRegionCount != null)
    coverage.expectedRegionCount = collection.expectedRegionCount;
  if (collection.sourceSummary != null)
    coverage.sourceSummary = collection.sourceSummary;
  if (collection.sourceUrl != null)
    coverage.sourceUrl = String(collection.sourceUrl);
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
