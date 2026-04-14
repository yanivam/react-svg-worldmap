import {
  createLabelRect,
  estimateLabelCoverage,
  labelIntersectsFeatureGeometry,
} from "./geometry.js";
import { measureLabel } from "./measureLabel.js";
import type {
  LabelCandidate,
  PlacedLabel,
  ProjectedFeatureGeometry,
} from "./types.js";

interface PlacementOptions {
  featureGeometries?: Record<string, ProjectedFeatureGeometry>;
  width: number;
  height: number;
  scaleFactor: number;
  translateX: number;
  translateY: number;
}

function getCandidateOffsets(width: number): Array<[number, number]> {
  const horizontalStep = Math.max(8, width * 0.18);

  return [
    [0, 0],
    [horizontalStep, 0],
    [-horizontalStep, 0],
    [horizontalStep * 2, 0],
    [-horizontalStep * 2, 0],
    [horizontalStep * 3, 0],
    [-horizontalStep * 3, 0],
    [0, -4],
    [0, 4],
  ];
}

function rectOverlapsBounds(
  rect: { left: number; right: number; top: number; bottom: number },
  bounds: [[number, number], [number, number]],
): boolean {
  return !(
    rect.right < bounds[0][0] ||
    rect.left > bounds[1][0] ||
    rect.bottom < bounds[0][1] ||
    rect.top > bounds[1][1]
  );
}

export function placeLabels(
  candidates: LabelCandidate[],
  currentScale: number,
  options?: PlacementOptions,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const sorted = [...candidates]
    .filter((candidate) => currentScale >= candidate.minScale)
    .sort((left, right) => right.priority - left.priority);

  for (const candidate of sorted) {
    const size = measureLabel(candidate.text);
    const padding = 4;
    const ownGeometry = options?.featureGeometries?.[candidate.id];
    const foreignGeometries = Object.entries(options?.featureGeometries ?? {})
      .filter(([featureId]) => featureId !== candidate.id)
      .map(([, geometry]) => geometry);

    const next = getCandidateOffsets(size.width)
      .map(([offsetX, offsetY]) => {
        const x = candidate.x + offsetX;
        const y = candidate.y + offsetY;
        const rect = createLabelRect(x, y, size.width, size.height);

        if (candidate.bounds != null) {
          const [[minX, minY], [maxX, maxY]] = candidate.bounds;
          if (
            rect.left < minX + padding ||
            rect.right > maxX - padding ||
            rect.top < minY + padding ||
            rect.bottom > maxY - padding
          )
            return null;
        }

        if (options != null) {
          const screenX = options.translateX + options.scaleFactor * x;
          const screenY = options.translateY + options.scaleFactor * (y + 240);
          const halfWidth = (size.width * options.scaleFactor) / 2;
          const halfHeight = (size.height * options.scaleFactor) / 2;

          if (
            screenX - halfWidth < 0 ||
            screenX + halfWidth > options.width ||
            screenY - halfHeight < 0 ||
            screenY + halfHeight > options.height
          )
            return null;
        }

        const ownCoverage =
          ownGeometry != null ? estimateLabelCoverage(rect, ownGeometry) : 1;
        if (ownGeometry != null && ownCoverage === 0) return null;

        const overlapsForeignGeometry = foreignGeometries.some(
          (geometry) =>
            rectOverlapsBounds(rect, geometry.bounds) &&
            labelIntersectsFeatureGeometry(rect, geometry),
        );
        if (overlapsForeignGeometry) return null;

        return {
          ...candidate,
          ...size,
          x,
          y,
          score:
            ownCoverage * 100 - Math.abs(offsetX) * 0.6 - Math.abs(offsetY),
        };
      })
      .filter(
        (positionedLabel): positionedLabel is PlacedLabel & { score: number } =>
          positionedLabel != null,
      )
      .sort((left, right) => right.score - left.score)[0];

    if (next == null) continue;

    const collides = placed.some(
      (label) =>
        Math.abs(label.x - next.x) < (label.width + next.width) / 2 &&
        Math.abs(label.y - next.y) < (label.height + next.height) / 2,
    );

    if (!collides) placed.push(next);
  }

  return placed;
}
