import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorldMap from "../index.js";
import type { DetailProvider, DetailProviderResult } from "../types.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "US", value: 100 }] as const;

interface ZoomResponsivenessReport {
  scenarioName: string;
  sampleCount: number;
  typicalFeedbackMs: number;
  maximumCompletionMs: number;
  passed: boolean;
  failureMessage?: string;
}

function createZoomResponsivenessReport({
  scenarioName,
  feedbackSamples,
  completionSamples,
}: {
  scenarioName: string;
  feedbackSamples: number[];
  completionSamples: number[];
}): ZoomResponsivenessReport {
  const sortedFeedback = [...feedbackSamples].sort(
    (left, right) => left - right,
  );
  const typicalIndex = Math.max(0, Math.ceil(sortedFeedback.length * 0.9) - 1);
  const typicalFeedbackMs = sortedFeedback[typicalIndex] ?? 0;
  const maximumCompletionMs = Math.max(0, ...completionSamples);
  const passed = typicalFeedbackMs <= 250 && maximumCompletionMs <= 500;

  return {
    scenarioName,
    sampleCount: Math.min(feedbackSamples.length, completionSamples.length),
    typicalFeedbackMs,
    maximumCompletionMs,
    passed,
    ...(passed
      ? {}
      : {
          failureMessage: `${scenarioName} missed zoom responsiveness targets: typical feedback ${typicalFeedbackMs}ms, maximum completion ${maximumCompletionMs}ms.`,
        }),
  };
}

interface RafHarness {
  runNextFrame: () => void;
  runAllFrames: () => void;
}

function installRafHarness(): RafHarness {
  let nextId = 1;
  const cancelled = new Set<number>();
  const callbacks = new Map<number, FrameRequestCallback>();

  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => {
      cancelled.add(id);
      callbacks.delete(id);
    }),
  );

  return {
    runNextFrame() {
      const nextCallback = callbacks.entries().next();
      if (nextCallback.done === true) return;

      const [id, callback] = nextCallback.value;
      callbacks.delete(id);
      if (cancelled.has(id)) return;
      callback(16);
    },
    runAllFrames() {
      while (callbacks.size > 0) this.runNextFrame();
    },
  };
}

function getSvg(container: HTMLElement): SVGSVGElement {
  return container.querySelector('svg[role="img"]')!;
}

function getCountriesLayer(container: HTMLElement): SVGGElement {
  return container.querySelector('[data-map-layer="countries"]')!;
}

function createRegionProvider(): DetailProvider {
  const result: DetailProviderResult = {
    status: "ready",
    layer: "regions",
    countryCode: "CA",
    collection: {
      countryCode: "CA",
      countryName: "Canada",
      coverageStatus: "experimental",
      regions: [
        {
          id: "ca-test-region",
          countryCode: "CA",
          name: "Test Region",
          path: "M220 215 L300 215 L300 285 L220 285 Z",
        },
        {
          id: "ca-second-region",
          countryCode: "CA",
          name: "Second Region",
          path: "M320 215 L400 215 L400 285 L320 285 Z",
        },
      ],
    },
  };

  return {
    supports: (countryCode) => countryCode.toUpperCase() === "CA",
    loadRegions: vi.fn(() => Promise.resolve(result)),
  };
}

describe("WorldMap zoom performance staging", () => {
  let raf: RafHarness = {
    runNextFrame: () => undefined,
    runAllFrames: () => undefined,
  };

  beforeEach(() => {
    raf = installRafHarness();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows zoom feedback before deferred detail catches up", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    const countriesLayer = getCountriesLayer(container);
    const initialTransform = countriesLayer.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(countriesLayer.getAttribute("transform")).not.toBe(initialTransform);
    expect(svg).toHaveAttribute("data-zoom-render-phase", "immediate-feedback");
    expect(svg).toHaveAttribute("data-zoom-scale", "2");
    expect(svg).toHaveAttribute("data-detail-zoom-scale", "1");

    act(() => {
      raf.runNextFrame();
    });

    expect(svg).toHaveAttribute("data-zoom-render-phase", "complete");
    expect(svg).toHaveAttribute("data-detail-zoom-scale", "2");
  });

  it("keeps the latest requested zoom when clicks happen before detail settles", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const svg = getSvg(container);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(svg).toHaveAttribute("data-zoom-scale", "4");
    expect(svg).toHaveAttribute("data-detail-zoom-scale", "1");

    act(() => {
      raf.runAllFrames();
    });

    expect(svg).toHaveAttribute("data-zoom-render-phase", "complete");
    expect(svg).toHaveAttribute("data-detail-zoom-scale", "4");
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 4 }),
    );
  });

  it("defers optional region loading until after immediate zoom feedback", async () => {
    const detailProvider = createRegionProvider();
    const loadRegions = vi.spyOn(detailProvider, "loadRegions");
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 2 }}
        detailLevel="regions"
        detailProvider={detailProvider}
      />,
    );
    const svg = getSvg(container);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(svg).toHaveAttribute("data-zoom-scale", "4");
    expect(svg).toHaveAttribute("data-detail-zoom-scale", "2");
    expect(loadRegions).not.toHaveBeenCalled();

    act(() => {
      raf.runNextFrame();
    });

    await waitFor(() => {
      expect(loadRegions).toHaveBeenCalled();
    });
  });

  it("reports pass/fail timing shape for representative scenarios", () => {
    expect(
      createZoomResponsivenessReport({
        scenarioName: "full-world zoom",
        feedbackSamples: [48, 71, 92, 110, 160],
        completionSamples: [180, 220, 260, 320, 410],
      }),
    ).toEqual({
      scenarioName: "full-world zoom",
      sampleCount: 5,
      typicalFeedbackMs: 160,
      maximumCompletionMs: 410,
      passed: true,
    });
  });

  it("reports a clear failure message when timing targets are missed", () => {
    expect(
      createZoomResponsivenessReport({
        scenarioName: "region detail zoom",
        feedbackSamples: [240, 260, 300],
        completionSamples: [400, 510, 650],
      }),
    ).toMatchObject({
      scenarioName: "region detail zoom",
      sampleCount: 3,
      typicalFeedbackMs: 300,
      maximumCompletionMs: 650,
      passed: false,
      failureMessage:
        "region detail zoom missed zoom responsiveness targets: typical feedback 300ms, maximum completion 650ms.",
    });
  });
});
