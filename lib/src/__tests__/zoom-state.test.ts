import { describe, expect, it } from "vitest";

import {
  clampZoomState,
  createInitialZoomState,
  isSameZoomState,
  panZoomState,
  resetZoomState,
  resolveZoomOptions,
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

  it("defaults to a maximum scale of 8", () => {
    expect(resolveZoomOptions(true).maxScale).toBe(8);
    expect(resolveZoomOptions({}).maxScale).toBe(8);
    expect(resolveZoomOptions(undefined).maxScale).toBe(8);
  });

  it("never resolves a maximum below the minimum", () => {
    expect(resolveZoomOptions({ minScale: 2, maxScale: 1 }).maxScale).toBe(2);
  });

  it("does not zoom in above the maximum scale", () => {
    const state = zoomAroundPoint(
      { scale: 6, translate: [0, 0] },
      [100, 50],
      2,
      1,
      8,
    );

    expect(state.scale).toBe(8);
    expect(state.translate[0]).toBeCloseTo(-100 / 3);
    expect(state.translate[1]).toBeCloseTo(-50 / 3);

    const atMax = zoomAroundPoint(state, [100, 50], 2, 1, 8);
    expect(isSameZoomState(atMax, state)).toBe(true);
  });

  it("clamps the initial scale between the minimum and maximum", () => {
    expect(
      createInitialZoomState(resolveZoomOptions({ initialScale: 20 })).scale,
    ).toBe(8);
    expect(
      createInitialZoomState(
        resolveZoomOptions({ initialScale: 0.5, minScale: 1 }),
      ).scale,
    ).toBe(1);
  });

  it("can be turned off with enabled: false", () => {
    expect(resolveZoomOptions({ enabled: false }).enabled).toBe(false);
    expect(resolveZoomOptions(false).enabled).toBe(false);
  });

  it("compares states by value", () => {
    expect(
      isSameZoomState(
        { scale: 2, translate: [1, 2] },
        { scale: 2, translate: [1, 2] },
      ),
    ).toBe(true);
    expect(
      isSameZoomState(
        { scale: 2, translate: [1, 2] },
        { scale: 2, translate: [1, 3] },
      ),
    ).toBe(false);
  });
});
