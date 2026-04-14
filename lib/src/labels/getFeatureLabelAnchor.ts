import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import { projectFeatureGeometry } from "./geometry.js";
import type {
  ProjectedPoint,
  ProjectedPolygon,
  ProjectedRing,
} from "./types.js";

interface LabelPoint {
  point: ProjectedPoint;
  distance: number;
}

interface Cell {
  x: number;
  y: number;
  h: number;
  distance: number;
  maxDistance: number;
}

const LABEL_POINT_PRECISION = 1;

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

function getPointToSegmentDistanceSquared(
  point: ProjectedPoint,
  left: ProjectedPoint,
  right: ProjectedPoint,
): number {
  let [x, y] = left;
  let dx = right[0] - x;
  let dy = right[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = right[0];
      y = right[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;

  return dx * dx + dy * dy;
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

function getSignedDistance(
  point: ProjectedPoint,
  polygon: ProjectedPolygon,
): number {
  let isInside = false;
  let minDistanceSquared = Number.POSITIVE_INFINITY;

  for (const ring of polygon) {
    if (isPointInRing(point, ring)) isInside = !isInside;

    for (let index = 0; index < ring.length - 1; index += 1) {
      minDistanceSquared = Math.min(
        minDistanceSquared,
        getPointToSegmentDistanceSquared(point, ring[index], ring[index + 1]),
      );
    }
  }

  const distance = Math.sqrt(minDistanceSquared);
  return isInside ? distance : -distance;
}

function createCell(
  x: number,
  y: number,
  h: number,
  polygon: ProjectedPolygon,
): Cell {
  const distance = getSignedDistance([x, y], polygon);

  return {
    x,
    y,
    h,
    distance,
    maxDistance: distance + h * Math.SQRT2,
  };
}

function getCentroidCell(polygon: ProjectedPolygon): Cell {
  const outerRing = polygon[0];
  let area = 0;
  let x = 0;
  let y = 0;

  for (
    let index = 0, previous = outerRing.length - 1;
    index < outerRing.length;
    previous = index++
  ) {
    const [leftX, leftY] = outerRing[index];
    const [rightX, rightY] = outerRing[previous];
    const cross = leftX * rightY - rightX * leftY;

    x += (leftX + rightX) * cross;
    y += (leftY + rightY) * cross;
    area += cross * 3;
  }

  if (area === 0) {
    const bounds = getRingBounds(outerRing);

    return createCell(
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
      0,
      polygon,
    );
  }

  return createCell(x / area, y / area, 0, polygon);
}

function getOuterRingArea(ring: ProjectedRing): number {
  let area = 0;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [leftX, leftY] = ring[index];
    const [rightX, rightY] = ring[previous];
    area += rightX * leftY - leftX * rightY;
  }

  return Math.abs(area / 2);
}

function getPolygonLabelPoint(polygon: ProjectedPolygon): LabelPoint {
  const bounds = getRingBounds(polygon[0]);
  const width = bounds[1][0] - bounds[0][0];
  const height = bounds[1][1] - bounds[0][1];
  const cellSize = Math.min(width, height);

  if (cellSize <= 0) {
    return {
      point: [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2,
      ],
      distance: 0,
    };
  }

  let bestCell = getCentroidCell(polygon);
  const boxCell = createCell(
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
    0,
    polygon,
  );

  if (boxCell.distance > bestCell.distance) bestCell = boxCell;

  const pending: Cell[] = [];

  for (let x = bounds[0][0]; x < bounds[1][0]; x += cellSize) {
    for (let y = bounds[0][1]; y < bounds[1][1]; y += cellSize) {
      pending.push(
        createCell(x + cellSize / 2, y + cellSize / 2, cellSize / 2, polygon),
      );
    }
  }

  while (pending.length > 0) {
    pending.sort((left, right) => right.maxDistance - left.maxDistance);
    const cell = pending.shift();

    if (cell == null) break;

    if (cell.distance > bestCell.distance) bestCell = cell;

    if (cell.maxDistance - bestCell.distance <= LABEL_POINT_PRECISION) continue;

    const nextHalf = cell.h / 2;
    pending.push(
      createCell(cell.x - nextHalf, cell.y - nextHalf, nextHalf, polygon),
      createCell(cell.x + nextHalf, cell.y - nextHalf, nextHalf, polygon),
      createCell(cell.x - nextHalf, cell.y + nextHalf, nextHalf, polygon),
      createCell(cell.x + nextHalf, cell.y + nextHalf, nextHalf, polygon),
    );
  }

  return {
    point: [bestCell.x, bestCell.y],
    distance: bestCell.distance,
  };
}

export function getFeatureLabelAnchor(
  feature: GeoJSON.Feature,
  pathGenerator: GeoPath,
): [number, number] {
  const projectedGeometry = projectFeatureGeometry(feature, pathGenerator);

  if (projectedGeometry == null) 
    return pathGenerator.centroid(feature);
  

  const bestPolygon = projectedGeometry.polygons
    .map((polygon) => ({
      polygon,
      area: getOuterRingArea(polygon[0]),
    }))
    .sort((left, right) => right.area - left.area)[0];

  return bestPolygon != null
    ? getPolygonLabelPoint(bestPolygon.polygon).point
    : pathGenerator.centroid(feature);
}
