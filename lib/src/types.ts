import type React from "react";
import geoData from "./countries.geo";

const isoCodes = geoData.features.map(({ I }) => I);
export type ISOCode =
  | typeof isoCodes[number]
  | Lowercase<typeof isoCodes[number]>;
export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

export interface DataItem {
  country: ISOCode;
  value: number;
}

export type Data = DataItem[];

export interface CountryContext {
  countryCode: ISOCode;
  countryName: string;
  countryValue?: number | undefined;
  color: string;
  minValue: number;
  maxValue: number;
  prefix: string;
  suffix: string;
}

export interface Props {
  data: DataItem[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  strokeOpacity?: number;
  backgroundColor?: string;
  tooltipBgColor?: string;
  tooltipTextColor?: string;
  size?: SizeOption | "responsive" | number;
  frame?: boolean;
  frameColor?: string;
  borderColor?: string;
  richInteraction?: boolean;
  /** @deprecated */
  type?: string; // Deprecated for the time being (reasoning in the README.md file)

  styleFunction?: (context: CountryContext) => React.CSSProperties;

  onClickFunction?: (
    context: CountryContext & { event: React.MouseEvent<SVGElement, Event> },
  ) => void;

  tooltipTextFunction?: (context: CountryContext) => string;

  hrefFunction?: (
    context: CountryContext,
  ) => React.ComponentProps<"a"> | string | undefined;

  textLabelFunction?: (
    width: number,
  ) => ({ label: string } & React.ComponentProps<"text">)[];
}
