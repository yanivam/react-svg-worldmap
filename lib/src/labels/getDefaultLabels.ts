import type { LabelCandidate } from "./types.js";

export function getDefaultLabels(args: {
  countryCandidates: LabelCandidate[];
  regionCandidates: LabelCandidate[];
  regionTranslations?: Record<string, string>;
  hasCompleteRegionTranslations: boolean;
}): LabelCandidate[] {
  const translatedRegions = args.regionCandidates.map((candidate) => ({
    ...candidate,
    text:
      args.hasCompleteRegionTranslations &&
      args.regionTranslations?.[candidate.id]
        ? args.regionTranslations[candidate.id]
        : candidate.text,
  }));

  return [...args.countryCandidates, ...translatedRegions];
}
