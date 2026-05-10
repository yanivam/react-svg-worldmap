import { describe, expect, it } from "vitest";

import {
  clampZoomState,
  createInitialZoomRenderState,
  createInitialZoomState,
  panZoomState,
  requestZoomRenderState,
  resetZoomState,
  resolveZoomOptions,
  settleZoomRenderState,
  zoomAroundPoint,
} from "../zoom/state.js";

describe("zoom state", () => {
  it("is disabled when zoom props are omitted", () => {
    expect(resolveZoomOptions(undefined).enabled).toBe(false);
  });

  it("enables defaults for zoom=true", () => {
    const options = resolveZoomOptions(true);

    expect(options.enabled).toBe(true);
    expect(options.zoomFactor).toBe(2);
    expect(options.showControls).toBe(true);
    expect(options.showCountryLabels).toBe(true);
  });

  it("creates an initial state from options", () => {
    const options = resolveZoomOptions({ initialScale: 2 });

    expect(createInitialZoomState(options)).toEqual({
      scale: 2,
      translate: [0, 0],
    });
  });

  it("zooms around a point without a fixed maximum scale", () => {
    const options = resolveZoomOptions({ zoomFactor: 2 });
    const state = zoomAroundPoint(
      { scale: 8, translate: [0, 0] },
      [100, 50],
      options.zoomFactor,
      options.minScale,
    );

    expect(state.scale).toBe(16);
    expect(state.translate).toEqual([-100, -50]);
  });

  it("uses the resolved zoom factor for zoom-in point math", () => {
    const options = resolveZoomOptions({ zoomFactor: 1.75 });
    const state = zoomAroundPoint(
      { scale: 2, translate: [20, -10] },
      [120, 80],
      options.zoomFactor,
      options.minScale,
    );

    expect(state).toEqual({
      scale: 3.5,
      translate: [-55, -77.5],
    });
  });

  it("does not zoom out below the minimum scale", () => {
    const state = zoomAroundPoint(
      { scale: 1, translate: [10, 10] },
      [100, 50],
      0.5,
      1,
    );

    expect(state.scale).toBe(1);
  });

  it("pans by delta and resets to initial state", () => {
    const options = resolveZoomOptions({ initialScale: 1.5 });
    const panned = panZoomState({ scale: 2, translate: [0, 0] }, [10, -5]);

    expect(panned).toEqual({ scale: 2, translate: [10, -5] });
    expect(resetZoomState(options)).toEqual({ scale: 1.5, translate: [0, 0] });
  });

  it("keeps the map framed at minimum zoom", () => {
    const state = clampZoomState(
      { scale: 1, translate: [200, -100] },
      { width: 400, height: 300 },
    );

    expect(state).toEqual({ scale: 1, translate: [0, 0] });
  });

  it("clamps panning at zoomed bounds", () => {
    const state = clampZoomState(
      { scale: 2, translate: [-900, 50] },
      { width: 400, height: 300 },
    );

    expect(state).toEqual({ scale: 2, translate: [-400, 0] });
  });

  it("centers content when it is smaller than the viewport", () => {
    const state = clampZoomState(
      { scale: 0.5, translate: [100, 100] },
      { width: 400, height: 300 },
    );

    expect(state).toEqual({ scale: 0.5, translate: [100, 75] });
  });

  it("tracks immediate interaction zoom separately from deferred detail zoom", () => {
    const initial = createInitialZoomRenderState(resolveZoomOptions(true));
    const requested = requestZoomRenderState(initial, {
      scale: 2,
      translate: [-100, -50],
    });

    expect(requested).toMatchObject({
      interaction: { scale: 2, translate: [-100, -50] },
      detail: { scale: 1, translate: [0, 0] },
      phase: "immediate-feedback",
      requestId: 1,
    });

    expect(settleZoomRenderState(requested, 1)).toMatchObject({
      interaction: { scale: 2, translate: [-100, -50] },
      detail: { scale: 2, translate: [-100, -50] },
      phase: "complete",
    });
  });

  it("ignores stale deferred detail settlements", () => {
    const initial = createInitialZoomRenderState(resolveZoomOptions(true));
    const requested = requestZoomRenderState(initial, {
      scale: 2,
      translate: [-100, -50],
    });

    expect(settleZoomRenderState(requested, 0)).toBe(requested);
  });
});
