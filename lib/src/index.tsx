import * as React from 'react';
import GeoJSON from 'geojson';
import {geoMercator, geoPath} from 'd3-geo';
import {PathTooltip} from 'react-path-tooltip';
import geoData from './countries.geo';

type SizeOption = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'responsive';

export interface WorldMapData {
  country: string;
  value: number;
}

export interface CountryContext {
  country: string;
  countryValue: number;
  color: string;
  minValue: number;
  maxValue: number;
}

export interface Props {
  data: WorldMapData[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  strokeOpacity?: number;
  backgroundColor?: string;
  tooltipBgColor?: string;
  tooltipTextColor?: string;
  size?: SizeOption;
  frame?: boolean;
  frameColor?: string;
  /** @deprecated */
  type?: string; // depracated for the time being (reasoning in the README.md file)

  styleFunction?: (context: CountryContext) => React.CSSProperties;

  onClickFunction?: (
    event: React.MouseEvent<SVGElement, Event>,
    countryName: string,
    isoCode: string,
    value: string,
    prefix: string,
    suffix: string,
  ) => void;

  tooltipTextFunction?: (
    countryName: string,
    isoCode: string,
    value: string,
    prefix: string,
    suffix: string,
  ) => string;

  hrefFunction?: (
    countryName: string,
    isoCode: string,
    value: string,
    prefix: string,
    suffix: string,
  ) => string | undefined;
  borderColor?: string;
}

const CSizes: Record<SizeOption, number> = {
  sm: 240,
  md: 336,
  lg: 480,
  xl: 640,
  xxl: 1200,
  responsive: -1,
};

const CDefaultColor = '#dddddd';
const CHeightRatio = 3 / 4;

export default function WorldMap(props: Props): JSX.Element {
  const {
    data,
    title,
    valuePrefix = '',
    valueSuffix = '',
    color = CDefaultColor,
    strokeOpacity = 0.2,
    backgroundColor = 'white',
    tooltipBgColor = 'black',
    tooltipTextColor = 'white',
    size = 'sm',
    frame: isFrame = false,
    frameColor = 'black',
    styleFunction,
    onClickFunction,
    tooltipTextFunction,
    hrefFunction,
    borderColor = 'black',
  } = props;
  // calculate window width
  const updateWindowWidth = () => {
    const [width, setWidth] = React.useState(0);
    React.useLayoutEffect(() => {
      const updateWidth = () => {
        setWidth(window.innerWidth);
      };
      window.addEventListener('resize', updateWidth);
      updateWidth();
      return () => window.removeEventListener('resize', updateWidth);
    }, []);
    return width;
  };
  const windowWidth = updateWindowWidth();

  // adjust responsive size
  const responsify = (sz: SizeOption) => {
    let realSize = sz;
    if (sz === 'responsive') {
      return Math.min(window.innerHeight, window.innerWidth) * 0.75;
    }
    while (CSizes[realSize] > windowWidth) {
      if (realSize === 'sm') {
        return CSizes.sm;
      }
      if (realSize === 'md') {
        realSize = 'sm';
      } else if (realSize === 'lg') {
        realSize = 'md';
      } else if (realSize === 'xl') {
        realSize = 'lg';
      } else if (realSize === 'xxl') {
        realSize = 'xl';
      }
    }
    return CSizes[realSize];
  };

  // inits
  const width = responsify(size);
  const height = responsify(size) * CHeightRatio;
  const frame = isFrame ? (
    <rect
      x={0}
      y={0}
      width={'100%'}
      height={'100%'}
      stroke={frameColor}
      fill="none"
    />
  ) : (
    <path></path>
  );
  const scale = width / 960;
  const transformPaths = `scale(${scale.toString()}) translate (0,240)`;

  const containerRef = React.createRef<SVGSVGElement>();

  const defaultCountryStyle = (context: CountryContext) => {
    const contextCountryValue = context.countryValue ? context.countryValue : 0;
    const opacityLevel =
      0.2 +
      0.6 *
        ((contextCountryValue - context.minValue) /
          (context.maxValue - context.minValue));
    const style = {
      fill: context.color,
      fillOpacity:
        contextCountryValue === 0 ? contextCountryValue : opacityLevel,
      stroke: borderColor,
      strokeWidth: 1,
      strokeOpacity,
      cursor: 'pointer',
    };
    return style;
  };

  // Calc min/max values and build country map for direct access
  const countryValueMap: Record<string, number> = {};
  data.forEach((entry) => {
    const {country, value} = entry;
    countryValueMap[country.toUpperCase()] = value;
  });
  const min = Math.min(...data.map(({value}) => value));
  const max = Math.max(...data.map(({value}) => value));

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  const pathsAndToolstips = geoData.features.map((feature, idx) => {
    const triggerRef = React.createRef<SVGPathElement>();
    const isoCode = feature.I;
    const countryName = feature.N;
    const geoFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: {NAME: countryName, ISO_A2: isoCode},
      geometry: {
        type: 'MultiPolygon',
        coordinates: feature.C as GeoJSON.Position[][][],
      },
    };
    const isHighlight = typeof countryValueMap[isoCode] !== 'undefined';
    const style = (
      styleFunction && isHighlight ? styleFunction : defaultCountryStyle
    )({
      country: isoCode,
      countryValue: countryValueMap[isoCode],
      color,
      minValue: min,
      maxValue: max,
    });

    const href = hrefFunction?.(
      countryName,
      isoCode,
      countryValueMap[isoCode]?.toString(),
      valuePrefix,
      valueSuffix,
    );

    let path = (
      <path
        key={`path${idx}`}
        ref={triggerRef}
        d={pathGenerator(geoFeature as GeoJSON.Feature) as string}
        style={style}
        onClick={(e) => {
          if (onClickFunction && countryValueMap[isoCode]) {
            onClickFunction(
              e,
              countryName,
              isoCode,
              countryValueMap[isoCode].toString(),
              valuePrefix,
              valueSuffix,
            );
          }
        }}
        onMouseOver={(event) => {
          event.currentTarget.style.strokeWidth = '2';
          event.currentTarget.style.strokeOpacity = '0.5';
        }}
        onMouseOut={(event) => {
          event.currentTarget.style.strokeWidth = '1';
          event.currentTarget.style.strokeOpacity = `${strokeOpacity}`;
        }}
      />
    );

    if (href) {
      path = <a href={href}>{path}</a>;
    }

    let tip = '';
    if (tooltipTextFunction && countryValueMap[isoCode]) {
      tip = tooltipTextFunction(
        countryName,
        isoCode,
        countryValueMap[isoCode].toString(),
        valuePrefix || '',
        valueSuffix || '',
      );
    } else if (countryValueMap[isoCode]) {
      tip = `${countryName} ${valuePrefix} ${countryValueMap[
        isoCode
      ].toLocaleString()} ${valueSuffix}`;
    }

    const tooltip = !isHighlight ? (
      <g pointerEvents={'none'} key={`path${idx}xyz`}></g>
    ) : (
      <PathTooltip
        fontSize={12}
        bgColor={tooltipBgColor}
        textColor={tooltipTextColor}
        key={`path_${idx}_xyz`}
        pathRef={triggerRef}
        svgRef={containerRef}
        tip={tip}
      />
    );

    return {path, highlightedTooltip: tooltip};
  });

  // build paths
  const paths = pathsAndToolstips.map((entry) => entry.path);

  // build tooltips
  const highlightedTooltips = pathsAndToolstips.map(
    (entry) => entry.highlightedTooltip,
  );

  // Render the SVG
  return (
    <div
      style={{
        backgroundColor,
        height: 'auto',
        width: 'auto',
        padding: '0px',
        margin: '0px',
      }}>
      {title && <p>{title}</p>}
      <svg ref={containerRef} height={`${height}px`} width={`${width}px`}>
        {frame}
        <g transform={transformPaths}>{paths}</g>
        {highlightedTooltips}
      </svg>
    </div>
  );
}

export {WorldMap};
