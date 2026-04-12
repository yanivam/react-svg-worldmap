import type { DetailLevel } from "./types.js";

export function createMissingDetailProviderWarning(
  detailLevel: DetailLevel,
): string | null {
  if (detailLevel !== "regions") return null;

  return '[react-svg-worldmap] detailLevel="regions" requested without a regions detail provider. Falling back to detailLevel="countries".';
}
