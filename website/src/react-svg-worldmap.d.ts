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
    detailLevel?: "countries" | "regions";
    detailProvider?: {
      supports: (countryCode: string) => boolean;
      loadRegions: (countryCode: string) => Promise<unknown>;
    };
    regionNameTranslations?: Record<string, Record<string, string>>;
    initialDrilldownCountryCode?: string;
    showLabels?: boolean;
  }

  function WorldMap<T extends string | number = number>(
    props: Props<T>,
  ): React.JSX.Element;
  export default WorldMap;
}

declare module "@react-svg-worldmap/regions/dist/index.cjs" {
  export function createRegionsDetailProvider(): {
    supports: (countryCode: string) => boolean;
    loadRegions: (countryCode: string) => Promise<unknown>;
  };
}
