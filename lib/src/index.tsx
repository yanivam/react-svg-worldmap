import * as React from "react";
import { useState, createRef } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import geoData from "./countries.geo.js";
import type { Props, CountryContext, DataItem } from "./types.js";
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
} from "./constants.js";
import { useWindowWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import Frame from "./components/Frame.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
// Import Tooltip from './components/Tooltip';

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  Props,
} from "./types.js";

function toValue({ value }: DataItem<string | number>): number {
  return typeof value === "string" ? 0 : value;
}

export default function WorldMap<T extends number | string>(
  props: Props<T>,
): JSX.Element {
  const {
    data,
    title,
    valuePrefix = "",
    valueSuffix = "",
    color = defaultColor,
    strokeOpacity = 0.2,
    backgroundColor = "white",
    tooltipBgColor = "black",
    tooltipTextColor = "white",
    rtl = false,
    size = defaultSize,
    frame = false,
    frameColor = "black",
    borderColor = "black",
    richInteraction = false,
    styleFunction = defaultCountryStyle(borderColor, strokeOpacity),
    tooltipTextFunction = defaultTooltip,
    onClickFunction,
    hrefFunction,
    textLabelFunction = () => [],
  } = props;
  const windowWidth = useWindowWidth();

  // Inits
  const width = typeof size === "number" ? size : responsify(size, windowWidth);
  const height = width * heightRatio;
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = createRef<SVGSVGElement>();

  // Calc min/max values and build country map for direct access
  const countryValueMap = Object.fromEntries(
    data.map(({ country, value }) => [country.toUpperCase(), value]),
  );

  const minValue = Math.min(...data.map(toValue));
  const maxValue = Math.max(...data.map(toValue));

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  const onClick = React.useCallback(
    (context: CountryContext<T>) => (event: React.MouseEvent<SVGElement>) =>
      onClickFunction?.({ ...context, event }),
    [onClickFunction],
  );

  const regions = geoData.features.map((feature) => {
    const triggerRef = createRef<SVGPathElement>();
    const { I: isoCode, N: countryName, C: coordinates } = feature;
    const geoFeature: GeoJSON.Feature = {
      type: "Feature",
      properties: { NAME: countryName, ISO_A2: isoCode },
      geometry: {
        type: "MultiPolygon",
        coordinates: coordinates as unknown as GeoJSON.Position[][][],
      },
    };
    const context: CountryContext<T> = {
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
        onClick={onClick(context)}
        strokeOpacity={strokeOpacity}
        href={hrefFunction?.(context)}
        key={countryName}
      />
    );
    const tooltip = drawTooltip(
      typeof context.countryValue === "undefined"
        ? undefined
        : tooltipTextFunction(context),
      tooltipBgColor,
      tooltipTextColor,
      rtl,
      triggerRef,
      containerRef,
    );

    return { path, highlightedTooltip: tooltip };
  });

  // Build paths
  const regionPaths = regions.map((entry) => entry.path);

  // Build tooltips
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
    <figure className="worldmap__figure-container" style={{ backgroundColor }}>
      {title && (
        <figcaption className="worldmap__figure-caption">{title}</figcaption>
      )}
      <svg
        ref={containerRef}
        height={`${height}px`}
        width={`${width}px`}
        {...(richInteraction ? eventHandlers : undefined)}>
        {frame && <Frame color={frameColor} />}
        <g
          transform={`translate(${translateX}, ${translateY}) scale(${
            (width / 960) * scale
          }) translate(0, 240)`}
          style={{ transition: "all 0.2s" }}>
          {regionPaths}
        </g>
        <g>
          {textLabelFunction(width).map((labelProps) => (
            <TextLabel {...labelProps} key={labelProps.label} />
          ))}
        </g>
        {regionTooltips}
      </svg>
    </figure>
  );
}

const regions = geoData.features.map((g) => ({ name: g.N, code: g.I }));

export { WorldMap, regions };
