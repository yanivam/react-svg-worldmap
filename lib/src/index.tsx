import React, {useState, createRef} from 'react';
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
import {drawTooltip} from './draw';
import Frame from './components/Frame';
import Region from './components/Region';
import TextLabel from './components/TextLabel';
// import Tooltip from './components/Tooltip';

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
    frame = false,
    frameColor = 'black',
    borderColor = 'black',
    richInteraction = false,
    styleFunction = defaultCountryStyle(borderColor, strokeOpacity),
    tooltipTextFunction = defaultTooltip,
    onClickFunction,
    hrefFunction,
    textLabelFunction = () => [],
  } = props;
  const windowWidth = useWindowWidth();

  // inits
  const width = typeof size === 'number' ? size : responsify(size, windowWidth);
  const height = width * heightRatio;
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = createRef<SVGSVGElement>();

  // Calc min/max values and build country map for direct access
  const countryValueMap = Object.fromEntries(
    data.map(({country, value}) => [country.toUpperCase(), value]),
  );
  const minValue = Math.min(...data.map(({value}) => value));
  const maxValue = Math.max(...data.map(({value}) => value));

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  const regions = geoData.features.map((feature, idx) => {
    const triggerRef = createRef<SVGPathElement>();
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

    const path = (
      <Region
        ref={triggerRef}
        d={pathGenerator(geoFeature)!}
        style={styleFunction(context)}
        onClick={(event) => onClickFunction?.({...context, event})}
        strokeOpacity={strokeOpacity}
        href={hrefFunction?.(context)}
        key={`path${idx}`}
      />
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
  const regionPaths = regions.map((entry) => entry.path);

  // build tooltips
  const regionTooltips = regions.map((entry) => entry.highlightedTooltip);

  const eventHandlers = {
    onMouseDown(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    },
    onDoubleClick(e: React.MouseEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (scale === 4) {
        setTranslateX(0);
        setTranslateY(0);
        setScale(1);
      } else {
        setTranslateX(2 * translateX - x);
        setTranslateY(2 * translateY - y);
        setScale(scale * 2);
      }
    },
  };

  // Render the SVG
  return (
    <figure className="worldmap__figure-container" style={{backgroundColor}}>
      {title && (
        <figcaption className="worldmap__figure-caption">{title}</figcaption>
      )}
      <svg
        ref={containerRef}
        height={`${height}px`}
        width={`${width}px`}
        {...(richInteraction ? eventHandlers : undefined)}
      >
        {frame && <Frame color={frameColor} />}
        <g
          transform={`translate(${translateX}, ${translateY}) scale(${
            (width / 960) * scale
          }) translate(0, 240)`}
          style={{transition: 'all 0.2s'}}
        >
          {regionPaths}
        </g>
        <g>
          {textLabelFunction(width).map((props, idx) => (
            <TextLabel {...props} key={`text_${idx}`} />
          ))}
        </g>
        {regionTooltips}
      </svg>
    </figure>
  );
}

export {WorldMap};
