import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import { describe, expect, it } from "vitest";
import topoData from "../countries.topo.js";
import { getFeatureLabelAnchor } from "../labels/getFeatureLabelAnchor.js";
import { placeLabels } from "../labels/placeLabels.js";
import type { ProjectedFeatureGeometry } from "../labels/types.js";

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
const geoFeatures = (
  topoFeature(
    topoData,
    topoData.objects.countries,
  ) as unknown as GeoJSON.FeatureCollection
).features as Array<GeoJSON.Feature & { properties: { N: string; I: string } }>;
/* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

describe("placeLabels", () => {
  const ownGeometry: ProjectedFeatureGeometry = {
    bounds: [
      [0, 0],
      [100, 20],
    ],
    polygons: [
      [
        [
          [0, 0],
          [40, 0],
          [40, 20],
          [0, 20],
          [0, 0],
        ],
      ],
      [
        [
          [60, 0],
          [100, 0],
          [100, 20],
          [60, 20],
          [60, 0],
        ],
      ],
    ],
  };
  const neighborGeometry: ProjectedFeatureGeometry = {
    bounds: [
      [42, 0],
      [58, 20],
    ],
    polygons: [
      [
        [
          [42, 0],
          [58, 0],
          [58, 20],
          [42, 20],
          [42, 0],
        ],
      ],
    ],
  };

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

  it("skips labels that would overflow their feature bounds", () => {
    const placed = placeLabels(
      [
        {
          id: "small-region",
          text: "California",
          x: 5,
          y: 5,
          bounds: [
            [0, 0],
            [10, 10],
          ],
          priority: 10,
          layer: "region",
          minScale: 1,
        },
      ],
      2,
    );

    expect(placed).toEqual([]);
  });

  it("anchors multi-polygon country labels to the largest geographic polygon", () => {
    const projection = geoMercator();
    const pathGenerator = geoPath().projection(projection);
    const unitedStates = geoFeatures.find(
      (feature) => feature.properties.I === "US",
    )!;
    const norway = geoFeatures.find(
      (feature) => feature.properties.I === "NO",
    )!;

    const [rawUsX, rawUsY] = pathGenerator.centroid(unitedStates);
    const [rawNorwayX, rawNorwayY] = pathGenerator.centroid(norway);
    const [usX] = getFeatureLabelAnchor(unitedStates, pathGenerator);
    const [norwayX, norwayY] = getFeatureLabelAnchor(norway, pathGenerator);

    expect(usX).toBeGreaterThan(rawUsX + 40);
    expect(norwayY).toBeGreaterThan(rawNorwayY + 40);
    expect(Math.abs(norwayX - rawNorwayX)).toBeLessThan(30);
    expect(norwayY).toBeGreaterThan(0);
    expect(rawUsY).toBeGreaterThan(0);
  });

  it("allows a label to span same-feature water when it does not cross foreign land", () => {
    const placed = placeLabels(
      [
        {
          id: "archipelago",
          text: "Ohio",
          x: 50,
          y: 10,
          priority: 10,
          layer: "country",
          minScale: 1,
        },
      ],
      2,
      {
        featureGeometries: {
          archipelago: ownGeometry,
        },
        width: 200,
        height: 80,
        scaleFactor: 1,
        translateX: 0,
        translateY: -240,
      },
    );

    expect(placed.map((label) => label.id)).toEqual(["archipelago"]);
  });

  it("repositions a label away from foreign land before placing it", () => {
    const placed = placeLabels(
      [
        {
          id: "archipelago",
          text: "Ohio",
          x: 50,
          y: 10,
          priority: 10,
          layer: "country",
          minScale: 1,
        },
      ],
      2,
      {
        featureGeometries: {
          archipelago: ownGeometry,
          neighbor: neighborGeometry,
        },
        width: 200,
        height: 80,
        scaleFactor: 1,
        translateX: 0,
        translateY: -240,
      },
    );

    expect(placed).toHaveLength(1);
    expect(placed[0]!.x).not.toBe(50);
  });

  it("accepts a nearby label position once it no longer overlaps foreign land", () => {
    const placed = placeLabels(
      [
        {
          id: "archipelago",
          text: "Ohio",
          x: 74,
          y: 10,
          priority: 10,
          layer: "country",
          minScale: 1,
        },
      ],
      2,
      {
        featureGeometries: {
          archipelago: ownGeometry,
          neighbor: neighborGeometry,
        },
        width: 200,
        height: 80,
        scaleFactor: 1,
        translateX: 0,
        translateY: -240,
      },
    );

    expect(placed).toHaveLength(1);
    expect(placed[0]!.x).toBe(74);
  });
});
