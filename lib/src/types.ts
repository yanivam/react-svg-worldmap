import type {ComponentProps} from 'react';
import geoData from './countries.geo';

const isoCodes = geoData.features.map(({I}) => I);
export type ISOCode =
  | typeof isoCodes[number]
  | Lowercase<typeof isoCodes[number]>;
export type SizeOption = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface DataItem {
  country: ISOCode;
  value: number;
}

export type Data = DataItem[];

export interface CountryContext {
  countryCode: ISOCode;
  countryName: string;
  countryValue?: number;
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
  size?: SizeOption | 'responsive' | number;
  frame?: boolean;
  frameColor?: string;
  borderColor?: string;
  /** @deprecated */
  type?: string; // depracated for the time being (reasoning in the README.md file)

  styleFunction?: (context: CountryContext) => React.CSSProperties;

  onClickFunction?: (
    context: CountryContext & {event: React.MouseEvent<SVGElement, Event>},
  ) => void;

  tooltipTextFunction?: (context: CountryContext) => string;

  hrefFunction?: (
    context: CountryContext,
  ) => ComponentProps<'a'> | string | undefined;

  textLabelFunction?: (width: number) => ({label: string} & ComponentProps<'text'>)[];
}
