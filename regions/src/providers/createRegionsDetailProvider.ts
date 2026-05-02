import type { DetailProvider, ISOCode } from "react-svg-worldmap";
import {
  createReadyDetailResult,
  createUnavailableDetailResult,
} from "react-svg-worldmap";
import { getRegionCoverage } from "../coverage.js";
import { regionCollections } from "../data/starter.js";

export function createRegionsDetailProvider(): DetailProvider {
  return {
    supports(countryCode) {
      return regionCollections[countryCode.toUpperCase()] != null;
    },
    getCoverage(countryCode?: ISOCode) {
      return getRegionCoverage(countryCode);
    },
    loadRegions(countryCode) {
      const collection = regionCollections[countryCode.toUpperCase()];
      if (collection == null) {
        return Promise.resolve(
          createUnavailableDetailResult(
            countryCode,
            "Region detail is unavailable for this country.",
          ),
        );
      }

      return Promise.resolve(createReadyDetailResult(collection));
    },
  };
}
