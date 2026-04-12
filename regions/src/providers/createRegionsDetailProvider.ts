import { regionCollections } from "../data/regions.js";
import type { DetailProvider } from "../types.js";

export function createRegionsDetailProvider(): DetailProvider {
  return {
    supports(countryCode) {
      return countryCode.toUpperCase() in regionCollections;
    },
    loadRegions(countryCode) {
      const key = countryCode.toUpperCase();
      const collection = regionCollections[key];

      if (!collection) {
        return Promise.resolve({
          status: "unavailable",
          layer: "regions",
          detailLevel: "regions",
        });
      }

      return Promise.resolve({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection,
      });
    },
  };
}
