import * as React from "react";
import { useState, useRef } from "react";
import type GeoJSON from "geojson";
import { geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import topoData from "./countries.topo.js";
import type {
  Props,
  CountryContext,
  DataItem,
  DisputedTerritoryContext,
  ISOCode,
  ProjectionOption,
} from "./types.js";
import { mapRenderingLayerOrder } from "./types.js";
import {
  defaultColor,
  defaultSize,
  defaultCountryStyle,
  defaultTooltip,
  defaultDisputedTerritoryColor,
  defaultDisputedTerritoryTooltip,
  defaultLabelColor,
  defaultPinColor,
  defaultPinOutlineColor,
  defaultPinTextColor,
} from "./constants.js";
import { useWindowWidth, useContainerWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import Frame from "./components/Frame.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
import PinMarker from "./components/PinMarker.js";
import ZoomControls from "./components/ZoomControls.js";
import ZoomStatus from "./components/ZoomStatus.js";
import { useZoom } from "./zoom/useZoom.js";
import { projectMapPins } from "./pins/mapPins.js";
import {
  createCountryLabelCandidateFromAnchor,
  measureCountryLabelAnchor,
  placeCountryLabels,
  resolveCountryLabelMapFontSize,
} from "./labels/placement.js";
import type { CountryLabelAnchor } from "./labels/placement.js";
import { disputedTerritories, getDisputeByCountryCode } from "./disputes.js";
import { disputedTerritoryFeatures } from "./disputedTerritoryAreas.js";
import {
  createProjection,
  defaultProjection,
  projectionLayouts,
  projectionOptions,
} from "./projections.js";

export type {
  ISOCode,
  SizeOption,
  ProjectionOption,
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
  MapRenderingLayerId,
  ZoomOptions,
  ZoomState,
  MapPin,
  CountryLabelCandidate,
} from "./types.js";
export { mapRenderingLayers, mapRenderingLayerOrder } from "./types.js";
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
export { projectionOptions } from "./projections.js";

// Decode the TopoJSON topology once at module load time.
// `feature()` returns a GeoJSON FeatureCollection; each feature's
// properties carries { N: countryName, I: isoCode } as set during encoding.
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
const geoCollection = topoFeature(
  topoData,
  topoData.objects.countries,
) as unknown as GeoJSON.FeatureCollection;
/* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
const geoFeatures = geoCollection.features as Array<
  GeoJSON.Feature & { properties: { N: string; I: string } }
>;

// One projection and path generator per projection option, built on first
// use. The projections never change between renders.
const projections = new Map<
  ProjectionOption,
  {
    projection: ReturnType<typeof createProjection>;
    pathGenerator: ReturnType<typeof geoPath>;
  }
>();
function getProjection(option: ProjectionOption) {
  let entry = projections.get(option);
  if (!entry) {
    const projection = createProjection(option);
    entry = { projection, pathGenerator: geoPath().projection(projection) };
    projections.set(option, entry);
  }
  return entry;
}

// Where each country's label would go, measured once per projection and only
// when labels are first shown.
const labelAnchors = new Map<ProjectionOption, CountryLabelAnchor[]>();
function getLabelAnchors(option: ProjectionOption) {
  let anchors = labelAnchors.get(option);
  if (!anchors) {
    const { pathGenerator } = getProjection(option);
    anchors = geoFeatures.map((geoFeature) =>
      measureCountryLabelAnchor(pathGenerator, geoFeature),
    );
    labelAnchors.set(option, anchors);
  }
  return anchors;
}

function toValue({ value }: DataItem<string | number>): number {
  return typeof value === "string" ? 0 : value;
}

// Returns React.ReactElement rather than JSX.Element: the global JSX
// namespace is gone from the React 19 types.
export default function WorldMap<T extends number | string>(
  props: Props<T>,
): React.ReactElement {
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
    projection: projectionProp = defaultProjection,
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
    zoom,
    onZoomChange,
    pins,
    pinColor = defaultPinColor,
    pinTextColor = defaultPinTextColor,
    pinOutlineColor = defaultPinOutlineColor,
    labelColor = defaultLabelColor,
    labelHaloColor,
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
  // Plain JavaScript callers can pass any string; fall back to the default
  // projection instead of failing on an unknown one.
  const projection = projectionOptions.includes(projectionProp)
    ? projectionProp
    : defaultProjection;
  const layout = projectionLayouts[projection];
  const height = width * layout.heightRatio;
  const {
    options: zoomOptions,
    state: zoomState,
    mapTransform: { transform: mapTransform, mapScale },
    svgProps,
    controls,
    status: zoomStatus,
    layerStyle,
  } = useZoom({
    zoom,
    onZoomChange,
    richInteraction,
    width,
    height,
    projection,
    svgRef: containerRef,
  });
  const zoomEnabled = zoomOptions.enabled;
  // Keep borders one pixel wide at any zoom. Only with zoom, so the default
  // render is unchanged.
  const vectorEffect = zoomEnabled ? "non-scaling-stroke" : undefined;

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
  const { projection: geoProjection, pathGenerator } =
    getProjection(projection);

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
        data-country-code={isoCode}
        data-country-name={countryName}
        vectorEffect={vectorEffect}
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
              vectorEffect={vectorEffect}
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

  // Country labels: shown with zoom, sized in screen pixels and kept only
  // where they fit inside their country without overlapping a larger one.
  const labelFontSize = resolveCountryLabelMapFontSize(
    zoomState.scale,
    mapScale,
    zoomOptions,
  );
  const showCountryLabels = zoomEnabled && zoomOptions.showCountryLabels;
  const countryLabels = React.useMemo(
    () =>
      showCountryLabels
        ? placeCountryLabels(
            getLabelAnchors(projection).map((anchor) =>
              createCountryLabelCandidateFromAnchor(anchor, labelFontSize),
            ),
          )
        : [],
    [labelFontSize, projection, showCountryLabels],
  );

  // Pins render with or without zoom; overlapping ones are dropped. They are
  // sized in screen pixels, so wait until the map has a width.
  const showPins =
    zoomOptions.showPins && pins != null && pins.length > 0 && mapScale > 0;
  const mapPins = React.useMemo(
    () => (showPins ? projectMapPins(pins, geoProjection, mapScale) : []),
    [geoProjection, mapScale, pins, showPins],
  );

  // Build paths
  const regionPaths = regionElements.map((entry) => entry.path);

  // Build tooltips
  const regionTooltips = regionElements.map(
    (entry) => entry.highlightedTooltip,
  );

  const svg = (
    <svg
      ref={containerRef}
      // A direct aria-label avoids SSR hydration mismatches from generated
      // ids while still giving the SVG an accessible name (WCAG 1.1.1).
      role="img"
      aria-label={title ?? "World map"}
      // Focus, keyboard and pointer handlers for richInteraction or zoom.
      // Spread before the size so the markup matches earlier releases.
      {...svgProps}
      height={`${height}px`}
      width={`${width}px`}>
      <g
        data-map-layer="ocean"
        data-map-layer-order={mapRenderingLayerOrder.ocean}>
        {/* Same colour as the figure behind it, so it adds no visible
            change; it gives the water its own element to style. */}
        <rect
          data-map-ocean="true"
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill={backgroundColor}
          aria-hidden="true"
        />
      </g>
      {frame && <Frame color={frameColor} />}
      {/* Every layer that moves with the countries shares mapTransform. */}
      <g
        data-map-layer="countries"
        data-map-layer-order={mapRenderingLayerOrder.countries}
        transform={mapTransform}
        style={layerStyle}>
        {layout.outline && (
          <path
            className="worldmap__outline"
            d={pathGenerator({ type: "Sphere" })!}
            fill="none"
            stroke={borderColor}
            strokeOpacity={strokeOpacity}
            vectorEffect={vectorEffect}
            aria-hidden="true"
          />
        )}
        {regionPaths}
      </g>
      {showDisputedTerritories && (
        <g
          className="worldmap__disputed-territories"
          data-map-layer="disputed-territories"
          data-map-layer-order={mapRenderingLayerOrder["disputed-territories"]}
          transform={mapTransform}
          style={layerStyle}>
          {territoryElements.map((entry) => entry.path)}
        </g>
      )}
      <g
        data-map-layer="labels"
        data-map-layer-order={mapRenderingLayerOrder.labels}>
        {textLabelFunction(width).map((labelProps) => (
          <TextLabel {...labelProps} key={labelProps.label} />
        ))}
      </g>
      {showCountryLabels && (
        <g
          className="worldmap__country-labels"
          data-map-layer="country-labels"
          data-map-layer-order={mapRenderingLayerOrder["country-labels"]}
          transform={mapTransform}
          style={layerStyle}
          pointerEvents="none"
          aria-hidden="true">
          {countryLabels.map((label) => (
            <TextLabel
              key={label.countryCode}
              label={label.label}
              x={label.x}
              y={label.y}
              data-country-code={label.countryCode}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={labelFontSize}
              fill={labelColor}
              {...(labelHaloColor != null
                ? {
                    paintOrder: "stroke",
                    stroke: labelHaloColor,
                    strokeWidth: 3 / mapScale,
                    strokeLinejoin: "round" as const,
                  }
                : {})}
            />
          ))}
        </g>
      )}
      {showPins && (
        <g
          className="worldmap__pins"
          data-map-layer="pins"
          data-map-layer-order={mapRenderingLayerOrder.pins}
          transform={mapTransform}
          style={layerStyle}>
          {mapPins.map(({ pin, x, y }, index) => (
            <PinMarker
              key={pin.id ?? `${pin.caption}-${index}`}
              caption={pin.caption}
              mapScale={mapScale}
              x={x}
              y={y}
              color={pinColor}
              textColor={pinTextColor}
              outlineColor={pinOutlineColor}
              {...(pin.countryCode != null
                ? { countryCode: pin.countryCode }
                : {})}
              {...(pin.kind != null ? { kind: pin.kind } : {})}
            />
          ))}
        </g>
      )}
      {regionTooltips}
      {territoryElements.map((entry) => entry.tooltip)}
    </svg>
  );

  // Render the SVG. The figure is measured rather than the wrapper so the
  // figure's default (or user-styled) margins don't make the SVG overflow.
  // With zoom, a positioned box the size of the map holds the SVG and the
  // zoom buttons; the figure itself keeps its styles.
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
        {zoomEnabled ? (
          <div
            className="worldmap__zoom-viewport"
            style={{ position: "relative", width: `${width}px` }}>
            {/* The buttons come before the map in the tab order, so keyboard
                users don't have to tab through every clickable country first. */}
            {zoomOptions.showControls && (
              <ZoomControls
                onZoomIn={controls.zoomIn}
                onZoomOut={controls.zoomOut}
                onResetZoom={controls.reset}
              />
            )}
            {svg}
            <ZoomStatus message={zoomStatus} />
          </div>
        ) : (
          svg
        )}
      </figure>
    </div>
  );
}

const regions = geoFeatures.map((f) => ({
  name: f.properties.N,
  code: f.properties.I,
}));

export { WorldMap, regions };
