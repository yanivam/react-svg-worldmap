import type React from "react";
import type { DetailLevel, DetailProvider } from "./detail/types.js";

// ISO 3166-1 alpha-2 codes for every country in the world map.
// Kept as a const tuple so that `ISOCode` is a precise string-literal union
// rather than plain `string`, giving consumers autocomplete and typo-checking.
/* prettier-ignore */
const ISO_CODES = ["FJ","TZ","EH","CA","US","KZ","UZ","PG","ID","AR","CL","CD","SO","KE","SD","TD","HT","DO","RU","BS","FK","NO","GL","TL","ZA","LS","MX","UY","BR","BO","PE","CO","PA","CR","NI","HN","SV","GT","BZ","VE","GY","SR","FR","EC","PR","JM","CU","ZW","BW","NA","SN","ML","MR","BJ","NE","NG","CM","TG","GH","CI","GN","GW","LR","SL","BF","CF","CG","GA","GQ","ZM","MW","MZ","SZ","AO","BI","IL","LB","MG","PS","GM","TN","DZ","JO","AE","QA","KW","IQ","OM","VU","KH","TH","LA","MM","VN","KP","KR","MN","IN","BD","BT","NP","PK","AF","TJ","KG","TM","IR","SY","AM","SE","BY","UA","PL","AT","HU","MD","RO","LT","LV","EE","DE","BG","GR","TR","AL","HR","CH","LU","BE","NL","PT","ES","IE","NC","SB","NZ","AU","LK","CN","TW","IT","DK","GB","IS","AZ","GE","PH","MY","BN","SI","FI","SK","CZ","ER","JP","PY","YE","SA","CY","MA","EG","LY","ET","DJ","UG","RW","BA","MK","RS","ME","XK","TT","SS"] as const;
export type ISOCode =
  | (typeof ISO_CODES)[number]
  | Lowercase<(typeof ISO_CODES)[number]>;
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

export interface RegionNameTranslations {
  [countryCode: string]: Record<string, string>;
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
  /**
   * - number: exact pixel width
   * - "responsive": fit available/container width, capped by viewport
   * - "sm" | "md" | "lg" | "xl" | "xxl": preset cap, shrinks if smaller
   */
  size?: SizeOption | "responsive" | number;
  frame?: boolean;
  /** Optional class for the wrapper div (for CSP or custom layout). */
  containerClassName?: string;
  /** Optional class for each region path (for CSP or custom styling). */
  regionClassName?: string;
  frameColor?: string;
  borderColor?: string;
  richInteraction?: boolean;

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
  detailLevel?: DetailLevel;
  detailProvider?: DetailProvider;
  regionNameTranslations?: RegionNameTranslations;
  initialDrilldownCountryCode?: ISOCode;
  showLabels?: boolean;
}
