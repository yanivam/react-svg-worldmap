import type {
  DetailProviderResult,
  ISOCode,
  RegionCollection,
} from "../types.js";

/** Region detail is off or hidden. */
export function createIdleDetailResult(): DetailProviderResult {
  return { status: "idle", layer: "regions" };
}

/** The provider has no regions for this country. */
export function createUnavailableDetailResult(
  countryCode?: ISOCode,
  warning = "Region detail is unavailable.",
): DetailProviderResult {
  return {
    status: "unavailable",
    layer: "regions",
    ...(countryCode != null ? { countryCode } : {}),
    warning,
  };
}

/** Loading this country's regions failed. */
export function createFailedDetailResult(
  countryCode?: ISOCode,
  warning = "Region detail could not be loaded.",
): DetailProviderResult {
  return {
    status: "failed",
    layer: "regions",
    ...(countryCode != null ? { countryCode } : {}),
    warning,
  };
}

/** A country's regions, ready to draw. */
export function createReadyDetailResult(
  collection: RegionCollection,
): DetailProviderResult {
  return {
    status: "ready",
    layer: "regions",
    countryCode: collection.countryCode,
    ...(collection.coverageStatus != null
      ? { coverageStatus: collection.coverageStatus }
      : {}),
    collection,
  };
}

export function isReadyDetailResult(
  result: DetailProviderResult,
): result is DetailProviderResult & { collection: RegionCollection } {
  return result.status === "ready" && result.collection != null;
}
