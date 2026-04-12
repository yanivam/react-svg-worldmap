import { regionCollections } from "./data/regions.js";

export const supportedRegionCountryCodes = Object.freeze(
  Object.keys(regionCollections).sort((left, right) =>
    left.localeCompare(right),
  ),
);
