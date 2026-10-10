/**
 * Type shim so the website can import the ESM lib without TS1479 (CJS/ESM)
 * when using moduleResolution NodeNext. Types mirrored from the lib.
 */
declare module "react-svg-worldmap" {
  import type React from "react";

  export type ISOCode = string;
  export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

  export interface DataItem<T extends string | number = number> {
    country: ISOCode;
    value: T;
  }

  export type Data<T extends string | number = number> = DataItem<T>[];

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
    frame?: boolean;
    containerClassName?: string;
    regionClassName?: string;
    frameColor?: string;
    borderColor?: string;
    richInteraction?: boolean;
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
