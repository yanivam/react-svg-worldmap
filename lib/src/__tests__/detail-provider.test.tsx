import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import WorldMap, {
  createFailedDetailResult,
  createIdleDetailResult,
  createReadyDetailResult,
  createUnavailableDetailResult,
  isReadyDetailResult,
} from "../index.js";
import type {
  DetailProvider,
  DetailProviderResult,
  RegionCollection,
} from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us" as const, value: 1 }];

// Two boxes in western Canada, in [longitude, latitude] (clockwise).
const box = (west: number, south: number, east: number, north: number) => ({
  type: "Polygon" as const,
  coordinates: [
    [
      [west, south],
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ],
  ],
});
const canada: RegionCollection = {
  countryCode: "CA",
  countryName: "Canada",
  coverageStatus: "experimental",
  regions: [
    {
      id: "ca-a",
      countryCode: "CA",
      name: "Region A",
      geometry: box(-125, 50, -115, 60),
    },
    {
      id: "ca-b",
      countryCode: "CA",
      name: "Region B",
      geometry: box(-115, 50, -105, 60),
    },
  ],
};

function makeProvider(
  load: DetailProvider["loadRegions"] = () =>
    Promise.resolve(createReadyDetailResult(canada)),
) {
  const loadRegions = vi.fn(load);
  const provider: DetailProvider = {
    supports: (code) => code.toUpperCase() === "CA",
    loadRegions,
  };
  return { provider, loadRegions };
}

const regionPaths = (container: HTMLElement) =>
  container.querySelectorAll('[data-map-sublayer="regions"] path');

describe("detail provider helpers", () => {
  it("builds results for each status", () => {
    expect(createIdleDetailResult()).toEqual({
      status: "idle",
      layer: "regions",
    });
    expect(createUnavailableDetailResult("CA")).toEqual({
      status: "unavailable",
      layer: "regions",
      countryCode: "CA",
      warning: "Region detail is unavailable.",
    });
    expect(createFailedDetailResult(undefined, "nope")).toEqual({
      status: "failed",
      layer: "regions",
      warning: "nope",
    });
    const ready = createReadyDetailResult(canada);
    expect(ready).toMatchObject({
      status: "ready",
      countryCode: "CA",
      coverageStatus: "experimental",
    });
    expect(isReadyDetailResult(ready)).toBe(true);
    expect(isReadyDetailResult(createIdleDetailResult())).toBe(false);
  });
});

describe('detailLevel="regions"', () => {
  it("loads and draws the regions of a country in view once zoomed in", async () => {
    const { provider, loadRegions } = makeProvider();
    const statuses: DetailProviderResult["status"][] = [];
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider}
        onDetailStatusChange={(result) => statuses.push(result.status)}
      />,
    );
    await waitFor(() => expect(regionPaths(container)).toHaveLength(2));
    expect(loadRegions).toHaveBeenCalledTimes(1);
    expect(loadRegions).toHaveBeenCalledWith("CA");
    expect(statuses).toEqual(["loading", "ready"]);

    const [first] = regionPaths(container);
    expect(first).toHaveAttribute("data-region-id", "ca-a");
    expect(first).toHaveAttribute("data-country-code", "CA");
    expect(first).toHaveAttribute("stroke-dasharray", "3 2");
    expect(first!.getAttribute("d")).toMatch(/^M/);
  });

  it("does not loop when the parent stores each status", async () => {
    const { provider, loadRegions } = makeProvider();
    let calls = 0;
    function Parent() {
      const [, setStatus] = React.useState<DetailProviderResult>();
      return (
        <WorldMap
          data={DATA}
          size={640}
          zoom={{ initialScale: 4 }}
          detailLevel="regions"
          detailProvider={provider}
          onDetailStatusChange={(result) => {
            calls += 1;
            setStatus({ ...result });
          }}
        />
      );
    }
    const { container } = render(<Parent />);
    await waitFor(() => expect(regionPaths(container)).toHaveLength(2));
    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 20);
        }),
    );
    expect(calls).toBe(2);
    expect(loadRegions).toHaveBeenCalledTimes(1);
  });

  it("waits for regionDetailMinScale and reports idle when zoomed out", async () => {
    const { provider, loadRegions } = makeProvider();
    const onStatus = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        zoom={{ initialScale: 2 }}
        detailLevel="regions"
        detailProvider={provider}
        onDetailStatusChange={onStatus}
      />,
    );
    await act(() => Promise.resolve());
    expect(loadRegions).not.toHaveBeenCalled();
    expect(onStatus).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(regionPaths(container)).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(regionPaths(container)).toHaveLength(0);
    expect(onStatus).toHaveBeenLastCalledWith(createIdleDetailResult());

    // Cached: zooming in again does not ask the provider again.
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(regionPaths(container)).toHaveLength(2));
    expect(loadRegions).toHaveBeenCalledTimes(1);
  });

  it("reports a failed load and draws nothing", async () => {
    const { provider } = makeProvider(() => Promise.reject(new Error("x")));
    const onStatus = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider}
        onDetailStatusChange={onStatus}
      />,
    );
    await waitFor(() =>
      expect(onStatus).toHaveBeenLastCalledWith(createFailedDetailResult("CA")),
    );
    expect(regionPaths(container)).toHaveLength(0);
  });

  it("does nothing without zoom or with the default detailLevel", async () => {
    const { provider, loadRegions } = makeProvider();
    render(
      <WorldMap
        data={DATA}
        size={640}
        detailLevel="regions"
        detailProvider={provider}
      />,
    );
    render(
      <WorldMap
        data={DATA}
        size={640}
        zoom={{ initialScale: 8 }}
        detailProvider={provider}
      />,
    );
    await act(() => Promise.resolve());
    expect(loadRegions).not.toHaveBeenCalled();
  });

  it("projects regions with the current projection", async () => {
    const { provider } = makeProvider();
    const paths: Record<string, string | null> = {};
    for (const projection of ["mercator", "equalEarth"] as const) {
      const { container, unmount } = render(
        <WorldMap
          data={DATA}
          size={640}
          projection={projection}
          zoom={{ initialScale: 4 }}
          detailLevel="regions"
          detailProvider={provider}
        />,
      );
      await waitFor(() => expect(regionPaths(container)).toHaveLength(2));
      paths[projection] = regionPaths(container)[0]!.getAttribute("d");
      unmount();
    }
    expect(paths.mercator).not.toBe(paths.equalEarth);
  });
});
