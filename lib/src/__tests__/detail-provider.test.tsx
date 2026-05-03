import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import WorldMap, {
  createFailedDetailResult,
  createIdleDetailResult,
  createReadyDetailResult,
  createUnavailableDetailResult,
} from "../index.js";
import type { DetailProvider, RegionCollectionRecord } from "../types.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "US", value: 1 }] as const;

const collection: RegionCollectionRecord = {
  countryCode: "US",
  countryName: "United States",
  coverageStatus: "experimental",
  regions: [
    {
      id: "us-test-region",
      countryCode: "US",
      name: "Test Region",
      path: "M220 215 L300 215 L300 285 L220 285 Z",
      centroid: [260, 250],
    },
    {
      id: "us-second-region",
      countryCode: "US",
      name: "Second Region",
      path: "M320 215 L400 215 L400 285 L320 285 Z",
      centroid: [360, 250],
    },
  ],
};

function provider(
  result = createReadyDetailResult(collection),
): DetailProvider {
  return {
    supports: (countryCode) => countryCode.toUpperCase() === "US",
    getCoverage: () => [
      {
        countryCode: "US",
        countryName: "United States",
        status: "experimental",
        regionCount: 1,
      },
    ],
    loadRegions: () => Promise.resolve(result),
  };
}

describe("detail provider state helpers", () => {
  it("creates idle, ready, unavailable, and failed results", () => {
    expect(createIdleDetailResult()).toMatchObject({ status: "idle" });
    expect(createReadyDetailResult(collection)).toMatchObject({
      status: "ready",
      collection,
    });
    expect(createUnavailableDetailResult("US")).toMatchObject({
      status: "unavailable",
      countryCode: "US",
    });
    expect(createFailedDetailResult("US")).toMatchObject({
      status: "failed",
      countryCode: "US",
    });
  });
});

describe("WorldMap region detail", () => {
  it("does not load region detail when the map is in country mode", async () => {
    const onDetailStatusChange = vi.fn();
    const detailProvider = provider();
    const loadRegions = vi.spyOn(detailProvider, "loadRegions");

    render(
      <WorldMap
        data={DATA}
        zoom
        detailLevel="countries"
        detailProvider={detailProvider}
        onDetailStatusChange={onDetailStatusChange}
      />,
    );

    await waitFor(() => {
      expect(onDetailStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: "idle" }),
      );
    });
    expect(loadRegions).not.toHaveBeenCalled();
  });

  it("renders supported region boundaries and labels", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom
        detailLevel="regions"
        detailProvider={provider()}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector("[data-region-id='us-test-region']"),
      ).not.toBeNull();
    });
    expect(screen.getAllByText("Test Region").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Visible regions for United States"),
    ).toBeInTheDocument();
  });

  it("exposes single-region collections without drawing an internal boundary", async () => {
    const singleRegionCollection: RegionCollectionRecord = {
      countryCode: "US",
      countryName: "United States",
      coverageStatus: "complete",
      expectedRegionCount: 1,
      regions: [
        {
          id: "us-single",
          countryCode: "US",
          name: "Single Region",
          path: "M220 215 L300 215 L300 285 L220 285 Z",
          centroid: [260, 250],
          bounds: [
            [220, 215],
            [300, 285],
          ],
        },
      ],
    };
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom
        detailLevel="regions"
        detailProvider={provider(
          createReadyDetailResult(singleRegionCollection),
        )}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Single Region")).toBeInTheDocument();
    });
    expect(container.querySelector("[data-region-id='us-single']")).toBeNull();
  });

  it("falls back when provider data is unavailable", async () => {
    const onDetailStatusChange = vi.fn();
    const unsupportedProvider: DetailProvider = {
      supports: () => false,
      loadRegions: () => Promise.resolve(createUnavailableDetailResult("US")),
    };
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom
        detailLevel="regions"
        detailProvider={unsupportedProvider}
        onDetailStatusChange={onDetailStatusChange}
      />,
    );

    await waitFor(() => {
      expect(onDetailStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: "unavailable" }),
      );
    });
    expect(container.querySelector("[data-region-id]")).toBeNull();
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("falls back when provider loading fails", async () => {
    const onDetailStatusChange = vi.fn();
    const failingProvider: DetailProvider = {
      supports: () => true,
      loadRegions: () => Promise.reject(new Error("failed")),
    };

    render(
      <WorldMap
        data={DATA}
        zoom
        detailLevel="regions"
        detailProvider={failingProvider}
        onDetailStatusChange={onDetailStatusChange}
      />,
    );

    await waitFor(() => {
      expect(onDetailStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: "failed" }),
      );
    });
  });
});
