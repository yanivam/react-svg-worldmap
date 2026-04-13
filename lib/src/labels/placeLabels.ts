import { measureLabel } from "./measureLabel.js";
import type { LabelCandidate, PlacedLabel } from "./types.js";

interface PlacementOptions {
  width: number;
  height: number;
  scaleFactor: number;
  translateX: number;
  translateY: number;
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
    if (candidate.bounds != null) {
      const [[minX, minY], [maxX, maxY]] = candidate.bounds;
      if (
        candidate.x - size.width / 2 < minX + padding ||
        candidate.x + size.width / 2 > maxX - padding ||
        candidate.y - size.height / 2 < minY + padding ||
        candidate.y + size.height / 2 > maxY - padding
      ) 
        continue;
      
    }

    if (options != null) {
      const screenX = options.translateX + options.scaleFactor * candidate.x;
      const screenY =
        options.translateY + options.scaleFactor * (candidate.y + 240);
      const halfWidth = (size.width * options.scaleFactor) / 2;
      const halfHeight = (size.height * options.scaleFactor) / 2;

      if (
        screenX - halfWidth < 0 ||
        screenX + halfWidth > options.width ||
        screenY - halfHeight < 0 ||
        screenY + halfHeight > options.height
      ) 
        continue;
      
    }

    const next: PlacedLabel = { ...candidate, ...size };
    const collides = placed.some(
      (label) =>
        Math.abs(label.x - next.x) < (label.width + next.width) / 2 &&
        Math.abs(label.y - next.y) < (label.height + next.height) / 2,
    );

    if (!collides) placed.push(next);
  }

  return placed;
}
