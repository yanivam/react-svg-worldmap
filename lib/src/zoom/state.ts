import type { ZoomOptions, ZoomState } from "../types.js";
import { defaultZoomOptions } from "../constants.js";
import type { MapViewport } from "./geometry.js";

export interface ResolvedZoomOptions {
  enabled: boolean;
  initialScale: number;
  minScale: number;
  maxScale: number;
  zoomFactor: number;
  showControls: boolean;
  showCountryLabels: boolean;
  countryLabelMinFontSize: number;
  countryLabelMaxFontSize: number;
  countryLabelZoomGrowthRate: number;
  showPins: boolean;
}

export function resolveZoomOptions(
  zoom: boolean | ZoomOptions | undefined,
): ResolvedZoomOptions {
  if (zoom === undefined || zoom === false)
    return { ...defaultZoomOptions, enabled: false };

  if (zoom === true) return { ...defaultZoomOptions, enabled: true };

  const options = { ...defaultZoomOptions, ...zoom };
  return {
    ...options,
    // A maximum below the minimum would make every zoom a no-op.
    maxScale: Math.max(options.minScale, options.maxScale),
    enabled: zoom.enabled ?? true,
  };
}

function clampScale(scale: number, minScale: number, maxScale: number) {
  return Math.min(maxScale, Math.max(minScale, scale));
}

export function createInitialZoomState(
  options: ResolvedZoomOptions,
): ZoomState {
  return {
    scale: clampScale(options.initialScale, options.minScale, options.maxScale),
    translate: [0, 0],
  };
}

export function zoomAroundPoint(
  state: ZoomState,
  point: [number, number],
  factor: number,
  minScale: number,
  maxScale = Infinity,
): ZoomState {
  const nextScale = clampScale(state.scale * factor, minScale, maxScale);
  const appliedFactor = nextScale / state.scale;

  return {
    scale: nextScale,
    translate: [
      appliedFactor * state.translate[0] + (1 - appliedFactor) * point[0],
      appliedFactor * state.translate[1] + (1 - appliedFactor) * point[1],
    ],
  };
}

export function panZoomState(
  state: ZoomState,
  delta: [number, number],
): ZoomState {
  return {
    scale: state.scale,
    translate: [state.translate[0] + delta[0], state.translate[1] + delta[1]],
  };
}

function clampAxis(
  translate: number,
  viewportSize: number,
  scaledContentSize: number,
): number {
  if (scaledContentSize <= viewportSize)
    return (viewportSize - scaledContentSize) / 2;

  const minTranslate = viewportSize - scaledContentSize;
  return Math.min(0, Math.max(minTranslate, translate));
}

/**
 * Keeps the map covering the viewport: it can't be dragged off screen, and
 * it is centred when it is smaller than the viewport.
 */
export function clampZoomState(
  state: ZoomState,
  viewport: MapViewport,
): ZoomState {
  const viewportWidth = Math.max(0, viewport.width);
  const viewportHeight = Math.max(0, viewport.height);
  const translate: [number, number] = [
    clampAxis(state.translate[0], viewportWidth, viewportWidth * state.scale),
    clampAxis(state.translate[1], viewportHeight, viewportHeight * state.scale),
  ];

  if (
    translate[0] === state.translate[0] &&
    translate[1] === state.translate[1]
  )
    return state;

  return { scale: state.scale, translate };
}

export function resetZoomState(options: ResolvedZoomOptions): ZoomState {
  return createInitialZoomState(options);
}

export function isSameZoomState(left: ZoomState, right: ZoomState): boolean {
  return (
    left.scale === right.scale &&
    left.translate[0] === right.translate[0] &&
    left.translate[1] === right.translate[1]
  );
}
