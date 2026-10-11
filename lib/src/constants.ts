import type { CSSProperties } from "react";
import type {
  SizeOption,
  CountryContext,
  DisputedTerritoryContext,
} from "./types.js";

export const defaultSize = "xl";
export const defaultColor = "#dddddd";
export const defaultDisputedTerritoryColor = "#d32f2f";
export const heightRatio = 3 / 4;
export const sizeMap: Record<SizeOption, number> = {
  sm: 240,
  md: 336,
  lg: 480,
  xl: 640,
  xxl: 1200,
};

export const defaultCountryStyle =
  (stroke: string, strokeOpacity: number) =>
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

    const style = {
      fill: color,
      fillOpacity: opacityLevel,
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
