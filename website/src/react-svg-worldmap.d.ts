/**
 * Type shim so the website can import the ESM lib without TS1479 (CJS/ESM)
 * when using moduleResolution NodeNext. Types mirrored from the lib.
 */
declare module "react-svg-worldmap" {
  import type React from "react";

  export type ISOCode = string;
  export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";
  export type ProjectionOption = "mercator" | "equalEarth";
  export const projectionOptions: readonly ProjectionOption[];
  export type MapTheme = "default" | "atlas";
  export const mapThemeOptions: readonly MapTheme[];

  export interface DataItem<T extends string | number = number> {
    country: ISOCode;
    value: T;
  }

  export type Data<T extends string | number = number> = DataItem<T>[];

  export interface ZoomState {
    scale: number;
    translate: [number, number];
  }

  export interface ZoomOptions {
    enabled?: boolean;
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
    zoomFactor?: number;
    showControls?: boolean;
    showCountryLabels?: boolean;
    countryLabelMinFontSize?: number;
    countryLabelMaxFontSize?: number;
    countryLabelZoomGrowthRate?: number;
    showPins?: boolean;
  }

  export interface MapPin {
    id?: string;
    coordinates: readonly [number, number];
    caption: string;
    countryCode?: ISOCode;
    kind?: string;
    priority?: number;
  }

  export type DisputeTier = "tier-1";
  export type DisputeStatus =
    | "disputed"
    | "partially-recognized"
    | "non-self-governing"
    | "politically-sensitive";
  export type DisputeReviewStatus =
    "active" | "deferred" | "maintainer-review-required";
  export type DisputeBorderStyle = "solid" | "dashed" | "unchanged";
  export type DisputeLabelStrategy =
    "single" | "dual" | "segment" | "metadata-only";

  export interface DisputeDisplayGuidance {
    borderStyle: DisputeBorderStyle;
    labelStrategy: DisputeLabelStrategy;
    tooltipLabel: string;
    defaultDescription: string;
  }

  export interface DisputeClassification {
    id: string;
    name: string;
    tier: DisputeTier;
    status: DisputeStatus;
    recognizedSovereign?: string | undefined;
    controllingPower?: string | undefined;
    disputeParties: readonly string[];
    territories: readonly string[];
    sourceRationale: string;
    unStanding: string;
    display: DisputeDisplayGuidance;
    reviewStatus: DisputeReviewStatus;
  }

  export interface DisputedTerritoryContext {
    territoryId: string;
    territoryName: string;
    administration: string;
    dispute: DisputeClassification;
  }

  export interface CountryContext<T extends string | number = number> {
    countryCode: ISOCode;
    countryName: string;
    countryValue?: T | undefined;
    color: string;
    minValue: number;
    maxValue: number;
    prefix: string;
    suffix: string;
    dispute?: DisputeClassification | undefined;
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
    projection?: ProjectionOption;
    theme?: MapTheme;
    frame?: boolean;
    containerClassName?: string;
    regionClassName?: string;
    frameColor?: string;
    borderColor?: string;
    richInteraction?: boolean;
    zoom?: boolean | ZoomOptions;
    onZoomChange?: (state: ZoomState) => void;
    pins?: readonly MapPin[];
    pinColor?: string;
    pinTextColor?: string;
    pinOutlineColor?: string;
    labelColor?: string;
    labelHaloColor?: string;
    showDisputedTerritories?: boolean;
    disputedTerritoryColor?: string;
    disputedTerritoryTooltipFunction?: (
      context: DisputedTerritoryContext,
    ) => string;
    onDisputedTerritoryClick?: (
      context: DisputedTerritoryContext & {
        event: React.MouseEvent<SVGElement, Event>;
      },
    ) => void;
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
