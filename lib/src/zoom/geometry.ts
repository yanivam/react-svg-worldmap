import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import type { ProjectionOption, ZoomState } from "../types.js";
import { projectionLayouts } from "../projections.js";

// Width of the coordinate space every projection draws into.
const mapCoordinateWidth = 960;

export interface GeometryMeasurement {
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  width: number;
  height: number;
  area: number;
}

export interface MapViewport {
  width: number;
  height: number;
}

export interface MapTransform {
  mapScale: number;
  contentTranslate: [number, number];
  transform: string;
}

export function createMapViewport(width: number, height: number): MapViewport {
  return {
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

/**
 * The transform shared by every map layer that moves with the countries.
 * Without any zoom it is the same transform earlier releases used.
 */
export function createMapTransform(
  viewport: MapViewport,
  zoomState: ZoomState,
  projection: ProjectionOption,
): MapTransform {
  const mapScale = (viewport.width / mapCoordinateWidth) * zoomState.scale;
  const [translateX, translateY] = zoomState.translate;
  const contentTranslate: [number, number] = [
    0,
    projectionLayouts[projection].offsetY,
  ];

  return {
    mapScale,
    contentTranslate,
    transform: `translate(${translateX}, ${translateY}) scale(${mapScale}) translate(${contentTranslate[0]}, ${contentTranslate[1]})`,
  };
}

/** The size of a projection's coordinate space (960 × 720 for Mercator). */
export function getCanonicalMapViewport(
  projection: ProjectionOption,
): MapViewport {
  return {
    width: mapCoordinateWidth,
    height: mapCoordinateWidth * projectionLayouts[projection].heightRatio,
  };
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

/**
 * The largest projected part of a country, so its label goes on the
 * mainland rather than between islands (the contiguous US, not Alaska).
 */
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
