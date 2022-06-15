import type { CSSProperties } from "react";
import type { SizeOption, CountryContext } from "./types";

export const defaultSize = "xl";
export const defaultColor = "#dddddd";
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
  (context: CountryContext): CSSProperties => {
    const { countryValue, minValue, maxValue, color } = context;

    let opacityLevel = 0;
    if (typeof countryValue === "number") {
      opacityLevel =
        0.2 + 0.6 * ((countryValue - minValue) / (maxValue - minValue));
    } else if (typeof countryValue === "string") {
      opacityLevel = 0.8;
    }

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

export const defaultTooltip = (context: CountryContext): string => {
  const { countryName, countryValue, prefix, suffix } = context;
  return `${countryName} ${prefix} ${countryValue!.toLocaleString()} ${suffix}`;
};
