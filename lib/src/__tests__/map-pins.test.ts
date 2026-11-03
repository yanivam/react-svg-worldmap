import { geoMercator } from "d3-geo";
import { describe, expect, it } from "vitest";

import { projectMapPins } from "../pins/mapPins.js";

describe("map pins", () => {
  it("projects valid longitude and latitude coordinates", () => {
    const pins = projectMapPins(
      [{ caption: "Washington, DC", coordinates: [-77.0163, 38.9047] }],
      geoMercator(),
      1,
    );

    expect(pins).toHaveLength(1);
    expect(typeof pins[0]!.x).toBe("number");
    expect(typeof pins[0]!.y).toBe("number");
  });

  it("ignores invalid coordinates", () => {
    const pins = projectMapPins(
      [
        { caption: "Invalid longitude", coordinates: [200, 0] },
        { caption: "Invalid latitude", coordinates: [0, -120] },
      ],
      geoMercator(),
      1,
    );

    expect(pins).toEqual([]);
  });

  it("keeps higher-priority pins when captions collide", () => {
    const pins = projectMapPins(
      [
        {
          caption: "Low priority",
          coordinates: [0, 0],
          priority: 1,
        },
        {
          caption: "High priority",
          coordinates: [0.1, 0.1],
          priority: 10,
        },
      ],
      geoMercator(),
      1,
    );

    expect(pins).toHaveLength(1);
    expect(pins[0]!.pin.caption).toBe("High priority");
  });
});
