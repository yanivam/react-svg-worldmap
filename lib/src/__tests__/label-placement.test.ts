import type { GeoPath } from "d3-geo";
import { describe, expect, it } from "vitest";

import {
  createCountryLabelCandidate,
  placeCountryLabels,
  resolveCountryLabelMapFontSize,
  resolveCountryLabelScreenFontSize,
} from "../labels/placement.js";
import type { CountryLabelCandidate } from "../types.js";
import type { ResolvedZoomOptions } from "../zoom/state.js";

const candidate = (
  countryName: string,
  x: number,
  y: number,
  priority: number,
): CountryLabelCandidate => ({
  countryCode: "US",
  countryName,
  label: countryName,
  x,
  y,
  width: 20,
  height: 10,
  availableWidth: 100,
  availableHeight: 60,
  priority,
});

const zoomOptions: ResolvedZoomOptions = {
  enabled: true,
  initialScale: 1,
  minScale: 1,
  maxScale: 8,
  zoomFactor: 1.5,
  showControls: true,
  showCountryLabels: true,
  countryLabelMinFontSize: 12,
  countryLabelMaxFontSize: 20,
  countryLabelZoomGrowthRate: 0.35,
  showPins: true,
};

// Every feature measures 100 × 50 with its centroid in the middle.
const measuredPathGenerator = Object.assign(() => [50, 25], {
  bounds: () => [
    [0, 0],
    [100, 50],
  ],
  area: () => 5000,
  centroid: () => [50, 25],
}) as unknown as GeoPath;

describe("label placement", () => {
  it("keeps higher-priority labels when candidates overlap", () => {
    const labels = placeCountryLabels([
      candidate("Small", 0, 0, 1),
      candidate("Large", 0, 0, 10),
    ]);

    expect(labels).toHaveLength(1);
    expect(labels[0]!.countryName).toBe("Large");
  });

  it("keeps labels that do not overlap", () => {
    const labels = placeCountryLabels([
      candidate("Left", 0, 0, 1),
      candidate("Right", 100, 0, 1),
    ]);

    expect(labels.map((label) => label.countryName)).toEqual(["Left", "Right"]);
  });

  it("creates label candidates with text bounds based on computed font size", () => {
    const feature = {
      type: "Feature",
      properties: { N: "Test Land", I: "US" },
      geometry: { type: "Polygon", coordinates: [] },
    } as const;

    const small = createCountryLabelCandidate(
      measuredPathGenerator,
      feature,
      8,
    );
    const large = createCountryLabelCandidate(
      measuredPathGenerator,
      feature,
      16,
    );

    expect(small).toBeDefined();
    expect(large).toBeDefined();
    expect(large!.width).toBeGreaterThan(small!.width);
    expect(large!.height).toBeGreaterThan(small!.height);
  });

  it("rejects labels that do not fit their country geometry", () => {
    const feature = {
      type: "Feature",
      properties: { N: "Very Long Test Land", I: "US" },
      geometry: { type: "Polygon", coordinates: [] },
    } as const;

    const label = createCountryLabelCandidate(
      measuredPathGenerator,
      feature,
      40,
    );

    expect(label).toBeUndefined();
  });

  it("computes clamped zoom-aware label font sizes", () => {
    expect(resolveCountryLabelScreenFontSize(1, zoomOptions)).toBe(12);
    expect(resolveCountryLabelScreenFontSize(64, zoomOptions)).toBe(20);
    expect(resolveCountryLabelMapFontSize(4, 2, zoomOptions)).toBeCloseTo(
      resolveCountryLabelScreenFontSize(4, zoomOptions) / 2,
    );
  });
});
