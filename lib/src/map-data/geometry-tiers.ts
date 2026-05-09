import type GeoJSON from "geojson";
import { feature as topoFeature } from "topojson-client";
import reducedTopoData, {
  topologyMetadata as reducedTopologyMetadata,
} from "../countries-reduced.topo.js";
import {
  detailedCountryGeometryMinZoom,
  regionGeometryMinZoom,
} from "../constants.js";
import type {
  CountryGeometryTierName,
  GeometryTierLoadState,
} from "../types.js";

type CountryFeature = GeoJSON.Feature & {
  properties: { N: string; I: string };
};

export type CountryFeatureCollection = GeoJSON.FeatureCollection & {
  features: CountryFeature[];
};

export interface CountryGeometryTier {
  name: CountryGeometryTierName;
  loadState: GeometryTierLoadState;
  features: CountryFeature[];
  metadata: typeof reducedTopologyMetadata;
}

export interface GeometryTierParseGuards {
  reducedParsed: boolean;
  detailedParsed: boolean;
}

const parseGuards: GeometryTierParseGuards = {
  reducedParsed: false,
  detailedParsed: false,
};

function decodeCountryFeatures(
  topoData: typeof reducedTopoData,
): CountryFeature[] {
  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
  const collection = topoFeature(
    topoData,
    topoData.objects.countries,
  ) as unknown as CountryFeatureCollection;
  /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

  return collection.features;
}

export const reducedCountryFeatures = decodeCountryFeatures(reducedTopoData);
parseGuards.reducedParsed = true;

export const reducedCountryGeometryTier: CountryGeometryTier = {
  name: "reduced",
  loadState: "ready",
  features: reducedCountryFeatures,
  metadata: reducedTopologyMetadata,
};

export function getCountryGeometryTierName(
  zoomScale: number,
): CountryGeometryTierName {
  return zoomScale >= detailedCountryGeometryMinZoom ? "detailed" : "reduced";
}

export function shouldLoadDetailedCountryGeometry(zoomScale: number): boolean {
  return getCountryGeometryTierName(zoomScale) === "detailed";
}

export function shouldLoadRegionGeometry(zoomScale: number): boolean {
  return zoomScale >= regionGeometryMinZoom;
}

export function getGeometryTierParseGuards(): GeometryTierParseGuards {
  return { ...parseGuards };
}

export function resetGeometryTierParseGuardsForTests(): void {
  parseGuards.reducedParsed = true;
  parseGuards.detailedParsed = false;
}

export async function loadDetailedCountryGeometry(): Promise<CountryGeometryTier> {
  const module = await import("../countries-detailed.topo.js");
  parseGuards.detailedParsed = true;

  return {
    name: "detailed",
    loadState: "ready",
    features: decodeCountryFeatures(module.default),
    metadata: module.topologyMetadata,
  };
}
