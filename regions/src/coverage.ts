import type { ISOCode, RegionCoverageRecord } from "react-svg-worldmap";

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

const naturalEarthSourceSummary =
  "Generated from Natural Earth Admin 1 states/provinces 10m cultural vectors.";
const naturalEarthSourceUrl =
  "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/";
const naturalEarthReviewNotes =
  "Complete target-country coverage from Natural Earth Admin 1. Boundaries and names are thematic and non-authoritative; maintainers should review country-specific official sources before changing expected counts.";

export const regionCoverage: RegionCoverageRecord[] = [
  {
    countryCode: "US",
    countryName: "United States",
    status: "complete",
    regionCount: 50,
    expectedRegionCount: 50,
    sourceSummary:
      "Generated from us-atlas@3.0.1 states-10m TopoJSON, derived from U.S. Census Bureau cartographic boundary data.",
    sourceUrl: "https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json",
    reviewNotes:
      "Coverage includes the 50 U.S. states. District of Columbia and territories are not included in this first-level states layer.",
  },
  {
    countryCode: "CA",
    countryName: "Canada",
    status: "complete",
    regionCount: 13,
    expectedRegionCount: 13,
    sourceSummary:
      "Generated from Opendatasoft georef-canada-province GeoJSON using Statistics Canada province and territory records.",
    sourceUrl:
      "https://public.opendatasoft.com/explore/dataset/georef-canada-province/",
    reviewNotes:
      "Coverage includes Canada's 10 provinces and 3 territories as thematic map data, not legal boundary data.",
  },
  ...[
    ["MX", "Mexico", 32],
    ["BR", "Brazil", 27],
    ["AR", "Argentina", 24],
    ["VE", "Venezuela", 25],
    ["DE", "Germany", 16],
    ["CH", "Switzerland", 26],
    ["AT", "Austria", 9],
    ["BE", "Belgium", 11],
    ["BA", "Bosnia and Herzegovina", 18],
    ["RU", "Russia", 85],
    ["IN", "India", 36],
    ["PK", "Pakistan", 8],
    ["AE", "United Arab Emirates", 9],
    ["MY", "Malaysia", 16],
    ["IQ", "Iraq", 18],
    ["NG", "Nigeria", 37],
    ["ET", "Ethiopia", 11],
    ["ZA", "South Africa", 9],
    ["SD", "Sudan", 17],
    ["AU", "Australia", 12],
    ["FM", "Micronesia", 4],
  ].map(([countryCode, countryName, regionCount]) => ({
    countryCode: countryCode as ISOCode,
    countryName: String(countryName),
    status: "complete" as const,
    regionCount: Number(regionCount),
    expectedRegionCount: Number(regionCount),
    sourceSummary: naturalEarthSourceSummary,
    sourceUrl: naturalEarthSourceUrl,
    reviewNotes: naturalEarthReviewNotes,
  })),
];

export function getRegionCoverage(
  countryCode?: ISOCode,
): RegionCoverageRecord[] {
  if (countryCode == null) return regionCoverage;

  const normalizedCountryCode = countryCode.toUpperCase();
  return regionCoverage.filter(
    (coverage) => coverage.countryCode.toUpperCase() === normalizedCountryCode,
  );
}
