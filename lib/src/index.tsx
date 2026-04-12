import * as React from "react";
import { useState, useRef } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import topoData from "./countries.topo.js";
import type { Props, CountryContext, DataItem, ISOCode } from "./types.js";
import { getEffectiveDetailLevel } from "./detail/getEffectiveDetailLevel.js";
import { useDetailCollection } from "./detail/useDetailCollection.js";
import { useDrilldownState } from "./detail/useDrilldownState.js";
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
} from "./constants.js";
import { useWindowWidth, useContainerWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import Frame from "./components/Frame.js";
import LiveAnnouncer from "./components/LiveAnnouncer.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
import VisibleRegionList from "./components/VisibleRegionList.js";
import ZoomControls from "./components/ZoomControls.js";

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  RegionNameTranslations,
  Props,
} from "./types.js";
export type { DetailLevel, DetailProvider } from "./detail/types.js";

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
    styleFunction: styleFunctionProp,
    tooltipTextFunction = defaultTooltip,
    onClickFunction,
    hrefFunction,
    textLabelFunction = () => [],
    containerClassName,
    regionClassName,
    detailLevel = "countries",
    detailProvider,
    regionNameTranslations,
  } = props;
  const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const containerWidth = useContainerWidth(wrapperEl);
  const windowWidth = useWindowWidth();
  const effectiveWidth = containerWidth ?? windowWidth;

  const defaultStyle = React.useMemo(
    () => defaultCountryStyle(borderColor, strokeOpacity),
    [borderColor, strokeOpacity],
  );
  const styleFunction = styleFunctionProp ?? defaultStyle;
  const effectiveDetailLevel = getEffectiveDetailLevel(
    detailLevel,
    detailProvider,
  );
  const drilldown = useDrilldownState();
  const detailResult = useDetailCollection(
    drilldown.activeCountryCode,
    detailProvider,
    effectiveDetailLevel === "regions",
  );
  void regionNameTranslations;
  const visibleRegions =
    detailResult.status === "ready" && detailResult.collection
      ? detailResult.collection.regions
      : [];
  const firstDataCountryCode =
    data.length > 0 ? (data[0]!.country.toUpperCase() as ISOCode) : null;
  const firstDataCountryName =
    firstDataCountryCode == null
      ? null
      : geoFeatures.find(
          (feature) => feature.properties.I === firstDataCountryCode,
        )?.properties.N ?? null;

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
    };

    // Resolve href and interactivity once so they can be used for both the
    // Region props and to decide whether keyboard / ARIA support is needed.
    const resolvedHref = hrefFunction?.(context);
    const canDrillDown = effectiveDetailLevel === "regions";
    const isInteractive = Boolean(
      onClickFunction ?? resolvedHref ?? canDrillDown,
    );
    // Tooltip text doubles as the SVG <title> to give a text alternative for
    // colour-coded data values (WCAG 1.1.1, 1.4.1).
    const tooltipContent =
      typeof context.countryValue === "undefined"
        ? undefined
        : tooltipTextFunction(context);
    const svgTitle = tooltipContent ?? countryName;
    const handleRegionClick = (event: React.MouseEvent<SVGPathElement>) => {
      if (canDrillDown) 
        drilldown.enterCountry(isoCode as ISOCode, countryName);
      

      onClickFunction?.({ ...context, event });
    };

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
  const handleZoomIn = () => {
    if (drilldown.activeCountryCode && drilldown.activeCountryName) {
      drilldown.enterCountry(
        drilldown.activeCountryCode,
        drilldown.activeCountryName,
      );
      return;
    }

    if (firstDataCountryCode && firstDataCountryName) 
      drilldown.enterCountry(firstDataCountryCode, firstDataCountryName);
    
  };
  const handleZoomReset = () => {
    drilldown.reset();
  };
  const liveAnnouncementMessage =
    drilldown.activeCountryName == null
      ? "Showing world map"
      : `Zoomed into ${drilldown.activeCountryName}`;
  const handleVisibleRegionSelect = () => {};

  // Render the SVG (wrapper div for ResizeObserver container sizing)
  return (
    <div
      ref={setWrapperEl}
      className={containerClassName ?? "worldmap__wrapper"}
      style={{ width: "100%", minHeight: 0 }}>
      {effectiveDetailLevel === "regions" && (
        <>
          {/* eslint-disable react/jsx-no-bind -- Stable local handlers are used for task 5 controls. */}
          <ZoomControls
            canDrillIn
            canGoBack={drilldown.canGoBack}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomReset}
            onBack={handleZoomReset}
            onReset={handleZoomReset}
          />
          <LiveAnnouncer message={liveAnnouncementMessage} />
          <VisibleRegionList
            regions={visibleRegions}
            onSelect={handleVisibleRegionSelect}
          />
          {/* eslint-enable react/jsx-no-bind */}
        </>
      )}
      <figure
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
          </g>
          <g>
            {textLabelFunction(width).map((labelProps) => (
              <TextLabel {...labelProps} key={labelProps.label} />
            ))}
          </g>
          {regionTooltips}
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
