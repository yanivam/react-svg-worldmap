import { describe, expect, it } from "vitest";

import {
  createInitialZoomState,
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
    const options = resolveZoomOptions(true);
    const panned = panZoomState({ scale: 2, translate: [0, 0] }, [10, -5]);

    expect(panned).toEqual({ scale: 2, translate: [10, -5] });
    expect(resetZoomState(options)).toEqual({ scale: 1, translate: [0, 0] });
  });
});
