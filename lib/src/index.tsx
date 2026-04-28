import * as React from "react";
import { useState, useRef, useEffect } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import topoData from "./countries.topo.js";
import type {
  Props,
  CountryContext,
  DataItem,
  ISOCode,
  ZoomState,
} from "./types.js";
import { getDisputeByCountryCode } from "./disputes.js";
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
} from "./constants.js";
import { getCountryCityMetadata } from "./countryCities.js";
import { useWindowWidth, useContainerWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import CityMarker from "./components/CityMarker.js";
import Frame from "./components/Frame.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
import ZoomControls from "./components/ZoomControls.js";
import ZoomStatus from "./components/ZoomStatus.js";
import {
  createInitialZoomState,
  panZoomState,
  resetZoomState,
  resolveZoomOptions,
  zoomAroundPoint,
} from "./zoom/state.js";
import {
  canShowCountryDetails,
  countryLabelFontSize,
  createCountryLabelCandidate,
  placeCountryLabels,
} from "./labels/placement.js";

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  Props,
  ZoomOptions,
  ZoomState,
  CountryCityMetadata,
  CountryLabelCandidate,
  DisputeTier,
  DisputeStatus,
  DisputeReviewStatus,
  DisputeDisplayGuidance,
  DisputeClassification,
} from "./types.js";
export {
  disputedTerritories,
  disputeIds,
  disputesByCountryCode,
  getDisputeByCountryCode,
  getDisputeById,
} from "./disputes.js";
export type { DisputeId } from "./disputes.js";

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
    zoom,
    onZoomChange,
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

  // Inits
  const width =
    typeof size === "number" ? size : responsify(size, effectiveWidth);
  const height = width * heightRatio;
  const zoomOptions = React.useMemo(() => resolveZoomOptions(zoom), [zoom]);
  const [zoomState, setZoomState] = useState(() =>
    createInitialZoomState(zoomOptions),
  );
  const [zoomStatus, setZoomStatus] = useState("Map zoom reset");
  const dragPoint = useRef<[number, number] | null>(null);
  const scale = zoomState.scale;
  const [translateX, translateY] = zoomState.translate;

  useEffect(() => {
    onZoomChange?.(zoomState);
  }, [onZoomChange, zoomState]);

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
  const countryLabels = React.useMemo(() => {
    if (!zoomOptions.enabled || !zoomOptions.showCountryLabels) return [];

    return placeCountryLabels(
      geoFeatures.map((geoFeature) =>
        createCountryLabelCandidate(pathGenerator, geoFeature, scale),
      ),
    );
  }, [
    pathGenerator,
    scale,
    zoomOptions.enabled,
    zoomOptions.showCountryLabels,
  ]);

  const regionElements = geoFeatures.map((geoFeature, i) => {
    const triggerRef = triggerRefs.current[i]!;
    const { N: countryName, I: isoCode } = geoFeature.properties;
    const context: CountryContext<T> = {
      countryCode: isoCode as ISOCode,
      countryValue: countryValueMap[isoCode],
      countryName,
      dispute: getDisputeByCountryCode(isoCode as ISOCode),
      color,
      minValue,
      maxValue,
      prefix: valuePrefix,
      suffix: valueSuffix,
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

  // Build paths
  const regionPaths = regionElements.map((entry) => entry.path);

  // Build tooltips
  const regionTooltips = regionElements.map(
    (entry) => entry.highlightedTooltip,
  );

  const updateZoomState = (nextState: ZoomState, message: string): void => {
    setZoomState(nextState);
    setZoomStatus(message);
  };

  const zoomIn = (): void => {
    updateZoomState(
      zoomAroundPoint(
        zoomState,
        [width / 2, height / 2],
        zoomOptions.zoomFactor,
        zoomOptions.minScale,
      ),
      "Map zoomed in",
    );
  };

  const zoomOut = (): void => {
    updateZoomState(
      zoomAroundPoint(
        zoomState,
        [width / 2, height / 2],
        1 / zoomOptions.zoomFactor,
        zoomOptions.minScale,
      ),
      "Map zoomed out",
    );
  };

  const resetZoom = (): void => {
    updateZoomState(resetZoomState(zoomOptions), "Map zoom reset");
  };

  const eventHandlers = {
    onMouseDown(e: React.MouseEvent) {
      // Only suppress default on multi-click (≥2) to prevent text-selection
      // during double-click zoom. Single clicks must still move focus normally
      // so keyboard users aren't locked out (WCAG 2.1.1).
      if (e.detail > 1) e.preventDefault();
      e.stopPropagation();
      if (zoomOptions.enabled) dragPoint.current = [e.clientX, e.clientY];
    },
    onMouseMove(e: React.MouseEvent) {
      if (!zoomOptions.enabled || dragPoint.current == null) return;

      const nextPoint: [number, number] = [e.clientX, e.clientY];
      const previousPoint = dragPoint.current;
      dragPoint.current = nextPoint;
      updateZoomState(
        panZoomState(zoomState, [
          nextPoint[0] - previousPoint[0],
          nextPoint[1] - previousPoint[1],
        ]),
        "Map focus changed",
      );
    },
    onMouseUp() {
      dragPoint.current = null;
    },
    onMouseLeave() {
      dragPoint.current = null;
    },
    onDoubleClick(e: React.MouseEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (zoomOptions.enabled) {
        updateZoomState(
          zoomAroundPoint(
            zoomState,
            [x, y],
            zoomOptions.zoomFactor,
            zoomOptions.minScale,
          ),
          "Map zoomed in",
        );
      } else if (scale === 4) {
        resetZoom();
      } else {
        updateZoomState(
          {
            scale: scale * 2,
            translate: [2 * translateX - x, 2 * translateY - y],
          },
          "Map zoomed in",
        );
      }
    },
    // Keyboard equivalents for double-click zoom (WCAG 2.1.1).
    // + / =  → zoom in to the centre of the map
    // - / _  → reset zoom
    onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (zoomOptions.enabled) {
          zoomIn();
        } else if (scale < 4) {
          updateZoomState(
            {
              scale: scale * 2,
              translate: [
                2 * translateX - width / 2,
                2 * translateY - height / 2,
              ],
            },
            "Map zoomed in",
          );
        }
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (zoomOptions.enabled) zoomOut();
        else resetZoom();
      } else if (e.key === "Escape") {
        e.preventDefault();
        resetZoom();
      }
    },
  };
  const enableMapInteractions = richInteraction || zoomOptions.enabled;
  const labelFontSize = countryLabelFontSize / scale;

  // Render the SVG (wrapper div for ResizeObserver container sizing)
  return (
    <div
      ref={setWrapperEl}
      className={containerClassName ?? "worldmap__wrapper"}
      style={{ width: "100%", minHeight: 0 }}>
      <figure
        className="worldmap__figure-container"
        style={{ backgroundColor }}>
        {title && (
          <figcaption className="worldmap__figure-caption">{title}</figcaption>
        )}
        {zoomOptions.enabled && zoomOptions.showControls && (
          <ZoomControls
            // eslint-disable-next-line react/jsx-no-bind -- Controls need component-local zoom actions.
            onZoomIn={zoomIn}
            // eslint-disable-next-line react/jsx-no-bind -- Controls need component-local zoom actions.
            onZoomOut={zoomOut}
            // eslint-disable-next-line react/jsx-no-bind -- Controls need component-local zoom actions.
            onReset={resetZoom}
          />
        )}
        {zoomOptions.enabled && <ZoomStatus message={zoomStatus} />}
        <svg
          ref={containerRef}
          // A direct aria-label avoids SSR hydration mismatches from generated
          // ids while still giving the SVG an accessible name (WCAG 1.1.1).
          role="img"
          aria-label={title ?? "World map"}
          // Make the SVG focusable when map interactions are on so keyboard
          // users can reach the zoom controls (WCAG 2.1.1).
          tabIndex={enableMapInteractions ? 0 : undefined}
          aria-keyshortcuts={enableMapInteractions ? "+ -" : undefined}
          height={`${height}px`}
          width={`${width}px`}
          {...(enableMapInteractions ? eventHandlers : undefined)}>
          {frame && <Frame color={frameColor} />}
          <g
            transform={`translate(${translateX}, ${translateY}) scale(${
              (width / 960) * scale
            }) translate(0, 240)`}
            style={{ transition: "all 0.2s" }}>
            {regionPaths}
            {countryLabels.map((label) => {
              const cityMetadata = getCountryCityMetadata(label.countryCode);
              const showDetails =
                zoomOptions.showCountryDetails &&
                cityMetadata != null &&
                canShowCountryDetails(label, scale);
              const capitalPoint = showDetails
                ? projection([...cityMetadata.capitalLocation])
                : null;
              const largestCityPoint = showDetails
                ? projection([...cityMetadata.largestCityLocation])
                : null;
              const largestCityDuplicatesCapital =
                showDetails &&
                cityMetadata.capitalCity === cityMetadata.largestCity &&
                cityMetadata.capitalLocation[0] ===
                  cityMetadata.largestCityLocation[0] &&
                cityMetadata.capitalLocation[1] ===
                  cityMetadata.largestCityLocation[1];

              return (
                <React.Fragment key={`zoom-label-${label.countryCode}`}>
                  <TextLabel
                    label={label.label}
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    fontSize={labelFontSize}
                    fill="#222"
                    pointerEvents="none"
                  />
                  {showDetails && capitalPoint && (
                    <CityMarker
                      countryCode={label.countryCode}
                      kind="capital"
                      name={cityMetadata.capitalCity}
                      scale={scale}
                      x={capitalPoint[0]}
                      y={capitalPoint[1]}
                    />
                  )}
                  {showDetails &&
                    largestCityPoint &&
                    !largestCityDuplicatesCapital && (
                      <CityMarker
                        countryCode={label.countryCode}
                        kind="largest"
                        name={cityMetadata.largestCity}
                        scale={scale}
                        x={largestCityPoint[0]}
                        y={largestCityPoint[1]}
                      />
                    )}
                </React.Fragment>
              );
            })}
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
