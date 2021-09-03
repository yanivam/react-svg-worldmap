import * as React from 'react';
import GeoJSON from 'geojson';
import {geoMercator, geoPath} from 'd3-geo';
import geoData from './countries.geo';
import type {Props, CountryContext} from './types';
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
} from './constants';
import {useWindowWidth, responsify} from './utils';
import {drawFrame, drawRegion, drawTooltip} from './draw';

export * from './types';

export default function WorldMap(props: Props): JSX.Element {
  const {
    data,
    title,
    valuePrefix = '',
    valueSuffix = '',
    color = defaultColor,
    strokeOpacity = 0.2,
    backgroundColor = 'white',
    tooltipBgColor = 'black',
    tooltipTextColor = 'white',
    size = defaultSize,
    frame: isFrame = false,
    frameColor = 'black',
    borderColor = 'black',
    styleFunction = defaultCountryStyle(borderColor, strokeOpacity),
    tooltipTextFunction = defaultTooltip,
    onClickFunction,
    hrefFunction,
  } = props;
  const windowWidth = useWindowWidth();

  // inits
  const width = typeof size === 'number' ? size : responsify(size, windowWidth);
  const height = width * heightRatio;
  const scale = width / 960;

  const containerRef = React.createRef<SVGSVGElement>();

  // Calc min/max values and build country map for direct access
  const countryValueMap: Record<string, number> = {};
  data.forEach((entry) => {
    const {country, value} = entry;
    countryValueMap[country.toUpperCase()] = value;
  });
  const minValue = Math.min(...data.map(({value}) => value));
  const maxValue = Math.max(...data.map(({value}) => value));

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  const frame = drawFrame(isFrame, frameColor);

  const pathsAndToolstips = geoData.features.map((feature, idx) => {
    const triggerRef = React.createRef<SVGPathElement>();
    const {I: isoCode, N: countryName, C: coordinates} = feature;
    const geoFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: {NAME: countryName, ISO_A2: isoCode},
      geometry: {
        type: 'MultiPolygon',
        coordinates: coordinates as unknown as GeoJSON.Position[][][],
      },
    };
    const context: CountryContext = {
      countryCode: isoCode,
      countryValue: countryValueMap[isoCode],
      countryName,
      color,
      minValue,
      maxValue,
      prefix: valuePrefix,
      suffix: valueSuffix,
    };

    const path = drawRegion(
      {
        ref: triggerRef,
        d: pathGenerator(geoFeature)!,
        style: styleFunction(context),
        onClick: (event) => onClickFunction?.({...context, event}),
        strokeOpacity,
      },
      idx,
      hrefFunction?.(context),
    );
    const tooltip = drawTooltip(
      typeof context.countryValue === 'undefined'
        ? undefined
        : tooltipTextFunction(context),
      tooltipBgColor,
      tooltipTextColor,
      idx,
      triggerRef,
      containerRef,
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
    <figure className="worldmap__figure-container" style={{backgroundColor}}>
      {title && (
        <figcaption className="worldmap__figure-caption">{title}</figcaption>
      )}
      <svg ref={containerRef} height={`${height}px`} width={`${width}px`}>
        {frame}
        <g transform={`scale(${scale}) translate (0,240)`}>{paths}</g>
        {highlightedTooltips}
      </svg>
    </figure>
  );
}

export {WorldMap};
