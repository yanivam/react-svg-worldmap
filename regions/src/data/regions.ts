import type { RegionCollectionRecord } from "../types.js";
import { normalizeRegionCollection } from "../normalizeRegionCollection.js";

const rawRegionCollections: Record<string, RegionCollectionRecord> = {
  US: {
    countryCode: "US",
    englishCountryName: "United States",
    regions: [],
  },
};

export const regionCollections: Record<string, RegionCollectionRecord> =
  Object.fromEntries(
    Object.entries(rawRegionCollections).map(([countryCode, collection]) => [
      countryCode,
      normalizeRegionCollection(collection),
    ]),
  );
