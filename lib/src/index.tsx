import * as React from "react";
import { useState, useRef, useEffect } from "react";
import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import type {
  Props,
  CountryContext,
  DataItem,
  ISOCode,
  ZoomState,
  DetailProviderResult,
} from "./types.js";
import { mapRenderingLayerOrder } from "./types.js";
import { getDisputeByCountryCode } from "./disputes.js";
import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
  defaultBackgroundColor,
  defaultBorderColor,
  regionGeometryMinZoom,
} from "./constants.js";
import { useWindowWidth, useContainerWidth, responsify } from "./utils.js";
import { drawTooltip } from "./draw.js";
import PinMarker from "./components/PinMarker.js";
import Frame from "./components/Frame.js";
import Region from "./components/Region.js";
import TextLabel from "./components/TextLabel.js";
import ZoomControls from "./components/ZoomControls.js";
import ZoomStatus from "./components/ZoomStatus.js";
import {
  clampZoomState,
  createInitialZoomState,
  panZoomState,
  resetZoomState,
  resolveZoomOptions,
  zoomAroundPoint,
} from "./zoom/state.js";
import type { ZoomRenderPhase } from "./zoom/state.js";
import {
  createFailedDetailResult,
  createIdleDetailResult,
  createUnavailableDetailResult,
  isReadyDetailResult,
} from "./detail/providerState.js";
import {
  createCountryLabelCandidate,
  createRegionLabelCandidate,
  placeMapLabels,
  resolveCountryLabelMapFontSize,
} from "./labels/placement.js";
import { projectMapPins } from "./pins/mapPins.js";
import {
  loadDetailedCountryGeometry,
  reducedCountryFeatures,
  reducedCountryGeometryTier,
  shouldLoadDetailedCountryGeometry,
  shouldLoadRegionGeometry,
} from "./map-data/geometry-tiers.js";
import {
  createMapTransform,
  createMapViewport,
  normalizeFeatureForProjection,
} from "./zoom/geometry.js";

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  Props,
  ZoomOptions,
  ZoomState,
  MapPin,
  CountryLabelCandidate,
  RegionLabelCandidate,
  DetailLevel,
  RegionCoverageStatus,
  DetailLayerStatus,
  RegionCoverageRecord,
  RegionViewport,
  RegionFeatureRecord,
  RegionCollectionRecord,
  DetailProvider,
  DetailProviderResult,
  CountryGeometryTierName,
  GeometryTierLoadState,
  CountryGeometryTierStatus,
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
export {
  createFailedDetailResult,
  createIdleDetailResult,
  createReadyDetailResult,
  createUnavailableDetailResult,
  isReadyDetailResult,
} from "./detail/providerState.js";
export type { DisputeId } from "./disputes.js";

function toValue({ value }: DataItem<string | number>): number {
  return typeof value === "string" ? 0 : value;
}

function isRenderableRegionPath(path: string): boolean {
  return /^M\s*-?\d/u.test(path.trim());
}

function readNumericStyleValue(
  value: React.CSSProperties[keyof React.CSSProperties],
): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;

  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function strengthenCountryBorderForRegions(
  style: React.CSSProperties,
): React.CSSProperties {
  const strokeWidth = readNumericStyleValue(style.strokeWidth) ?? 1;
  const strokeOpacity = readNumericStyleValue(style.strokeOpacity) ?? 1;

  return {
    ...style,
    strokeWidth: Math.max(strokeWidth + 0.35, 1.35),
    strokeOpacity: Math.min(strokeOpacity + 0.25, 1),
  };
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
    backgroundColor = defaultBackgroundColor,
    tooltipBgColor = "black",
    tooltipTextColor = "white",
    rtl = false,
    size = defaultSize,
    frame = false,
    frameColor = "black",
    borderColor = defaultBorderColor,
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
    pins = [],
    detailLevel = "countries",
    detailProvider,
    onDetailStatusChange,
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
  const mapViewport = React.useMemo(
    () => createMapViewport(width, height),
    [height, width],
  );
  const [zoomState, setZoomState] = useState(() =>
    clampZoomState(createInitialZoomState(zoomOptions), mapViewport),
  );
  const [detailZoomState, setDetailZoomState] = useState(() =>
    clampZoomState(createInitialZoomState(zoomOptions), mapViewport),
  );
  const [zoomRenderPhase, setZoomRenderPhase] =
    useState<ZoomRenderPhase>("complete");
  const [zoomStatus, setZoomStatus] = useState("Map zoom reset");
  const [detailResult, setDetailResult] = useState<DetailProviderResult>(
    createIdleDetailResult(),
  );
  const [countryGeometryTier, setCountryGeometryTier] = useState(
    reducedCountryGeometryTier,
  );
  const dragPoint = useRef<[number, number] | null>(null);
  const scale = zoomState.scale;
  const detailScale = detailZoomState.scale;
  const [translateX, translateY] = zoomState.translate;
  const [detailTranslateX, detailTranslateY] = detailZoomState.translate;
  const mapTransform = React.useMemo(
    () => createMapTransform(mapViewport, zoomState),
    [mapViewport, zoomState],
  );
  const detailMapTransform = React.useMemo(
    () => createMapTransform(mapViewport, detailZoomState),
    [detailZoomState, mapViewport],
  );
  const detailMapScale = detailMapTransform.mapScale;
  const labelFontSize = resolveCountryLabelMapFontSize(
    detailScale,
    detailMapScale,
    zoomOptions,
  );
  const geoFeatures = React.useMemo(
    () =>
      countryGeometryTier.features as Array<
        GeoJSON.Feature & { properties: { N: string; I: string } }
      >,
    [countryGeometryTier.features],
  );
  // Build a path & a tooltip for each country
  const projection = React.useMemo(() => geoMercator(), []);
  const pathGenerator = React.useMemo(
    () => geoPath().projection(projection),
    [projection],
  );
  const renderGeoFeatures = React.useMemo(
    () =>
      geoFeatures.map((geoFeature) =>
        normalizeFeatureForProjection(pathGenerator, geoFeature),
      ),
    [geoFeatures, pathGenerator],
  );
  const visibleRegionCountryCodes = React.useMemo((): ISOCode[] => {
    if (
      detailLevel !== "regions" ||
      detailProvider == null ||
      !shouldLoadRegionGeometry(detailScale) ||
      detailMapScale <= 0
    )
      return [];

    const [contentTranslateX, contentTranslateY] =
      detailMapTransform.contentTranslate;
    const visibleBounds = {
      left: (0 - detailTranslateX) / detailMapScale - contentTranslateX,
      right:
        (mapViewport.width - detailTranslateX) / detailMapScale -
        contentTranslateX,
      top: (0 - detailTranslateY) / detailMapScale - contentTranslateY,
      bottom:
        (mapViewport.height - detailTranslateY) / detailMapScale -
        contentTranslateY,
    };

    return renderGeoFeatures
      .filter((geoFeature) => {
        const countryCode = geoFeature.properties.I as ISOCode;
        if (!detailProvider.supports(countryCode)) return false;

        const [[left, top], [right, bottom]] = pathGenerator.bounds(geoFeature);
        return (
          right >= visibleBounds.left &&
          left <= visibleBounds.right &&
          bottom >= visibleBounds.top &&
          top <= visibleBounds.bottom
        );
      })
      .map((geoFeature) => geoFeature.properties.I as ISOCode);
  }, [
    detailMapScale,
    detailMapTransform.contentTranslate,
    detailScale,
    detailLevel,
    detailProvider,
    detailTranslateX,
    detailTranslateY,
    mapViewport.height,
    mapViewport.width,
    pathGenerator,
    renderGeoFeatures,
  ]);

  useEffect(() => {
    onZoomChange?.(zoomState);
  }, [onZoomChange, zoomState]);

  useEffect(() => {
    setZoomState((currentState) => clampZoomState(currentState, mapViewport));
    setDetailZoomState((currentState) =>
      clampZoomState(currentState, mapViewport),
    );
  }, [mapViewport]);

  useEffect(() => {
    let cancelled = false;

    if (!shouldLoadDetailedCountryGeometry(detailScale)) {
      setCountryGeometryTier(reducedCountryGeometryTier);
      return undefined;
    }

    if (countryGeometryTier.name === "detailed") return undefined;

    void loadDetailedCountryGeometry()
      .then((tier) => {
        if (!cancelled) setCountryGeometryTier(tier);
      })
      .catch(() => {
        if (!cancelled) setCountryGeometryTier(reducedCountryGeometryTier);
      });

    return () => {
      cancelled = true;
    };
  }, [countryGeometryTier.name, detailScale]);

  const [detailResultsByCountryCode, setDetailResultsByCountryCode] = useState<
    Record<string, DetailProviderResult>
  >({});
  const requestedRegionCountryCodes = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    if (detailLevel !== "regions") {
      const idle = createIdleDetailResult();
      requestedRegionCountryCodes.current.clear();
      setDetailResultsByCountryCode({});
      setDetailResult(idle);
      onDetailStatusChange?.(idle);
      return undefined;
    }

    if (!shouldLoadRegionGeometry(detailScale)) {
      const unavailable = createUnavailableDetailResult(
        undefined,
        `Region detail appears at ${regionGeometryMinZoom}x zoom.`,
      );
      requestedRegionCountryCodes.current.clear();
      setDetailResultsByCountryCode({});
      setDetailResult(unavailable);
      onDetailStatusChange?.(unavailable);
      return undefined;
    }

    if (detailProvider == null || visibleRegionCountryCodes.length === 0) {
      const unavailable = createUnavailableDetailResult(
        undefined,
        "Region detail is unavailable.",
      );
      setDetailResult(unavailable);
      onDetailStatusChange?.(unavailable);
      return undefined;
    }

    const countriesToLoad = visibleRegionCountryCodes.filter(
      (countryCode) => !requestedRegionCountryCodes.current.has(countryCode),
    );
    if (countriesToLoad.length === 0) return undefined;

    setDetailResultsByCountryCode((current) => {
      const next = { ...current };
      for (const countryCode of countriesToLoad) {
        const loading: DetailProviderResult = {
          status: "loading",
          layer: "regions",
          countryCode,
        };
        next[countryCode] = loading;
      }
      return next;
    });

    const loadCountryRegions = (countryCode: ISOCode): void => {
      requestedRegionCountryCodes.current.add(countryCode);
      const loading: DetailProviderResult = {
        status: "loading",
        layer: "regions",
        countryCode,
      };
      setDetailResult(loading);
      onDetailStatusChange?.(loading);

      void detailProvider
        .loadRegions(countryCode)
        .then((result) => {
          if (!cancelled) {
            setDetailResultsByCountryCode((current) => ({
              ...current,
              [countryCode]: result,
            }));
            setDetailResult(result);
            onDetailStatusChange?.(result);
          }
        })
        .catch(() => {
          if (!cancelled) {
            const failed = createFailedDetailResult(
              countryCode,
              "Region detail could not be loaded.",
            );
            setDetailResultsByCountryCode((current) => ({
              ...current,
              [countryCode]: failed,
            }));
            setDetailResult(failed);
            onDetailStatusChange?.(failed);
          }
        });
    };

    for (const countryCode of countriesToLoad) loadCountryRegions(countryCode);

    return () => {
      cancelled = true;
    };
  }, [
    detailLevel,
    detailProvider,
    detailScale,
    onDetailStatusChange,
    visibleRegionCountryCodes,
  ]);

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

  const mapPins = React.useMemo(() => {
    if (!zoomOptions.showPins) return [];

    return projectMapPins(pins, projection, detailScale);
  }, [detailScale, pins, projection, zoomOptions.showPins]);
  const visibleRegionCountryCodeSet = React.useMemo(
    () => new Set<string>(visibleRegionCountryCodes),
    [visibleRegionCountryCodes],
  );
  const readyRegionCollections = React.useMemo(
    () =>
      visibleRegionCountryCodes
        .map((countryCode) => detailResultsByCountryCode[countryCode])
        .filter(
          (
            result,
          ): result is DetailProviderResult & {
            collection: NonNullable<DetailProviderResult["collection"]>;
          } => result != null && isReadyDetailResult(result),
        )
        .map((result) => result.collection),
    [detailResultsByCountryCode, visibleRegionCountryCodes],
  );
  const renderableRegions = React.useMemo(
    () =>
      readyRegionCollections.flatMap((collection) =>
        collection.regions.filter(
          (region) =>
            visibleRegionCountryCodeSet.has(region.countryCode) &&
            isRenderableRegionPath(region.path),
        ),
      ),
    [readyRegionCollections, visibleRegionCountryCodeSet],
  );
  const hasVisibleRegionDetails = renderableRegions.length > 0;

  const regionElements = renderGeoFeatures.map((geoFeature, i) => {
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

    const countryStyle = styleFunction(context);
    const path = (
      <Region
        ref={triggerRef}
        d={pathGenerator(geoFeature)!}
        style={
          hasVisibleRegionDetails
            ? strengthenCountryBorderForRegions(countryStyle)
            : countryStyle
        }
        // eslint-disable-next-line react/jsx-no-bind -- Region expects a callback prop.
        onClick={handleRegionClick}
        strokeOpacity={strokeOpacity}
        href={resolvedHref}
        key={countryName}
        countryName={countryName}
        data-country-code={isoCode}
        data-country-name={countryName}
        data-map-interaction-target="country"
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

  const detailRegionPaths = readyRegionCollections.flatMap((collection) => {
    const collectionRegions = collection.regions.filter((region) =>
      isRenderableRegionPath(region.path),
    );
    if (collectionRegions.length <= 1) return [];

    return collectionRegions.map((region) => {
      const regionTitle = `${region.localizedName ?? region.name}, ${
        collection.countryName
      }`;

      return (
        <path
          key={`region-detail-${region.id}`}
          d={region.path}
          aria-label={regionTitle}
          data-region-id={region.id}
          data-country-code={region.countryCode.toUpperCase()}
          data-region-kind={region.kind}
          fill="transparent"
          stroke={borderColor}
          strokeDasharray="2 2"
          strokeLinecap="round"
          strokeOpacity={Math.min(strokeOpacity + 0.35, 1)}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke">
          <title>{regionTitle}</title>
        </path>
      );
    });
  });

  const labelPlacement = React.useMemo(() => {
    if (!zoomOptions.enabled) return { countryLabels: [], regionLabels: [] };

    return placeMapLabels({
      countryCandidates: zoomOptions.showCountryLabels
        ? renderGeoFeatures.map((geoFeature) =>
            createCountryLabelCandidate(
              pathGenerator,
              geoFeature,
              labelFontSize,
            ),
          )
        : [],
      regionCandidates:
        readyRegionCollections.length > 0 &&
        shouldLoadRegionGeometry(detailScale)
          ? renderableRegions.map((region) =>
              createRegionLabelCandidate(region, labelFontSize * 0.7),
            )
          : [],
      scale: detailScale,
    });
  }, [
    detailScale,
    labelFontSize,
    pathGenerator,
    readyRegionCollections.length,
    renderGeoFeatures,
    renderableRegions,
    zoomOptions.enabled,
    zoomOptions.showCountryLabels,
  ]);
  const countryLabels = labelPlacement.countryLabels;
  const regionLabels = labelPlacement.regionLabels;

  // Build tooltips
  const regionTooltips = regionElements.map(
    (entry) => entry.highlightedTooltip,
  );

  const detailFrameId = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (
        detailFrameId.current != null &&
        typeof globalThis.cancelAnimationFrame === "function"
      )
        globalThis.cancelAnimationFrame(detailFrameId.current);
    },
    [],
  );

  const scheduleDetailZoomState = React.useCallback((nextState: ZoomState) => {
    if (
      detailFrameId.current != null &&
      typeof globalThis.cancelAnimationFrame === "function"
    )
      globalThis.cancelAnimationFrame(detailFrameId.current);

    const frameCallback = (): void => {
      setDetailZoomState(nextState);
      setZoomRenderPhase("complete");
      detailFrameId.current = null;
    };

    if (typeof globalThis.requestAnimationFrame === "function") {
      detailFrameId.current = globalThis.requestAnimationFrame(frameCallback);
    } else {
      detailFrameId.current = null;
      setTimeout(frameCallback, 0);
    }
  }, []);

  const updateZoomState = (nextState: ZoomState, message: string): void => {
    const clampedNextState = clampZoomState(nextState, mapViewport);
    setZoomState(clampedNextState);
    setZoomRenderPhase("immediate-feedback");
    scheduleDetailZoomState(clampedNextState);
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
      if (zoomOptions.enabled || richInteraction) {
        updateZoomState(
          zoomAroundPoint(
            zoomState,
            [x, y],
            zoomOptions.zoomFactor,
            zoomOptions.minScale,
          ),
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

  // Render the SVG (wrapper div for ResizeObserver container sizing)
  return (
    <div
      ref={setWrapperEl}
      className={containerClassName ?? "worldmap__wrapper"}
      style={{ width: "100%", minHeight: 0 }}>
      <figure
        className="worldmap__figure-container"
        style={{
          position: "relative",
          display: "inline-block",
          margin: 0,
          backgroundColor,
        }}>
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
            onResetZoom={resetZoom}
          />
        )}
        {zoomOptions.enabled && <ZoomStatus message={zoomStatus} />}
        {detailLevel === "regions" && detailResult.status !== "idle" && (
          <ZoomStatus
            message={
              detailResult.warning ?? `Region detail ${detailResult.status}`
            }
          />
        )}
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
          data-country-geometry-tier={countryGeometryTier.name}
          data-detail-zoom-scale={detailScale}
          data-zoom-render-phase={zoomRenderPhase}
          data-zoom-scale={scale}
          height={`${height}px`}
          width={`${width}px`}
          {...(enableMapInteractions ? eventHandlers : undefined)}>
          <g
            data-map-layer="ocean"
            data-map-layer-order={mapRenderingLayerOrder.ocean}>
            <rect
              data-map-ocean="true"
              x={0}
              y={0}
              width="100%"
              height="100%"
              fill={backgroundColor}
            />
          </g>
          {frame && <Frame color={frameColor} />}
          <g
            data-map-layer="countries"
            data-map-layer-order={mapRenderingLayerOrder.countries}
            transform={mapTransform.transform}
            style={{ transition: "all 0.2s" }}>
            {regionPaths}
          </g>
          <g
            data-map-layer="regions"
            data-map-layer-order={mapRenderingLayerOrder.regions}
            transform={mapTransform.transform}
            style={{ transition: "all 0.2s" }}>
            {detailRegionPaths}
          </g>
          <g
            data-map-layer="labels"
            data-map-layer-order={mapRenderingLayerOrder.labels}
            style={{ transition: "all 0.2s" }}>
            <g transform={mapTransform.transform}>
              {countryLabels.map((label) => (
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
                </React.Fragment>
              ))}
              {regionLabels.map((region) => (
                <TextLabel
                  key={`region-label-${region.regionId}`}
                  label={region.label}
                  x={region.x}
                  y={region.y}
                  textAnchor="middle"
                  fontSize={labelFontSize * 0.7}
                  fill="#555"
                  fontWeight={400}
                  pointerEvents="none"
                />
              ))}
            </g>
            {textLabelFunction(width).map((labelProps) => (
              <TextLabel {...labelProps} key={labelProps.label} />
            ))}
          </g>
          <g
            data-map-layer="pins"
            data-map-layer-order={mapRenderingLayerOrder.pins}
            transform={mapTransform.transform}
            style={{ transition: "all 0.2s" }}>
            {mapPins.map(({ pin, x, y }, index) => (
              <PinMarker
                key={pin.id ?? `${pin.caption}-${index}`}
                caption={pin.caption}
                scale={scale}
                x={x}
                y={y}
                {...(pin.countryCode != null
                  ? { countryCode: pin.countryCode }
                  : {})}
                {...(pin.kind != null ? { kind: pin.kind } : {})}
              />
            ))}
          </g>
          <g
            data-map-layer="interaction-targets"
            data-map-layer-order={mapRenderingLayerOrder["interaction-targets"]}
            aria-hidden="true"
            pointerEvents="none"
          />
          {regionTooltips}
        </svg>
      </figure>
    </div>
  );
}

const regions = reducedCountryFeatures.map((f) => ({
  name: f.properties.N,
  code: f.properties.I,
}));

export { WorldMap, regions };
