import * as React from "react";
import { useState, useRef } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import topoData from "./countries.topo.js";
import type { Props, CountryContext, DataItem, ISOCode } from "./types.js";
import { getEffectiveDetailLevel } from "./detail/getEffectiveDetailLevel.js";
import { getCountryViewport } from "./detail/getCountryViewport.js";
import { projectRegionFeatures } from "./detail/projectRegionFeatures.js";
import { useDetailCollection } from "./detail/useDetailCollection.js";
import { useDrilldownState } from "./detail/useDrilldownState.js";
import { getDefaultLabels } from "./labels/getDefaultLabels.js";
import { projectFeatureGeometry } from "./labels/geometry.js";
import { getFeatureLabelAnchor } from "./labels/getFeatureLabelAnchor.js";
import { placeLabels } from "./labels/placeLabels.js";
import type {
  LabelCandidate,
  ProjectedFeatureGeometry,
} from "./labels/types.js";
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

const defaultTextLabelFunction = () => [];
const MIN_SCALE = 1;
const MAX_SCALE = 10;
const ZOOM_FACTOR = 1.6;
const REGION_DETAIL_MIN_SCALE = 2.4;

function getRegionCollectionBounds(
  regions: Array<{ bounds?: [[number, number], [number, number]] }>,
): [[number, number], [number, number]] | null {
  const availableBounds = regions
    .map((region) => region.bounds)
    .filter(
      (bounds): bounds is [[number, number], [number, number]] =>
        bounds != null,
    );

  if (availableBounds.length === 0) return null;

  return availableBounds.reduce((combined, current) => [
    [
      Math.min(combined[0][0], current[0][0]),
      Math.min(combined[0][1], current[0][1]),
    ],
    [
      Math.max(combined[1][0], current[1][0]),
      Math.max(combined[1][1], current[1][1]),
    ],
  ]);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
    textLabelFunction = defaultTextLabelFunction,
    containerClassName,
    regionClassName,
    detailLevel = "countries",
    detailProvider,
    regionNameTranslations,
    initialDrilldownCountryCode,
    showLabels = false,
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
  const initialDrilldownCountryName =
    initialDrilldownCountryCode == null
      ? null
      : geoFeatures.find(
          (feature) =>
            feature.properties.I === initialDrilldownCountryCode.toUpperCase(),
        )?.properties.N ?? null;
  const drilldown = useDrilldownState(
    initialDrilldownCountryCode != null && initialDrilldownCountryName != null
      ? {
          countryCode: initialDrilldownCountryCode.toUpperCase() as ISOCode,
          countryName: initialDrilldownCountryName,
        }
      : undefined,
  );
  const detailResult = useDetailCollection(
    drilldown.activeCountryCode,
    detailProvider,
    effectiveDetailLevel === "regions",
  );
  const regionDetail =
    detailResult.status === "ready" ? detailResult.collection : undefined;
  const visibleRegions = regionDetail?.regions ?? [];
  const renderedRegionFeatures = regionDetail
    ? projectRegionFeatures(regionDetail)
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
  const [scale, setScale] = useState(
    initialDrilldownCountryCode != null ? REGION_DETAIL_MIN_SCALE : MIN_SCALE,
  );
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const dragStateRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  });
  const suppressClickRef = useRef(false);
  const preferredZoomCountryCode =
    initialDrilldownCountryCode != null
      ? (initialDrilldownCountryCode.toUpperCase() as ISOCode)
      : firstDataCountryCode;
  const preferredZoomCountryName =
    initialDrilldownCountryName ?? firstDataCountryName;
  const showingRegionDetail =
    drilldown.activeCountryCode != null && scale >= REGION_DETAIL_MIN_SCALE;

  React.useEffect(() => {
    if (!showingRegionDetail || regionDetail == null) return;

    const detailBounds = getRegionCollectionBounds(regionDetail.regions);
    if (detailBounds == null) return;

    const viewport = getCountryViewport(detailBounds, width, height);
    setScale(viewport.scale);
    setTranslateX(viewport.translateX);
    setTranslateY(viewport.translateY);
  }, [height, regionDetail, showingRegionDetail, width]);

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
  const worldBounds = React.useMemo(() => {
    const bounds = geoFeatures.map((feature) => pathGenerator.bounds(feature));

    return bounds.reduce((combined, current) => [
      [
        Math.min(combined[0][0], current[0][0]),
        Math.min(combined[0][1], current[0][1]),
      ],
      [
        Math.max(combined[1][0], current[1][0]),
        Math.max(combined[1][1], current[1][1]),
      ],
    ]) as [[number, number], [number, number]];
  }, [pathGenerator]);
  const activePanBounds =
    showingRegionDetail && regionDetail != null
      ? getRegionCollectionBounds(regionDetail.regions) ?? worldBounds
      : worldBounds;

  const clampTranslation = React.useCallback(
    (nextTranslateX: number, nextTranslateY: number, nextScale: number) => {
      const [[minX, minY], [maxX, maxY]] = activePanBounds;
      const scaleFactor = (width / 960) * nextScale;
      const shiftedMinY = minY + 240;
      const shiftedMaxY = maxY + 240;
      const scaledWidth = scaleFactor * (maxX - minX);
      const scaledHeight = scaleFactor * (shiftedMaxY - shiftedMinY);
      const margin = 32;

      const clampedX =
        scaledWidth <= width - margin * 2
          ? width / 2 - scaleFactor * ((minX + maxX) / 2)
          : clamp(
              nextTranslateX,
              width - margin - scaleFactor * maxX,
              margin - scaleFactor * minX,
            );
      const clampedY =
        scaledHeight <= height - margin * 2
          ? height / 2 - scaleFactor * ((shiftedMinY + shiftedMaxY) / 2)
          : clamp(
              nextTranslateY,
              height - margin - scaleFactor * shiftedMaxY,
              margin - scaleFactor * shiftedMinY,
            );

      return {
        translateX: clampedX,
        translateY: clampedY,
      };
    },
    [activePanBounds, height, width],
  );

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
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }

      if (canDrillDown) {
        drilldown.enterCountry(isoCode as ISOCode, countryName);
        setScale((current) => Math.max(current, REGION_DETAIL_MIN_SCALE));
      }

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
  const detailRegionPaths = renderedRegionFeatures.map((region) => (
    <Region
      d={region.path}
      style={{
        fill: "transparent",
        stroke: borderColor,
        strokeWidth: 1,
      }}
      strokeOpacity={strokeOpacity}
      key={`detail-${region.id}`}
      countryName={region.label}
      svgTitle={region.label}
      isInteractive={false}
    />
  ));

  // Build tooltips
  const regionTooltips = regionElements.map(
    (entry) => entry.highlightedTooltip,
  );
  const countryFeatureGeometries = Object.fromEntries(
    geoFeatures
      .map((geoFeature) => {
        const geometry = projectFeatureGeometry(geoFeature, pathGenerator);
        if (geometry == null) return null;

        return [geoFeature.properties.I, geometry] as const;
      })
      .filter(
        (entry): entry is readonly [string, ProjectedFeatureGeometry] =>
          entry != null,
      ),
  );
  const countryLabelCandidates: LabelCandidate[] = geoFeatures
    .map((geoFeature) => {
      const [x, y] = getFeatureLabelAnchor(geoFeature, pathGenerator);

      return {
        id: geoFeature.properties.I,
        text: geoFeature.properties.N,
        x,
        y,
        bounds: pathGenerator.bounds(geoFeature) as [
          [number, number],
          [number, number],
        ],
        priority: 10,
        layer: "country" as const,
        minScale: 1,
      };
    })
    .filter(
      (candidate) =>
        Number.isFinite(candidate.x) && Number.isFinite(candidate.y),
    );
  const activeRegionTranslations =
    drilldown.activeCountryCode == null
      ? undefined
      : regionNameTranslations?.[drilldown.activeCountryCode];
  const regionLabelCandidates: LabelCandidate[] = visibleRegions
    .map((region) => ({
      id: region.id,
      text: region.labels.englishName,
      x: region.centroid?.[0] ?? 0,
      y: region.centroid?.[1] ?? 0,
      ...(region.bounds != null ? { bounds: region.bounds } : {}),
      priority: 5,
      layer: "region" as const,
      minScale: 1,
    }))
    .filter(
      (candidate) =>
        Number.isFinite(candidate.x) && Number.isFinite(candidate.y),
    );
  const hasCompleteRegionTranslations =
    activeRegionTranslations != null &&
    visibleRegions.length > 0 &&
    visibleRegions.every(
      (region) =>
        typeof activeRegionTranslations[region.id] === "string" &&
        activeRegionTranslations[region.id]!.length > 0,
    );
  const defaultCandidates = getDefaultLabels({
    countryCandidates: showingRegionDetail ? [] : countryLabelCandidates,
    regionCandidates: showingRegionDetail ? regionLabelCandidates : [],
    hasCompleteRegionTranslations,
    ...(activeRegionTranslations
      ? { regionTranslations: activeRegionTranslations }
      : {}),
  });
  const automaticLabels = !showLabels
    ? []
    : placeLabels(defaultCandidates, scale, {
        ...(!showingRegionDetail
          ? { featureGeometries: countryFeatureGeometries }
          : {}),
        width,
        height,
        scaleFactor: (width / 960) * scale,
        translateX,
        translateY,
      }).map((label) => ({
        label: label.text,
        x: label.x,
        y: label.y,
        fontSize: 12,
        textAnchor: "middle" as const,
        fill: "#333333",
        "aria-hidden": true,
      }));
  const renderedLabels =
    textLabelFunction === defaultTextLabelFunction
      ? automaticLabels
      : textLabelFunction(width);
  const zoomAtPoint = (factor: number, originX: number, originY: number) => {
    setScale((currentScale) => {
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, currentScale * factor),
      );
      const nextTranslateX = factor * translateX + (1 - factor) * originX;
      const nextTranslateY = factor * translateY + (1 - factor) * originY;
      const clampedTranslation = clampTranslation(
        nextTranslateX,
        nextTranslateY,
        nextScale,
      );
      setTranslateX(clampedTranslation.translateX);
      setTranslateY(clampedTranslation.translateY);

      return nextScale;
    });
  };
  const eventHandlers = {
    onMouseDown(e: React.MouseEvent) {
      // Only suppress default on multi-click (≥2) to prevent text-selection
      // during double-click zoom. Single clicks must still move focus normally
      // so keyboard users aren't locked out (WCAG 2.1.1).
      if (e.detail > 1) e.preventDefault();
      e.stopPropagation();
      if (e.button !== 0) return;

      dragStateRef.current = {
        active: true,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
      };
    },
    onMouseMove(e: React.MouseEvent) {
      if (!dragStateRef.current.active) return;

      const deltaX = e.clientX - dragStateRef.current.lastX;
      const deltaY = e.clientY - dragStateRef.current.lastY;
      if (deltaX === 0 && deltaY === 0) return;

      dragStateRef.current = {
        active: true,
        lastX: e.clientX,
        lastY: e.clientY,
        moved:
          dragStateRef.current.moved || Math.abs(deltaX) + Math.abs(deltaY) > 2,
      };
      if (dragStateRef.current.moved) suppressClickRef.current = true;

      const clampedTranslation = clampTranslation(
        translateX + deltaX,
        translateY + deltaY,
        scale,
      );
      setTranslateX(clampedTranslation.translateX);
      setTranslateY(clampedTranslation.translateY);
    },
    onMouseUp() {
      dragStateRef.current.active = false;
    },
    onMouseLeave() {
      dragStateRef.current.active = false;
    },
    onDoubleClick(e: React.MouseEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (scale < MAX_SCALE) zoomAtPoint(ZOOM_FACTOR, x, y);
    },
    // Keyboard equivalents for double-click zoom (WCAG 2.1.1).
    // + / =  → zoom in to the centre of the map
    // - / _  → reset zoom
    onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (scale < MAX_SCALE) zoomAtPoint(ZOOM_FACTOR, width / 2, height / 2);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (scale > MIN_SCALE)
          zoomAtPoint(1 / ZOOM_FACTOR, width / 2, height / 2);
        else if (drilldown.canGoBack) drilldown.reset();
      }
    },
  };
  const handleZoomIn = () => {
    if (
      effectiveDetailLevel === "regions" &&
      drilldown.activeCountryCode == null &&
      preferredZoomCountryCode != null &&
      preferredZoomCountryName != null &&
      scale * ZOOM_FACTOR >= REGION_DETAIL_MIN_SCALE
    ) {
      drilldown.enterCountry(
        preferredZoomCountryCode,
        preferredZoomCountryName,
      );
    }

    if (scale < MAX_SCALE) zoomAtPoint(ZOOM_FACTOR, width / 2, height / 2);
  };
  const handleZoomOut = () => {
    if (scale > MIN_SCALE) {
      zoomAtPoint(1 / ZOOM_FACTOR, width / 2, height / 2);
      return;
    }

    if (drilldown.canGoBack) drilldown.reset();
  };
  const liveAnnouncementMessage =
    showingRegionDetail && drilldown.activeCountryName != null
      ? `Showing ${drilldown.activeCountryName} regions at ${scale.toFixed(
          1,
        )}x zoom`
      : `Showing world map at ${scale.toFixed(1)}x zoom`;
  const handleVisibleRegionSelect = () => {};

  // Render the SVG (wrapper div for ResizeObserver container sizing)
  return (
    <div
      ref={setWrapperEl}
      className={containerClassName ?? "worldmap__wrapper"}
      style={{ position: "relative", width: "100%", minHeight: 0 }}>
      {effectiveDetailLevel === "regions" && (
        <>
          {/* eslint-disable react/jsx-no-bind -- Stable local handlers are used for task 5 controls. */}
          <ZoomControls
            canZoomIn={scale < MAX_SCALE}
            canZoomOut={scale > MIN_SCALE || drilldown.canGoBack}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
          <LiveAnnouncer message={liveAnnouncementMessage} />
          <VisibleRegionList
            regions={showingRegionDetail ? visibleRegions : []}
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
            {effectiveDetailLevel === "regions" &&
              showingRegionDetail &&
              detailResult.status === "ready" &&
              detailRegionPaths}
            {renderedLabels.map((labelProps) => (
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
