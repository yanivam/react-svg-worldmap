import { describe, expect, it } from "vitest";

import { placeCountryLabels } from "../labels/placement.js";
import type { CountryLabelCandidate } from "../types.js";

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
});
