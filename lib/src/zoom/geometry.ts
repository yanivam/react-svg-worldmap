import type GeoJSON from "geojson";
import type { GeoPath } from "d3-geo";
import {
  mapCoordinateHeight,
  mapCoordinateTranslate,
  mapCoordinateWidth,
} from "../constants.js";
import type { ZoomState } from "../types.js";

export interface GeometryMeasurement {
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  width: number;
  height: number;
  area: number;
}

function reversePolygonRings(
  coordinates: GeoJSON.Polygon["coordinates"],
): GeoJSON.Polygon["coordinates"] {
  return coordinates.map((ring) => [...ring].reverse());
}

function isFullSphereMeasurement(
  pathGenerator: GeoPath,
  measurement: GeometryMeasurement,
): boolean {
  const sphereBounds = pathGenerator.bounds({ type: "Sphere" });
  const sphereWidth = Math.max(0, sphereBounds[1][0] - sphereBounds[0][0]);
  const sphereHeight = Math.max(0, sphereBounds[1][1] - sphereBounds[0][1]);

  return (
    sphereWidth > 0 &&
    sphereHeight > 0 &&
    measurement.width >= sphereWidth * 0.99 &&
    measurement.height >= sphereHeight * 0.99
  );
}

function normalizePolygonForProjection(
  pathGenerator: GeoPath,
  coordinates: GeoJSON.Polygon["coordinates"],
): GeoJSON.Polygon["coordinates"] {
  const polygon: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates,
    },
  };
  const measurement = measureFeature(pathGenerator, polygon);
  if (!isFullSphereMeasurement(pathGenerator, measurement)) return coordinates;

  return reversePolygonRings(coordinates);
}

export function normalizeFeatureForProjection<T extends GeoJSON.Feature>(
  pathGenerator: GeoPath,
  feature: T,
): T {
  if (feature.geometry.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: normalizePolygonForProjection(
          pathGenerator,
          feature.geometry.coordinates,
        ),
      },
    };
  }

  if (feature.geometry.type === "MultiPolygon") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map((coordinates) =>
          normalizePolygonForProjection(pathGenerator, coordinates),
        ),
      },
    };
  }

  return feature;
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

export function createMapTransform(
  viewport: MapViewport,
  zoomState: ZoomState,
): MapTransform {
  const safeWidth = viewport.width > 0 ? viewport.width : mapCoordinateWidth;
  const mapScale = (safeWidth / mapCoordinateWidth) * zoomState.scale;
  const [translateX, translateY] = zoomState.translate;
  const [contentTranslateX, contentTranslateY] = mapCoordinateTranslate;

  return {
    mapScale,
    contentTranslate: mapCoordinateTranslate,
    transform: `translate(${translateX}, ${translateY}) scale(${mapScale}) translate(${contentTranslateX}, ${contentTranslateY})`,
  };
}

export function getCanonicalMapViewport(): MapViewport {
  return {
    width: mapCoordinateWidth,
    height: mapCoordinateHeight,
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

export function getLargestGeometryPart(
  pathGenerator: GeoPath,
  feature: GeoJSON.Feature,
): GeoJSON.Feature {
  const normalizedFeature = normalizeFeatureForProjection(
    pathGenerator,
    feature,
  );
  if (normalizedFeature.geometry.type !== "MultiPolygon")
    return normalizedFeature;

  return normalizedFeature.geometry.coordinates
    .map((coordinates, index) => {
      const part: GeoJSON.Feature = {
        type: "Feature",
        properties: {
          ...(normalizedFeature.properties ?? {}),
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
