import { measureLabel } from "./measureLabel.js";
import type { LabelCandidate, PlacedLabel } from "./types.js";

export function placeLabels(
  candidates: LabelCandidate[],
  currentScale: number,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const sorted = [...candidates]
    .filter((candidate) => currentScale >= candidate.minScale)
    .sort((left, right) => right.priority - left.priority);

  for (const candidate of sorted) {
    const size = measureLabel(candidate.text);
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
