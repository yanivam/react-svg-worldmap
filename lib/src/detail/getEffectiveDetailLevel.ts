import { createMissingDetailProviderWarning } from "./createMissingDetailProviderWarning.js";
import type { DetailLevel, DetailProvider } from "./types.js";

export function getEffectiveDetailLevel(
  requestedDetailLevel: DetailLevel | undefined,
  detailProvider: DetailProvider | undefined,
): DetailLevel {
  if ((requestedDetailLevel ?? "countries") !== "regions") return "countries";
  if (detailProvider) return "regions";

  const warning = createMissingDetailProviderWarning("regions");
  if (warning) 
     
    console.warn(warning);
  

  return "countries";
}
