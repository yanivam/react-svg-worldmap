import type { RegionCollectionRecord } from "./types.js";

export function projectRegionFeatures(
  collection: RegionCollectionRecord,
): Array<{
  id: string;
  label: string;
  path: string;
}> {
  return collection.regions.map((region) => ({
    id: region.id,
    label: region.labels.localizedName ?? region.labels.englishName,
    path: region.path,
  }));
}
