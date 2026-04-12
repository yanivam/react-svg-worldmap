export type {
  DetailLevel,
  DetailLayerStatus,
  DetailProvider,
  DetailProviderResult,
  RegionCollectionRecord,
  RegionFeatureRecord,
  RegionLabelSet,
} from "./types.js";
export { supportedRegionCountryCodes } from "./coverage.js";
export { regionCollections } from "./data/regions.js";
export { normalizeRegionCollection } from "./normalizeRegionCollection.js";
export { createRegionsDetailProvider } from "./providers/createRegionsDetailProvider.js";
