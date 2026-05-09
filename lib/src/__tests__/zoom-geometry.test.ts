import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import { describe, expect, it } from "vitest";

import { getLargestGeometryPart, measureFeature } from "../zoom/geometry.js";

const feature = (geometryPartId?: number): GeoJSON.Feature => ({
  type: "Feature",
  properties: geometryPartId == null ? {} : { geometryPartId },
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
});

const pathGenerator = {
  bounds(
    target: GeoJSON.Feature | { type: "Sphere" },
  ): [[number, number], [number, number]] {
    if (target.type === "Sphere") {
      return [
        [0, 0],
        [10, 10],
      ];
    }

    const partId = Number(target.properties?.geometryPartId ?? 0);

    return partId === 1
      ? [
          [0, 0],
          [4, 3],
        ]
      : [
          [0, 0],
          [2, 2],
        ];
  },
  centroid(target: GeoJSON.Feature): [number, number] {
    const partId = Number(target.properties?.geometryPartId ?? 0);

    return partId === 1 ? [2, 1.5] : [1, 1];
  },
} as unknown as GeoPath;

describe("zoom geometry helpers", () => {
  it("measures projected bounds, centroid, and area", () => {
    expect(measureFeature(pathGenerator, feature())).toEqual({
      bounds: [
        [0, 0],
        [2, 2],
      ],
      centroid: [1, 1],
      width: 2,
      height: 2,
      area: 4,
    });
  });

  it("selects the largest projected part from non-contiguous geometry", () => {
    const multiPartFeature: GeoJSON.Feature = {
      type: "Feature",
      properties: { N: "Example", I: "EX" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 0],
            ],
          ],
          [
            [
              [0, 0],
              [2, 0],
              [2, 2],
              [0, 0],
            ],
          ],
        ],
      },
    };

    expect(
      getLargestGeometryPart(pathGenerator, multiPartFeature).properties,
    ).toMatchObject({ geometryPartId: 1 });
  });
});
