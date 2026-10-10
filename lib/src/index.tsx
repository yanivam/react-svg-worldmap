import * as React from "react";
import { useState, useRef } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import topoData from "./countries.topo.js";
import type {
  Props,
  CountryContext,
  DataItem,
  DisputedTerritoryContext,
  ISOCode,
} from "./types.js";
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
  defaultDisputedTerritoryColor,
  defaultDisputedTerritoryTooltip,
} from "./constants.js";
import { useWindowWidth, useContainerWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import Frame from "./components/Frame.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
import { disputedTerritories, getDisputeByCountryCode } from "./disputes.js";
import { disputedTerritoryFeatures } from "./disputedTerritoryAreas.js";

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  Props,
  DisputeTier,
  DisputeStatus,
  DisputeReviewStatus,
  DisputeBorderStyle,
  DisputeLabelStrategy,
  DisputeDisplayGuidance,
  DisputeClassification,
  DisputedTerritoryContext,
} from "./types.js";
export {
  disputedTerritories,
  disputeIds,
  disputesByCountryCode,
  getDisputeByCountryCode,
  getDisputeById,
} from "./disputes.js";
export type { DisputeId } from "./disputes.js";
export { disputedTerritoryAreas } from "./disputedTerritoryAreas.js";
export type { DisputedTerritoryArea } from "./disputedTerritoryAreas.js";

// Decode the TopoJSON topology once at module load time.
// `feature()` returns a GeoJSON FeatureCollection; each feature's
// properties carries { N: countryName, I: isoCode } as set during encoding.
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
const geoFeatures = (
  topoFeature(
    topoData,
    topoData.objects.countries,
  ) as unknown as GeoJSON.FeatureCollection
).features as Array<GeoJSON.Feature & { properties: { N: string; I: string } }>;
/* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

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
    showDisputedTerritories = false,
    disputedTerritoryColor = defaultDisputedTerritoryColor,
    disputedTerritoryTooltipFunction = defaultDisputedTerritoryTooltip,
    onDisputedTerritoryClick,
    styleFunction: styleFunctionProp,
    tooltipTextFunction = defaultTooltip,
    onClickFunction,
    hrefFunction,
    textLabelFunction = () => [],
    containerClassName,
    regionClassName,
  } = props;
  const [figureEl, setFigureEl] = useState<HTMLElement | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const containerWidth = useContainerWidth(figureEl);
  const windowWidth = useWindowWidth();
  const effectiveWidth = containerWidth ?? windowWidth;

  const defaultStyle = React.useMemo(
    () => defaultCountryStyle(borderColor, strokeOpacity),
    [borderColor, strokeOpacity],
  );
  const styleFunction = styleFunctionProp ?? defaultStyle;

  // Inits
  const width =
    typeof size === "number" ? size : responsify(size, effectiveWidth);
  const height = width * heightRatio;
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Stable refs per region for tooltips (avoids ref identity churn)
  const triggerRefs = useRef<Array<{ current: SVGPathElement | null }>>([]);
  if (triggerRefs.current.length !== geoFeatures.length) {
    triggerRefs.current = geoFeatures.map(
      (_, i) => triggerRefs.current[i] ?? { current: null },
    );
  }

  const territoryRefs = useRef<Array<{ current: SVGPathElement | null }>>([]);
  if (territoryRefs.current.length !== disputedTerritoryFeatures.length) {
    territoryRefs.current = disputedTerritoryFeatures.map(
      (_, i) => territoryRefs.current[i] ?? { current: null },
    );
  }

  // Calc min/max values and build country map for direct access
  const countryValueMap = Object.fromEntries(
    data.map(({ country, value }) => [country.toUpperCase(), value]),
  );

  const numericValues = data.map(toValue);
  const minValue = numericValues.length > 0 ? Math.min(...numericValues) : 0;
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 0;

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  const regionElements = geoFeatures.map((geoFeature, i) => {
    const triggerRef = triggerRefs.current[i]!;
    const { N: countryName, I: isoCode } = geoFeature.properties;
    const context: CountryContext<T> = {
      countryCode: isoCode as ISOCode,
      countryValue: countryValueMap[isoCode],
      countryName,
      color,
      minValue,
      maxValue,
      prefix: valuePrefix,
      suffix: valueSuffix,
      dispute: getDisputeByCountryCode(isoCode as ISOCode),
    };

    // Resolve href and interactivity once so they can be used for both the
    // Region props and to decide whether keyboard / ARIA support is needed.
    const resolvedHref = hrefFunction?.(context);
    const isInteractive = Boolean(onClickFunction ?? resolvedHref);
    // Tooltip text doubles as the SVG <title> to give a text alternative for
    // colour-coded data values (WCAG 1.1.1, 1.4.1).
    const tooltipContent =
      typeof context.countryValue === "undefined"
        ? undefined
        : tooltipTextFunction(context);
    const svgTitle = tooltipContent ?? countryName;
    const handleRegionClick =
      onClickFunction == null
        ? undefined
        : (event: React.MouseEvent<SVGPathElement>) =>
            onClickFunction({ ...context, event });

    const path = (
      <Region
        ref={triggerRef}
        d={pathGenerator(geoFeature)!}
        style={styleFunction(context)}
        // eslint-disable-next-line react/jsx-no-bind -- Region expects a callback prop.
        onClick={handleRegionClick}
        strokeOpacity={strokeOpacity}
        href={resolvedHref}
        key={countryName}
        countryName={countryName}
        svgTitle={svgTitle}
        isInteractive={isInteractive}
        {...(regionClassName != null ? { regionClassName } : {})}
      />
    );
    const tooltip = (
      <React.Fragment key={`tooltip-${isoCode}`}>
        {drawTooltip(
          tooltipContent,
          tooltipBgColor,
          tooltipTextColor,
          rtl,
          triggerRef,
          containerRef,
        )}
      </React.Fragment>
    );

    return { path, highlightedTooltip: tooltip };
  });

  // Opt-in overlay: one shape per disputed territory, drawn above the
  // countries so that only the territory itself is highlighted.
  const territoryElements = showDisputedTerritories
    ? disputedTerritoryFeatures.map((territoryFeature, i) => {
        const triggerRef = territoryRefs.current[i]!;
        const { id, d, n, a } = territoryFeature.properties;
        const context: DisputedTerritoryContext = {
          territoryId: id,
          territoryName: n,
          administration: a,
          dispute: disputedTerritories[d],
        };
        const tooltipContent = disputedTerritoryTooltipFunction(context);
        const handleTerritoryClick =
          onDisputedTerritoryClick == null
            ? undefined
            : (event: React.MouseEvent<SVGPathElement>) =>
                onDisputedTerritoryClick({ ...context, event });
        const dashed = context.dispute.display.borderStyle === "dashed";

        return {
          path: (
            <Region
              ref={triggerRef}
              d={pathGenerator(territoryFeature)!}
              style={{
                fill: disputedTerritoryColor,
                fillOpacity: 0.5,
                stroke: disputedTerritoryColor,
                strokeWidth: 0.75,
                strokeDasharray: dashed ? "2 1" : undefined,
                cursor: "pointer",
              }}
              // eslint-disable-next-line react/jsx-no-bind -- Region expects a callback prop.
              onClick={handleTerritoryClick}
              strokeOpacity={1}
              key={id}
              countryName={n}
              svgTitle={tooltipContent}
              isInteractive={handleTerritoryClick != null}
              data-disputed-territory={id}
            />
          ),
          tooltip: (
            <React.Fragment key={`tooltip-territory-${id}`}>
              {drawTooltip(
                tooltipContent,
                tooltipBgColor,
                tooltipTextColor,
                rtl,
                triggerRef,
                containerRef,
              )}
            </React.Fragment>
          ),
        };
      })
    : [];

  // Build paths
  const regionPaths = regionElements.map((entry) => entry.path);

  // Build tooltips
  const regionTooltips = regionElements.map(
    (entry) => entry.highlightedTooltip,
  );

  const eventHandlers = {
    onMouseDown(e: React.MouseEvent) {
      // Only suppress default on multi-click (≥2) to prevent text-selection
      // during double-click zoom. Single clicks must still move focus normally
      // so keyboard users aren't locked out (WCAG 2.1.1).
      if (e.detail > 1) e.preventDefault();
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
    // Keyboard equivalents for double-click zoom (WCAG 2.1.1).
    // + / =  → zoom in to the centre of the map
    // - / _  → reset zoom
    onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (scale < 4) {
          setTranslateX(2 * translateX - width / 2);
          setTranslateY(2 * translateY - height / 2);
          setScale(scale * 2);
        }
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setTranslateX(0);
        setTranslateY(0);
        setScale(1);
      }
    },
  };

  // Render the SVG. The figure is measured rather than the wrapper so the
  // figure's default (or user-styled) margins don't make the SVG overflow.
  return (
    <div
      className={containerClassName ?? "worldmap__wrapper"}
      style={{ width: "100%", minHeight: 0 }}>
      <figure
        ref={setFigureEl}
        className="worldmap__figure-container"
        style={{ backgroundColor }}>
        {title && (
          <figcaption className="worldmap__figure-caption">{title}</figcaption>
        )}
        <svg
          ref={containerRef}
          // A direct aria-label avoids SSR hydration mismatches from generated
          // ids while still giving the SVG an accessible name (WCAG 1.1.1).
          role="img"
          aria-label={title ?? "World map"}
          // Make the SVG focusable when richInteraction is on so keyboard
          // users can reach the zoom controls (WCAG 2.1.1).
          tabIndex={richInteraction ? 0 : undefined}
          aria-keyshortcuts={richInteraction ? "+ -" : undefined}
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
            {showDisputedTerritories && (
              <g className="worldmap__disputed-territories">
                {territoryElements.map((entry) => entry.path)}
              </g>
            )}
          </g>
          <g>
            {textLabelFunction(width).map((labelProps) => (
              <TextLabel {...labelProps} key={labelProps.label} />
            ))}
          </g>
          {regionTooltips}
          {territoryElements.map((entry) => entry.tooltip)}
        </svg>
      </figure>
    </div>
  );
}

const regions = geoFeatures.map((f) => ({
  name: f.properties.N,
  code: f.properties.I,
}));

export { WorldMap, regions };
