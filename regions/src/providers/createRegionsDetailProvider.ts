import type { DetailProvider, ISOCode } from "react-svg-worldmap";
import {
  createReadyDetailResult,
  createUnavailableDetailResult,
} from "react-svg-worldmap";
import { getRegionCoverage } from "../coverage.js";
import { loadRegionCollection } from "../data/loaders.js";

export function createRegionsDetailProvider(): DetailProvider {
  return {
    supports(countryCode) {
      return getRegionCoverage(countryCode).length > 0;
    },
    getCoverage(countryCode?: ISOCode) {
      return getRegionCoverage(countryCode);
    },
    async loadRegions(countryCode) {
      const collection = await loadRegionCollection(countryCode);
      if (collection == null) {
        return createUnavailableDetailResult(
          countryCode,
          "Region detail is unavailable for this country.",
        );
      }

      return createReadyDetailResult(collection);
    },
  };
}
