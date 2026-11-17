import type { CSSProperties } from "react";
import type {
  SizeOption,
  CountryContext,
  DisputedTerritoryContext,
  MapTheme,
} from "./types.js";

export const defaultSize = "xl";
export const defaultColor = "#dddddd";
export const defaultDisputedTerritoryColor = "#d32f2f";
export const heightRatio = 3 / 4;
export const defaultPinColor = "#b91c1c";
export const defaultPinTextColor = "#1f2937";
export const defaultPinOutlineColor = "#fff";
export const defaultLabelColor = "#222";

/** The values a theme supplies. Explicit props always take precedence. */
export interface ThemeValues {
  backgroundColor: string;
  borderColor: string;
  frameColor: string;
  labelColor: string;
  labelHaloColor?: string;
  pinColor: string;
  pinTextColor: string;
  pinOutlineColor: string;
  /**
   * Fill of countries without data, and of the land drawn beneath the
   * countries. Unset for the default theme: countries without data are
   * transparent there.
   */
  landColor?: string;
  /** Keep borders one pixel wide even without zoom. */
  nonScalingStroke: boolean;
}

export const mapThemeOptions: readonly MapTheme[] = ["default", "atlas"];
export const defaultMapTheme: MapTheme = "default";

export const mapThemes: Record<MapTheme, ThemeValues> = {
  default: {
    backgroundColor: "white",
    borderColor: "black",
    frameColor: "black",
    labelColor: defaultLabelColor,
    pinColor: defaultPinColor,
    pinTextColor: defaultPinTextColor,
    pinOutlineColor: defaultPinOutlineColor,
    nonScalingStroke: false,
  },
  atlas: {
    backgroundColor: "#A0D7EB",
    borderColor: "#607d86",
    frameColor: "#607d86",
    labelColor: "#263238",
    labelHaloColor: "#F4F2F2",
    pinColor: defaultPinColor,
    pinTextColor: "#263238",
    pinOutlineColor: "#fff",
    landColor: "#F4F2F2",
    nonScalingStroke: true,
  },
};

export const sizeMap: Record<SizeOption, number> = {
  sm: 240,
  md: 336,
  lg: 480,
  xl: 640,
  xxl: 1200,
};

/** Defaults for the `zoom` prop's options. */
export const defaultZoomOptions = {
  initialScale: 1,
  minScale: 1,
  maxScale: 8,
  zoomFactor: 2,
  showControls: true,
  showCountryLabels: true,
  countryLabelMinFontSize: 12,
  countryLabelMaxFontSize: 20,
  countryLabelZoomGrowthRate: 0.35,
  showPins: true,
  detailedGeometry: true,
  detailedGeometryMinScale: 2,
  regionDetailMinScale: 4,
};

export const defaultCountryStyle =
  (stroke: string, strokeOpacity: number, noDataColor?: string) =>
  <T extends string | number>(context: CountryContext<T>): CSSProperties => {
    const { countryValue, minValue, maxValue, color } = context;

    const calculatedValue =
      typeof countryValue === "string"
        ? minValue
        : // TODO bug in TS-ESLint; report this
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          (countryValue as number | undefined);
    let opacityLevel =
      calculatedValue !== undefined
        ? 0.2 + 0.6 * ((calculatedValue - minValue) / (maxValue - minValue))
        : 0;

    // If there's only one value, the calculation would be dividing by zero.
    // We adjust it to the maximum value.
    if (Number.isNaN(opacityLevel)) opacityLevel = 0.8;

    // Themes with a land colour paint countries without data with it.
    const noData = calculatedValue === undefined && noDataColor != null;
    const style = {
      fill: noData ? noDataColor : color,
      fillOpacity: noData ? 1 : opacityLevel,
      stroke,
      strokeWidth: 1,
      strokeOpacity,
      cursor: "pointer",
    };
    return style;
  };

export const defaultTooltip = <T extends string | number>(
  context: CountryContext<T>,
): string => {
  const { countryName, countryValue, prefix, suffix } = context;
  return [countryName, prefix, countryValue!.toLocaleString(), suffix]
    .filter((part) => part !== "")
    .join(" ");
};

export const defaultDisputedTerritoryTooltip = ({
  territoryName,
  dispute,
}: DisputedTerritoryContext): string =>
  [
    `${territoryName}: ${dispute.status.replace(/-/g, " ")}`,
    dispute.recognizedSovereign &&
      `Recognized sovereign: ${dispute.recognizedSovereign}`,
    dispute.controllingPower && `Controlled by: ${dispute.controllingPower}`,
    `Parties: ${dispute.disputeParties.join(", ")}`,
  ]
    .filter(Boolean)
    .join(". ");
