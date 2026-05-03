/**
 * Type shim so the website can import the ESM lib without TS1479 (CJS/ESM)
 * when using moduleResolution NodeNext. Types mirrored from the lib.
 */
declare module "react-svg-worldmap" {
  import type React from "react";

  export type ISOCode = string;
  export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

  export interface ZoomState {
    scale: number;
    translate: [number, number];
  }

  export interface ZoomOptions {
    enabled?: boolean;
    initialScale?: number;
    minScale?: number;
    zoomFactor?: number;
    showControls?: boolean;
    showCountryLabels?: boolean;
    countryLabelMinFontSize?: number;
    countryLabelMaxFontSize?: number;
    countryLabelZoomGrowthRate?: number;
    showPins?: boolean;
  }

  export type DetailLevel = "countries" | "regions";
  export type RegionCoverageStatus =
    | "complete"
    | "partial"
    | "experimental"
    | "unavailable";
  export type DetailLayerStatus =
    | "idle"
    | "loading"
    | "ready"
    | "unavailable"
    | "failed";

  export interface RegionCoverageRecord {
    countryCode: ISOCode;
    countryName: string;
    status: RegionCoverageStatus;
    regionCount: number;
    expectedRegionCount?: number;
    sourceSummary?: string;
    sourceUrl?: string;
    reviewNotes?: string;
  }

  export interface RegionFeatureRecord {
    id: string;
    countryCode: ISOCode;
    name: string;
    localizedName?: string;
    kind?: string;
    path: string;
    centroid?: readonly [number, number];
    bounds?: readonly [readonly [number, number], readonly [number, number]];
    order?: number;
    sourceId?: string;
  }

  export interface RegionCollectionRecord {
    countryCode: ISOCode;
    countryName: string;
    coverageStatus: RegionCoverageStatus;
    expectedRegionCount?: number;
    sourceSummary?: string;
    sourceUrl?: string;
    regions: RegionFeatureRecord[];
    reviewNotes?: string;
  }

  export interface DetailProviderResult {
    status: DetailLayerStatus;
    layer: "regions";
    countryCode?: ISOCode;
    coverageStatus?: RegionCoverageStatus;
    collection?: RegionCollectionRecord;
    warning?: string;
  }

  export interface DetailProvider {
    supports: (countryCode: ISOCode) => boolean;
    getCoverage?: (countryCode?: ISOCode) => RegionCoverageRecord[];
    loadRegions: (countryCode: ISOCode) => Promise<DetailProviderResult>;
  }

  export interface MapPin {
    id?: string;
    coordinates: readonly [number, number];
    caption: string;
    countryCode?: ISOCode;
    kind?: string;
    priority?: number;
  }

  export interface DataItem<T extends string | number = number> {
    country: ISOCode;
    value: T;
  }

  export type Data<T extends string | number = number> = DataItem<T>[];

  export interface CountryContext<T extends string | number = number> {
    countryCode: ISOCode;
    countryName: string;
    countryValue?: T | undefined;
    color: string;
    minValue: number;
    maxValue: number;
    prefix: string;
    suffix: string;
  }

  export interface Props<T extends string | number = number> {
    data: DataItem<T>[];
    title?: string;
    valuePrefix?: string;
    valueSuffix?: string;
    color?: string;
    strokeOpacity?: number;
    backgroundColor?: string;
    tooltipBgColor?: string;
    tooltipTextColor?: string;
    rtl?: boolean;
    size?: SizeOption | "responsive" | number;
    frame?: boolean;
    containerClassName?: string;
    regionClassName?: string;
    frameColor?: string;
    borderColor?: string;
    richInteraction?: boolean;
    zoom?: boolean | ZoomOptions;
    onZoomChange?: (state: ZoomState) => void;
    pins?: readonly MapPin[];
    detailLevel?: DetailLevel;
    detailProvider?: DetailProvider;
    onDetailStatusChange?: (status: DetailProviderResult) => void;
    showRegionList?: boolean;
    type?: string;
    styleFunction?: (context: CountryContext<T>) => React.CSSProperties;
    onClickFunction?: (
      context: CountryContext<T> & {
        event: React.MouseEvent<SVGElement, Event>;
      },
    ) => void;
    tooltipTextFunction?: (context: CountryContext<T>) => string;
    hrefFunction?: (
      context: CountryContext<T>,
    ) => React.ComponentProps<"a"> | string | undefined;
    textLabelFunction?: (
      width: number,
    ) => ({ label: string } & React.ComponentProps<"text">)[];
  }

  function WorldMap<T extends string | number = number>(
    props: Props<T>,
  ): React.JSX.Element;
  export default WorldMap;
}

declare module "@react-svg-worldmap/regions" {
  export type DetailProvider = import("react-svg-worldmap").DetailProvider;
  export type DetailProviderResult =
    import("react-svg-worldmap").DetailProviderResult;
  export type DetailLayerStatus =
    import("react-svg-worldmap").DetailLayerStatus;
  export type DetailLevel = import("react-svg-worldmap").DetailLevel;
  export type RegionCollectionRecord =
    import("react-svg-worldmap").RegionCollectionRecord;
  export type RegionCoverageRecord =
    import("react-svg-worldmap").RegionCoverageRecord;
  export type RegionCoverageStatus =
    import("react-svg-worldmap").RegionCoverageStatus;
  export type RegionFeatureRecord =
    import("react-svg-worldmap").RegionFeatureRecord;
  export const regionCoverage: import("react-svg-worldmap").RegionCoverageRecord[];
  export const targetRegionCountries: Array<{
    countryCode: import("react-svg-worldmap").ISOCode;
    countryName: string;
    continentGroup: "Americas" | "Europe" | "Asia" | "Africa" | "Oceania";
  }>;
  export const regionCollections: Record<
    string,
    import("react-svg-worldmap").RegionCollectionRecord
  >;
  export function getRegionCoverage(
    countryCode?: import("react-svg-worldmap").ISOCode,
  ): import("react-svg-worldmap").RegionCoverageRecord[];
  export function createRegionsDetailProvider(): import("react-svg-worldmap").DetailProvider;
}
