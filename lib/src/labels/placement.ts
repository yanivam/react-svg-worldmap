import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import type { CountryLabelCandidate, ISOCode } from "../types.js";
import type { ResolvedZoomOptions } from "../zoom/state.js";
import { getLargestGeometryPart, measureFeature } from "../zoom/geometry.js";
import type { GeometryMeasurement } from "../zoom/geometry.js";

const LABEL_FONT_SIZE = 12;
const LABEL_HEIGHT = 14;
const AVERAGE_CHARACTER_WIDTH = 6.5;

type CountryFeature = GeoJSON.Feature & {
  properties: { N: string; I: string };
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function estimateTextWidth(label: string, fontSize: number): number {
  return label.length * AVERAGE_CHARACTER_WIDTH * (fontSize / LABEL_FONT_SIZE);
}

function estimateTextHeight(fontSize: number): number {
  return LABEL_HEIGHT * (fontSize / LABEL_FONT_SIZE);
}

function intersects(
  left: CountryLabelCandidate,
  right: CountryLabelCandidate,
): boolean {
  return !(
    left.x + left.width / 2 < right.x - right.width / 2 ||
    left.x - left.width / 2 > right.x + right.width / 2 ||
    left.y + left.height / 2 < right.y - right.height / 2 ||
    left.y - left.height / 2 > right.y + right.height / 2
  );
}

/** Where a country's label can go: its largest part, measured once. */
export interface CountryLabelAnchor {
  countryCode: ISOCode;
  countryName: string;
  measurement: GeometryMeasurement;
}

export function measureCountryLabelAnchor(
  pathGenerator: GeoPath,
  feature: CountryFeature,
): CountryLabelAnchor {
  const part = getLargestGeometryPart(pathGenerator, feature);
  return {
    countryCode: feature.properties.I as ISOCode,
    countryName: feature.properties.N,
    measurement: measureFeature(pathGenerator, part),
  };
}

/** A label for the anchor at `fontSize`, or undefined if it doesn't fit. */
export function createCountryLabelCandidateFromAnchor(
  { countryCode, countryName, measurement }: CountryLabelAnchor,
  fontSize: number,
): CountryLabelCandidate | undefined {
  const width = estimateTextWidth(countryName, fontSize);
  const height = estimateTextHeight(fontSize);
  const minWidth = Math.max(width * 1.2, fontSize * 1.2);
  const minHeight = height * 1.4;

  if (measurement.width < minWidth || measurement.height < minHeight)
    return undefined;

  return {
    countryCode,
    countryName,
    label: countryName,
    x: measurement.centroid[0],
    y: measurement.centroid[1],
    width,
    height,
    availableWidth: measurement.width,
    availableHeight: measurement.height,
    priority: measurement.area,
  };
}

export function createCountryLabelCandidate(
  pathGenerator: GeoPath,
  feature: CountryFeature,
  fontSize: number,
): CountryLabelCandidate | undefined {
  return createCountryLabelCandidateFromAnchor(
    measureCountryLabelAnchor(pathGenerator, feature),
    fontSize,
  );
}

/**
 * Keeps the labels that don't overlap a higher-priority (larger) one, sorted
 * by country name.
 */
export function placeCountryLabels(
  candidates: Array<CountryLabelCandidate | undefined>,
): CountryLabelCandidate[] {
  return candidates
    .filter((candidate): candidate is CountryLabelCandidate =>
      Boolean(candidate),
    )
    .sort((left, right) => right.priority - left.priority)
    .reduce<CountryLabelCandidate[]>((accepted, candidate) => {
      if (accepted.some((label) => intersects(label, candidate)))
        return accepted;
      accepted.push(candidate);
      return accepted;
    }, [])
    .sort((left, right) => left.countryName.localeCompare(right.countryName));
}

/** Label size on screen, in pixels, at a zoom level. */
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

/** Label size in map coordinates, so it renders at the screen size. */
export function resolveCountryLabelMapFontSize(
  scale: number,
  mapScale: number,
  options: ResolvedZoomOptions,
): number {
  const safeMapScale = Math.max(Number.EPSILON, mapScale);

  return resolveCountryLabelScreenFontSize(scale, options) / safeMapScale;
}
