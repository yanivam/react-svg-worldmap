import type { RegionCollectionRecord } from "./types.js";

export function normalizeRegionCollection(
  collection: RegionCollectionRecord,
): RegionCollectionRecord {
  return {
    countryCode: collection.countryCode.toUpperCase(),
    englishCountryName: collection.englishCountryName,
    regions: [...collection.regions].sort(
      (left, right) =>
        (left.order ?? Number.MAX_SAFE_INTEGER) -
          (right.order ?? Number.MAX_SAFE_INTEGER) ||
        left.labels.englishName.localeCompare(right.labels.englishName),
    ),
  };
}
