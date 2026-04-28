import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import type { CountryLabelCandidate, ISOCode } from "../types.js";
import { getLargestGeometryPart, measureFeature } from "../zoom/geometry.js";

const LABEL_FONT_SIZE = 12;
const LABEL_HEIGHT = 14;
const DETAIL_HEIGHT = 24;
const AVERAGE_CHARACTER_WIDTH = 6.5;

function estimateTextWidth(label: string): number {
  return label.length * AVERAGE_CHARACTER_WIDTH;
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

export function createCountryLabelCandidate(
  pathGenerator: GeoPath,
  feature: GeoJSON.Feature & { properties: { N: string; I: string } },
  scale: number,
): CountryLabelCandidate | undefined {
  const label = feature.properties.N;
  const part = getLargestGeometryPart(pathGenerator, feature);
  const measurement = measureFeature(pathGenerator, part);
  const width = estimateTextWidth(label) / scale;
  const height = LABEL_HEIGHT / scale;
  const minWidth = Math.max(width * 1.2, 14 / scale);
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
  return candidates
    .filter((candidate): candidate is CountryLabelCandidate =>
      Boolean(candidate),
    )
    .sort((left, right) => right.priority - left.priority)
    .reduce<CountryLabelCandidate[]>((accepted, candidate) => {
      if (accepted.some((label) => intersects(label, candidate)))
        return accepted;
      return [...accepted, candidate];
    }, [])
    .sort((left, right) => left.countryName.localeCompare(right.countryName));
}

export function canShowCountryDetails(
  label: CountryLabelCandidate,
  scale: number,
): boolean {
  const detailWidth = Math.max(
    label.width,
    estimateTextWidth("Capital city") / scale,
  );
  const detailHeight = DETAIL_HEIGHT / scale;

  return (
    label.availableWidth >= detailWidth * 1.1 &&
    label.availableHeight >= label.height + detailHeight
  );
}

export const countryLabelFontSize = LABEL_FONT_SIZE;
