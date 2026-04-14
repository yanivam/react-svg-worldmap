import type GeoJSON from "geojson";
import type { GeoPath, GeoProjection } from "d3-geo";
import type {
  ProjectedFeatureGeometry,
  ProjectedPoint,
  ProjectedPolygon,
  ProjectedRing,
} from "./types.js";

interface LabelRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function getRingBounds(
  ring: ProjectedRing,
): [[number, number], [number, number]] {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const [x, y] of ring) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

function getProjectedPolygon(
  coordinates: GeoJSON.Position[][],
  projection: GeoProjection,
): ProjectedPolygon | null {
  const rings: ProjectedPolygon = coordinates
    .map((ring) =>
      ring
        .map((position) => projection(position as [number, number]))
        .filter((point): point is ProjectedPoint => point != null),
    )
    .filter((ring) => ring.length >= 4);

  if (rings.length === 0) return null;

  return rings;
}

function getProjectedBounds(
  polygons: ProjectedPolygon[],
): [[number, number], [number, number]] {
  return polygons.reduce<[[number, number], [number, number]]>(
    (combined, polygon) => {
      const bounds = getRingBounds(polygon[0]);

      return [
        [
          Math.min(combined[0][0], bounds[0][0]),
          Math.min(combined[0][1], bounds[0][1]),
        ],
        [
          Math.max(combined[1][0], bounds[1][0]),
          Math.max(combined[1][1], bounds[1][1]),
        ],
      ];
    },
    [
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    ],
  );
}

export function projectFeatureGeometry(
  feature: GeoJSON.Feature,
  pathGenerator: GeoPath,
): ProjectedFeatureGeometry | null {
  const geometry = feature.geometry;
  const projection = pathGenerator.projection();

  const polygons =
    geometry.type === "Polygon"
      ? [getProjectedPolygon(geometry.coordinates, projection)]
      : geometry.type === "MultiPolygon"
      ? geometry.coordinates.map((coordinates) =>
          getProjectedPolygon(coordinates, projection),
        )
      : [];

  const filteredPolygons = polygons.filter(
    (polygon): polygon is ProjectedPolygon => polygon != null,
  );

  if (filteredPolygons.length === 0) return null;

  return {
    polygons: filteredPolygons,
    bounds: getProjectedBounds(filteredPolygons),
  };
}

function isPointInRing(point: ProjectedPoint, ring: ProjectedRing): boolean {
  let isInside = false;

  for (
    let leftIndex = 0, rightIndex = ring.length - 1;
    leftIndex < ring.length;
    rightIndex = leftIndex++
  ) {
    const [leftX, leftY] = ring[leftIndex];
    const [rightX, rightY] = ring[rightIndex];

    const intersects =
      leftY > point[1] !== rightY > point[1] &&
      point[0] <
        ((rightX - leftX) * (point[1] - leftY)) / (rightY - leftY) + leftX;

    if (intersects) isInside = !isInside;
  }

  return isInside;
}

export function isPointInPolygon(
  point: ProjectedPoint,
  polygon: ProjectedPolygon,
): boolean {
  let isInside = false;

  for (const ring of polygon) 
    if (isPointInRing(point, ring)) isInside = !isInside;
  

  return isInside;
}

export function isPointInFeatureGeometry(
  point: ProjectedPoint,
  geometry: ProjectedFeatureGeometry,
): boolean {
  const [[minX, minY], [maxX, maxY]] = geometry.bounds;
  if (
    point[0] < minX ||
    point[0] > maxX ||
    point[1] < minY ||
    point[1] > maxY
  ) 
    return false;
  

  return geometry.polygons.some((polygon) => isPointInPolygon(point, polygon));
}

export function createLabelRect(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): LabelRect {
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
  };
}

function getRectSamplePoints(rect: LabelRect): ProjectedPoint[] {
  const xs = [
    rect.left,
    rect.left + (rect.right - rect.left) * 0.25,
    (rect.left + rect.right) / 2,
    rect.right - (rect.right - rect.left) * 0.25,
    rect.right,
  ];
  const ys = [rect.top, (rect.top + rect.bottom) / 2, rect.bottom];

  return ys.flatMap((y) => xs.map((x) => [x, y] as ProjectedPoint));
}

export function estimateLabelCoverage(
  rect: LabelRect,
  geometry: ProjectedFeatureGeometry,
): number {
  const samples = getRectSamplePoints(rect);
  const coveredPoints = samples.filter((point) =>
    isPointInFeatureGeometry(point, geometry),
  );

  return coveredPoints.length / samples.length;
}

export function labelIntersectsFeatureGeometry(
  rect: LabelRect,
  geometry: ProjectedFeatureGeometry,
  threshold = 1 / 15,
): boolean {
  return estimateLabelCoverage(rect, geometry) > threshold;
}
