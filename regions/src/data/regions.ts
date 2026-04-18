import regionCollectionsJson from "./regions.json";
import { normalizeRegionCollection } from "../normalizeRegionCollection.js";
import type { RegionCollectionRecord } from "../types.js";

const rawRegionCollections = regionCollectionsJson as unknown as Record<
  string,
  RegionCollectionRecord
>;

export const regionCollections: Record<string, RegionCollectionRecord> =
  Object.fromEntries(
    Object.entries(rawRegionCollections).map(([countryCode, collection]) => [
      countryCode,
      normalizeRegionCollection(collection),
    ]),
  );
