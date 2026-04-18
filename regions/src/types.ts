export type DetailLevel = "countries" | "regions";
export type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

export interface RegionLabelSet {
  englishName: string;
  localizedName?: string;
  shortName?: string;
}

export interface RegionFeatureRecord {
  id: string;
  countryCode: string;
  labels: RegionLabelSet;
  path: string;
  centroid?: [number, number];
  bounds?: [[number, number], [number, number]];
  order?: number;
}

export interface RegionCollectionRecord {
  countryCode: string;
  englishCountryName: string;
  regions: RegionFeatureRecord[];
  viewportBounds?: [[number, number], [number, number]];
}

export interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  detailLevel: DetailLevel;
  collection?: RegionCollectionRecord;
  warning?: string;
}

export interface DetailProvider {
  supports: (countryCode: string) => boolean;
  loadRegions: (countryCode: string) => Promise<DetailProviderResult>;
}
