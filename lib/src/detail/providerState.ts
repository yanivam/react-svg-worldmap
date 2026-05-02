import type {
  DetailProviderResult,
  ISOCode,
  RegionCollectionRecord,
} from "../types.js";

export function createIdleDetailResult(): DetailProviderResult {
  return {
    status: "idle",
    layer: "regions",
  };
}

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

export function createReadyDetailResult(
  collection: RegionCollectionRecord,
): DetailProviderResult {
  return {
    status: "ready",
    layer: "regions",
    countryCode: collection.countryCode,
    coverageStatus: collection.coverageStatus,
    collection,
  };
}

export function isReadyDetailResult(
  result: DetailProviderResult,
): result is DetailProviderResult & { collection: RegionCollectionRecord } {
  return result.status === "ready" && result.collection != null;
}
