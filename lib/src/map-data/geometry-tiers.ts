import type GeoJSON from "geojson";
import { feature as topoFeature } from "topojson-client";
import reducedTopoData from "../map-assets/countries-reduced.topo.cjs";
import { topologyMetadata as detailedTopologyMetadata } from "../map-assets/countries-detailed.metadata.js";
import { topologyMetadata as reducedSourceTopologyMetadata } from "../map-assets/countries-reduced.metadata.js";
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

type TopologyMetadata =
  | typeof reducedSourceTopologyMetadata
  | typeof detailedTopologyMetadata;

export interface CountryGeometryTier {
  name: CountryGeometryTierName;
  loadState: GeometryTierLoadState;
  features: CountryFeature[];
  metadata: TopologyMetadata;
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
  const collection = topoFeature(
    topoData,
    topoData.objects.countries,
  ) as unknown as CountryFeatureCollection;

  return collection.features;
}

export const reducedCountryFeatures = decodeCountryFeatures(reducedTopoData);
parseGuards.reducedParsed = true;

export const reducedCountryGeometryTier: CountryGeometryTier = {
  name: "reduced",
  loadState: "ready",
  features: reducedCountryFeatures,
  metadata: reducedSourceTopologyMetadata,
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
  const module = await import("../map-assets/countries-detailed.topo.cjs");
  parseGuards.detailedParsed = true;

  return {
    name: "detailed",
    loadState: "ready",
    features: decodeCountryFeatures(module.default),
    metadata: detailedTopologyMetadata,
  };
}
