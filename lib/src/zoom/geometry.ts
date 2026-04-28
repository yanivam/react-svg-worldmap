import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";

export interface GeometryMeasurement {
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  width: number;
  height: number;
  area: number;
}

export function measureFeature(
  pathGenerator: GeoPath,
  feature: GeoJSON.Feature,
): GeometryMeasurement {
  const bounds = pathGenerator.bounds(feature);
  const centroid = pathGenerator.centroid(feature);
  const width = Math.max(0, bounds[1][0] - bounds[0][0]);
  const height = Math.max(0, bounds[1][1] - bounds[0][1]);

  return {
    bounds,
    centroid,
    width,
    height,
    area: width * height,
  };
}

export function getLargestGeometryPart(
  pathGenerator: GeoPath,
  feature: GeoJSON.Feature,
): GeoJSON.Feature {
  if (feature.geometry.type !== "MultiPolygon") return feature;

  return feature.geometry.coordinates
    .map((coordinates, index) => {
      const part: GeoJSON.Feature = {
        type: "Feature",
        properties: {
          ...(feature.properties ?? {}),
          geometryPartId: index,
        },
        geometry: {
          type: "Polygon",
          coordinates,
        },
      };
      return {
        feature: part,
        area: measureFeature(pathGenerator, part).area,
      };
    })
    .sort((left, right) => right.area - left.area)[0]!.feature;
}
