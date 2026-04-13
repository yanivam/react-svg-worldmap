import { describe, expect, it } from "vitest";
import { placeLabels } from "../labels/placeLabels.js";

describe("placeLabels", () => {
  it("keeps the higher-priority label when two labels collide", () => {
    const placed = placeLabels(
      [
        {
          id: "country",
          text: "United States",
          x: 100,
          y: 100,
          priority: 10,
          layer: "country",
          minScale: 1,
        },
        {
          id: "region",
          text: "California",
          x: 102,
          y: 102,
          priority: 5,
          layer: "region",
          minScale: 1,
        },
      ],
      2,
    );

    expect(placed.map((label) => label.id)).toEqual(["country"]);
  });
});
