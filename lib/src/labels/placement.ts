import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import type {
  CountryLabelCandidate,
  ISOCode,
  RegionFeatureRecord,
  RegionLabelCandidate,
} from "../types.js";
import type { ResolvedZoomOptions } from "../zoom/state.js";
import { getLargestGeometryPart, measureFeature } from "../zoom/geometry.js";

const LABEL_FONT_SIZE = 12;
const LABEL_HEIGHT = 14;
const AVERAGE_CHARACTER_WIDTH = 6.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function estimateTextWidth(label: string, fontSize: number): number {
  return label.length * AVERAGE_CHARACTER_WIDTH * (fontSize / LABEL_FONT_SIZE);
}

function estimateTextHeight(fontSize: number): number {
  return LABEL_HEIGHT * (fontSize / LABEL_FONT_SIZE);
}

type LabelCandidate = CountryLabelCandidate | RegionLabelCandidate;

export interface PlacedMapLabels {
  countryLabels: CountryLabelCandidate[];
  regionLabels: RegionLabelCandidate[];
}

function intersects(left: LabelCandidate, right: LabelCandidate): boolean {
  return !(
    left.x + left.width / 2 < right.x - right.width / 2 ||
    left.x - left.width / 2 > right.x + right.width / 2 ||
    left.y + left.height / 2 < right.y - right.height / 2 ||
    left.y - left.height / 2 > right.y + right.height / 2
  );
}

function placeLabels<T extends LabelCandidate>(
  candidates: Array<T | undefined>,
  compare: (left: T, right: T) => number,
): T[] {
  return candidates
    .filter((candidate): candidate is T => Boolean(candidate))
    .sort((left, right) => right.priority - left.priority)
    .reduce<T[]>((accepted, candidate) => {
      if (accepted.some((label) => intersects(label, candidate)))
        return accepted;
      return [...accepted, candidate];
    }, [])
    .sort(compare);
}

function placeMixedLabels(
  candidates: Array<LabelCandidate | undefined>,
): LabelCandidate[] {
  return candidates
    .filter((candidate): candidate is LabelCandidate => Boolean(candidate))
    .sort((left, right) => right.priority - left.priority)
    .reduce<LabelCandidate[]>((accepted, candidate) => {
      if (accepted.some((label) => intersects(label, candidate)))
        return accepted;
      return [...accepted, candidate];
    }, []);
}

export function createCountryLabelCandidate(
  pathGenerator: GeoPath,
  feature: GeoJSON.Feature & { properties: { N: string; I: string } },
  fontSize: number,
): CountryLabelCandidate | undefined {
  const label = feature.properties.N;
  const part = getLargestGeometryPart(pathGenerator, feature);
  const measurement = measureFeature(pathGenerator, part);
  const width = estimateTextWidth(label, fontSize);
  const height = estimateTextHeight(fontSize);
  const minWidth = Math.max(width * 1.2, fontSize * 1.2);
  const minHeight = height * 1.4;

  if (measurement.width < minWidth || measurement.height < minHeight)
    return undefined;

  return {
    countryCode: feature.properties.I as ISOCode,
    countryName: label,
    label,
    x: measurement.centroid[0],
    y: measurement.centroid[1],
    width,
    height,
    availableWidth: measurement.width,
    availableHeight: measurement.height,
    priority: measurement.area,
  };
}

export function placeCountryLabels(
  candidates: Array<CountryLabelCandidate | undefined>,
): CountryLabelCandidate[] {
  return placeLabels(candidates, (left, right) =>
    left.countryName.localeCompare(right.countryName),
  );
}

export function createRegionLabelCandidate(
  region: RegionFeatureRecord,
  fontSize: number,
): RegionLabelCandidate | undefined {
  const label = region.localizedName ?? region.name;
  const [[minX, minY], [maxX, maxY]] = region.bounds ?? [
    [region.centroid?.[0] ?? 0, region.centroid?.[1] ?? 0],
    [region.centroid?.[0] ?? 0, region.centroid?.[1] ?? 0],
  ];
  const availableWidth = Math.abs(maxX - minX);
  const availableHeight = Math.abs(maxY - minY);
  const width = estimateTextWidth(label, fontSize);
  const height = estimateTextHeight(fontSize);
  const minWidth = Math.max(width * 1.2, fontSize * 1.2);
  const minHeight = height * 1.4;

  if (
    region.centroid == null ||
    availableWidth < minWidth ||
    availableHeight < minHeight
  )
    return undefined;

  return {
    regionId: region.id,
    countryCode: region.countryCode,
    regionName: region.name,
    label,
    x: region.centroid[0],
    y: region.centroid[1],
    width,
    height,
    availableWidth,
    availableHeight,
    priority: availableWidth * availableHeight,
  };
}

export function placeRegionLabels(
  candidates: Array<RegionLabelCandidate | undefined>,
): RegionLabelCandidate[] {
  return placeLabels(candidates, (left, right) =>
    left.regionName.localeCompare(right.regionName),
  );
}

export function placeMapLabels({
  countryCandidates,
  regionCandidates,
  scale,
}: {
  countryCandidates: Array<CountryLabelCandidate | undefined>;
  regionCandidates: Array<RegionLabelCandidate | undefined>;
  scale: number;
}): PlacedMapLabels {
  const countryPriorityMultiplier = scale >= 6 ? 0.35 : 4;
  const regionPriorityMultiplier = scale >= 6 ? 4 : 0.35;
  const placed = placeMixedLabels([
    ...countryCandidates.map((candidate) =>
      candidate == null
        ? undefined
        : {
            ...candidate,
            priority: candidate.priority * countryPriorityMultiplier,
          },
    ),
    ...regionCandidates.map((candidate) =>
      candidate == null
        ? undefined
        : {
            ...candidate,
            priority: candidate.priority * regionPriorityMultiplier,
          },
    ),
  ]);

  return {
    countryLabels: placed
      .filter(
        (candidate): candidate is CountryLabelCandidate =>
          "countryName" in candidate,
      )
      .sort((left, right) => left.countryName.localeCompare(right.countryName)),
    regionLabels: placed
      .filter(
        (candidate): candidate is RegionLabelCandidate =>
          "regionName" in candidate,
      )
      .sort((left, right) => left.regionName.localeCompare(right.regionName)),
  };
}

export function resolveCountryLabelScreenFontSize(
  scale: number,
  options: ResolvedZoomOptions,
): number {
  const minFontSize = Math.max(1, options.countryLabelMinFontSize);
  const maxFontSize = Math.max(minFontSize, options.countryLabelMaxFontSize);
  const growthRate = Math.max(0, options.countryLabelZoomGrowthRate);
  const effectiveScale = Math.max(1, scale);
  const fontSize = minFontSize * effectiveScale ** growthRate;

  return clamp(fontSize, minFontSize, maxFontSize);
}

export function resolveCountryLabelMapFontSize(
  scale: number,
  mapScale: number,
  options: ResolvedZoomOptions,
): number {
  const safeMapScale = Math.max(Number.EPSILON, mapScale);

  return resolveCountryLabelScreenFontSize(scale, options) / safeMapScale;
}

export const countryLabelFontSize = LABEL_FONT_SIZE;
