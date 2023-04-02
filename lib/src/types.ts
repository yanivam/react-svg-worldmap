import type React from "react";
import geoData from "./countries.geo.js";

const isoCodes = geoData.features.map(({ I }) => I);
export type ISOCode =
  | (typeof isoCodes)[number]
  | Lowercase<(typeof isoCodes)[number]>;
export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

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
  frameColor?: string;
  borderColor?: string;
  richInteraction?: boolean;
  /** @deprecated */
  type?: string; // Deprecated for the time being (reasoning in the README.md file)

  styleFunction?: (context: CountryContext<T>) => React.CSSProperties;

  onClickFunction?: (
    context: CountryContext<T> & { event: React.MouseEvent<SVGElement, Event> },
  ) => void;

  tooltipTextFunction?: (context: CountryContext<T>) => string;

  hrefFunction?: (
    context: CountryContext<T>,
  ) => React.ComponentProps<"a"> | string | undefined;

  textLabelFunction?: (
    width: number,
  ) => ({ label: string } & React.ComponentProps<"text">)[];
}
