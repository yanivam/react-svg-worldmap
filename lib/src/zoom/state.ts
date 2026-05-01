import type { ZoomOptions, ZoomState } from "../types.js";
import { defaultZoomOptions } from "../constants.js";

export interface ResolvedZoomOptions {
  enabled: boolean;
  initialScale: number;
  minScale: number;
  zoomFactor: number;
  showControls: boolean;
  showCountryLabels: boolean;
  showPins: boolean;
}

export function resolveZoomOptions(
  zoom: boolean | ZoomOptions | undefined,
): ResolvedZoomOptions {
  if (zoom === undefined || zoom === false) {
    return {
      ...defaultZoomOptions,
      enabled: false,
    };
  }

  if (zoom === true) {
    return {
      ...defaultZoomOptions,
      enabled: true,
    };
  }

  return {
    ...defaultZoomOptions,
    ...zoom,
    enabled: zoom.enabled ?? true,
  };
}

export function createInitialZoomState(
  options: ResolvedZoomOptions,
): ZoomState {
  return {
    scale: Math.max(options.initialScale, options.minScale),
    translate: [0, 0],
  };
}

export function zoomAroundPoint(
  state: ZoomState,
  point: [number, number],
  factor: number,
  minScale: number,
): ZoomState {
  const nextScale = Math.max(state.scale * factor, minScale);
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

export function resetZoomState(options: ResolvedZoomOptions): ZoomState {
  return createInitialZoomState(options);
}
