import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectionOption, ZoomOptions, ZoomState } from "../types.js";
import { createMapTransform, createMapViewport } from "./geometry.js";
import type { MapTransform } from "./geometry.js";
import {
  clampZoomState,
  createInitialZoomState,
  isSameZoomState,
  panZoomState,
  resetZoomState,
  resolveZoomOptions,
  zoomAroundPoint,
} from "./state.js";
import type { ResolvedZoomOptions } from "./state.js";

interface UseZoomArgs {
  zoom: boolean | ZoomOptions | undefined;
  onZoomChange: ((state: ZoomState) => void) | undefined;
  richInteraction: boolean;
  width: number;
  height: number;
  projection: ProjectionOption;
  svgRef: React.RefObject<SVGSVGElement>;
}

export interface ZoomControlActions {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

export interface UseZoomResult {
  options: ResolvedZoomOptions;
  state: ZoomState;
  mapTransform: MapTransform;
  /** Props for the map's `<svg>`: focus, keyboard and pointer handlers. */
  svgProps: React.SVGProps<SVGSVGElement> & Record<`data-${string}`, unknown>;
  controls: ZoomControlActions;
  /** Text for the polite live region that announces zoom changes. */
  status: string;
  /** Style for the layers that move with the map. */
  layerStyle: React.CSSProperties;
}

// Pixels the pointer must move before a press counts as a drag (and the
// click that ends it is swallowed).
const DRAG_THRESHOLD = 3;
// Wheel delta (in pixels) that zooms by 2x.
const WHEEL_DELTA_PER_DOUBLING = 200;
// Share of the viewport an arrow key pans by.
const ARROW_PAN_RATIO = 0.1;

const transitionStyle: React.CSSProperties = { transition: "all 0.2s" };
const draggingStyle: React.CSSProperties = { transition: "none" };

const zoomKeyShortcuts = "+ - Escape ArrowUp ArrowDown ArrowLeft ArrowRight";

interface DragState {
  last: [number, number];
  distance: number;
}

/**
 * Pan and zoom state for the map.
 *
 * With `zoom` unset, `richInteraction` keeps the behavior of earlier
 * releases: double-click zooms 1x → 2x → 4x → reset, `+` / `=` zoom to the
 * centre up to 4x and `-` / `_` reset. With `zoom` set, the map also pans by
 * dragging and arrow keys, zooms with the buttons and ctrl / ⌘ + wheel, and is
 * kept inside the viewport.
 *
 * `onZoomChange` is called from the event that changed the state, never from
 * an effect, so a parent that stores the state can't cause a render loop.
 */
export function useZoom({
  zoom,
  onZoomChange,
  richInteraction,
  width,
  height,
  projection,
  svgRef,
}: UseZoomArgs): UseZoomResult {
  const options = useMemo(() => resolveZoomOptions(zoom), [zoom]);
  const { enabled } = options;
  const viewport = useMemo(
    () => createMapViewport(width, height),
    [width, height],
  );

  const [state, setState] = useState<ZoomState>(() =>
    enabled
      ? clampZoomState(createInitialZoomState(options), viewport)
      : { scale: 1, translate: [0, 0] },
  );
  const [status, setStatus] = useState("Map zoom reset");
  const [dragging, setDragging] = useState(false);
  const stateRef = useRef(state);
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  // The one place the state changes. Returns whether it did.
  const commit = (next: ZoomState): boolean => {
    const clamped = enabled ? clampZoomState(next, viewport) : next;
    if (isSameZoomState(stateRef.current, clamped)) return false;
    stateRef.current = clamped;
    setState(clamped);
    onZoomChangeRef.current?.(clamped);
    return true;
  };

  // Keep the same part of the map in view when the map is resized.
  const previousWidth = useRef(width);
  useEffect(() => {
    const ratio = previousWidth.current > 0 ? width / previousWidth.current : 1;
    previousWidth.current = width;
    if (!enabled) return;
    const current = stateRef.current;
    commit({
      scale: current.scale,
      translate: [current.translate[0] * ratio, current.translate[1] * ratio],
    });
    // Only a new viewport should re-run this; commit reads the latest values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, width, height]);

  const zoomBy = (factor: number, point: [number, number]): void => {
    const changed = commit(
      zoomAroundPoint(
        stateRef.current,
        point,
        factor,
        options.minScale,
        options.maxScale,
      ),
    );
    if (factor > 1)
      setStatus(changed ? "Map zoomed in" : "Map at maximum zoom");
    else setStatus(changed ? "Map zoomed out" : "Map at minimum zoom");
  };

  const centre: [number, number] = [width / 2, height / 2];
  const controls: ZoomControlActions = {
    zoomIn: () => zoomBy(options.zoomFactor, centre),
    zoomOut: () => zoomBy(1 / options.zoomFactor, centre),
    reset: () => {
      commit(resetZoomState(options));
      setStatus("Map zoom reset");
    },
  };

  // Wheel zoom only with ctrl / ⌘ held (also how browsers report a trackpad
  // pinch), so scrolling the page over the map still scrolls the page.
  // React's wheel listener is passive, so attach a native one that can call
  // preventDefault.
  const wheelRef = useRef<(event: WheelEvent) => void>();
  wheelRef.current = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const lineHeight = event.deltaMode === 1 ? 16 : 1;
    const delta = event.deltaY * (event.deltaMode === 2 ? height : lineHeight);
    zoomBy(2 ** (-delta / WHEEL_DELTA_PER_DOUBLING), [
      event.clientX - rect.left,
      event.clientY - rect.top,
    ]);
  };
  useEffect(() => {
    const svg = svgRef.current;
    if (!enabled || !svg) return undefined;
    const listener = (event: WheelEvent) => wheelRef.current?.(event);
    svg.addEventListener("wheel", listener, { passive: false });
    return () => svg.removeEventListener("wheel", listener);
  }, [enabled, svgRef]);

  const endDrag = () => {
    if (dragRef.current && dragRef.current.distance > DRAG_THRESHOLD)
      suppressClickRef.current = true;
    dragRef.current = null;
    setDragging(false);
  };

  const legacyHandlers = {
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
      const { scale, translate } = stateRef.current;
      if (scale === 4) {
        commit({ scale: 1, translate: [0, 0] });
      } else {
        commit({
          scale: scale * 2,
          translate: [2 * translate[0] - x, 2 * translate[1] - y],
        });
      }
    },
    // Keyboard equivalents for double-click zoom (WCAG 2.1.1).
    // + / =  → zoom in to the centre of the map
    // - / _  → reset zoom
    onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
      const { scale, translate } = stateRef.current;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (scale < 4) {
          commit({
            scale: scale * 2,
            translate: [
              2 * translate[0] - width / 2,
              2 * translate[1] - height / 2,
            ],
          });
        }
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        commit({ scale: 1, translate: [0, 0] });
      }
    },
  };

  const zoomHandlers = {
    onMouseDown(e: React.MouseEvent) {
      legacyHandlers.onMouseDown(e);
      if (e.button !== 0) return;
      suppressClickRef.current = false;
      dragRef.current = { last: [e.clientX, e.clientY], distance: 0 };
    },
    onMouseMove(e: React.MouseEvent) {
      const drag = dragRef.current;
      if (drag == null) return;
      const delta: [number, number] = [
        e.clientX - drag.last[0],
        e.clientY - drag.last[1],
      ];
      drag.last = [e.clientX, e.clientY];
      drag.distance += Math.abs(delta[0]) + Math.abs(delta[1]);
      if (drag.distance > DRAG_THRESHOLD) setDragging(true);
      commit(panZoomState(stateRef.current, delta));
    },
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    // A drag that ends over a country must not count as a click on it.
    onClickCapture(e: React.MouseEvent) {
      if (!suppressClickRef.current) return;
      suppressClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onDoubleClick(e: React.MouseEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      zoomBy(options.zoomFactor, [e.clientX - rect.left, e.clientY - rect.top]);
    },
    onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
      const panX = width * ARROW_PAN_RATIO;
      const panY = height * ARROW_PAN_RATIO;
      const pans: Record<string, [number, number]> = {
        ArrowUp: [0, panY],
        ArrowDown: [0, -panY],
        ArrowLeft: [panX, 0],
        ArrowRight: [-panX, 0],
      };
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        controls.zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        controls.zoomOut();
      } else if (e.key === "Escape") {
        // Let Escape reach the page (to close a dialog, say) when there is
        // nothing to reset.
        const initial = clampZoomState(resetZoomState(options), viewport);
        if (isSameZoomState(stateRef.current, initial)) return;
        e.preventDefault();
        controls.reset();
      } else if (e.key in pans) {
        // Let the page scroll when the map can't move that way.
        if (commit(panZoomState(stateRef.current, pans[e.key]!)))
          e.preventDefault();
      }
    },
  };

  let svgProps: UseZoomResult["svgProps"] = {};
  if (enabled) {
    svgProps = {
      tabIndex: 0,
      "aria-keyshortcuts": zoomKeyShortcuts,
      "data-zoom-scale": state.scale,
      ...zoomHandlers,
    };
  } else if (richInteraction) {
    // Make the SVG focusable so keyboard users can reach the zoom controls
    // (WCAG 2.1.1).
    svgProps = { tabIndex: 0, "aria-keyshortcuts": "+ -", ...legacyHandlers };
  }

  return {
    options,
    state,
    mapTransform: createMapTransform(viewport, state, projection),
    svgProps,
    controls,
    status,
    layerStyle: dragging ? draggingStyle : transitionStyle,
  };
}
