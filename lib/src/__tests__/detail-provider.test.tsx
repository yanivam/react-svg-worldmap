import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import WorldMap, {
  createFailedDetailResult,
  createIdleDetailResult,
  createReadyDetailResult,
  createUnavailableDetailResult,
} from "../index.js";
import type {
  DetailProvider,
  DetailProviderResult,
  Props,
  RegionCollectionRecord,
} from "../types.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "US", value: 1 }] as const;

const collection: RegionCollectionRecord = {
  countryCode: "CA",
  countryName: "Canada",
  coverageStatus: "experimental",
  regions: [
    {
      id: "ca-test-region",
      countryCode: "CA",
      name: "Test Region",
      path: "M220 215 L300 215 L300 285 L220 285 Z",
      centroid: [260, 250],
      bounds: [
        [220, 215],
        [300, 285],
      ],
    },
    {
      id: "ca-second-region",
      countryCode: "CA",
      name: "Second Region",
      path: "M320 215 L400 215 L400 285 L320 285 Z",
      centroid: [360, 250],
      bounds: [
        [320, 215],
        [400, 285],
      ],
    },
  ],
};

function provider(
  result = createReadyDetailResult(collection),
): DetailProvider {
  return {
    supports: (countryCode) => countryCode.toUpperCase() === "CA",
    getCoverage: () => [
      {
        countryCode: "CA",
        countryName: "Canada",
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
    expect(createUnavailableDetailResult("CA")).toMatchObject({
      status: "unavailable",
      countryCode: "CA",
    });
    expect(createFailedDetailResult("CA")).toMatchObject({
      status: "failed",
      countryCode: "CA",
    });
  });
});

describe("WorldMap region detail", () => {
  it("does not expose showRegionList in public props", () => {
    type PublicPropKeys = keyof Props;
    const showRegionListRemoved: "showRegionList" extends PublicPropKeys
      ? false
      : true = true;

    expect(showRegionListRemoved).toBe(true);
  });

  it("does not load region detail when the map is in country mode", async () => {
    const onDetailStatusChange =
      vi.fn<(status: DetailProviderResult) => void>();
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

  it("renders supported region boundaries without a below-map list", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider()}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector("[data-region-id='ca-test-region']"),
      ).not.toBeNull();
    });
    expect(
      container
        .querySelector("[data-region-id='ca-test-region'] title")
        ?.textContent?.includes("Test Region"),
    ).toBe(true);
    expect(screen.queryByText("Canada regions")).not.toBeInTheDocument();
    expect(screen.queryByText("Coverage: experimental (2/2)")).toBeNull();
  });

  it("exposes single-region collections without drawing an internal boundary", async () => {
    const singleRegionCollection: RegionCollectionRecord = {
      countryCode: "CA",
      countryName: "Canada",
      coverageStatus: "complete",
      expectedRegionCount: 1,
      regions: [
        {
          id: "ca-single",
          countryCode: "CA",
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
        size={400}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider(
          createReadyDetailResult(singleRegionCollection),
        )}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Region detail ready")).toBeInTheDocument();
    });
    expect(container.querySelector("[data-region-id='ca-single']")).toBeNull();
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
        zoom={{ initialScale: 4 }}
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

  it("ignores malformed region geometry while keeping country rendering", async () => {
    const malformedCollection: RegionCollectionRecord = {
      countryCode: "CA",
      countryName: "Canada",
      coverageStatus: "complete",
      regions: [
        {
          id: "malformed-region",
          countryCode: "CA",
          name: "Malformed Region",
          path: "not a path",
          centroid: [260, 250],
          bounds: [
            [220, 215],
            [300, 285],
          ],
        },
        {
          id: "empty-region",
          countryCode: "CA",
          name: "Empty Region",
          path: "",
          centroid: [360, 250],
          bounds: [
            [320, 215],
            [400, 285],
          ],
        },
      ],
    };
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider(createReadyDetailResult(malformedCollection))}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Region detail ready")).toBeInTheDocument();
    });
    expect(container.querySelector("[data-region-id]")).toBeNull();
    expect(container.querySelector("[data-country-code='US']")).not.toBeNull();
  });

  it("falls back when provider loading fails", async () => {
    const onDetailStatusChange = vi.fn();
    const failingProvider: DetailProvider = {
      supports: (countryCode) => countryCode.toUpperCase() === "CA",
      loadRegions: () => Promise.reject(new Error("failed")),
    };

    render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 4 }}
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

  it("does not load region detail below 4x", async () => {
    const onDetailStatusChange = vi.fn();
    const detailProvider = provider();
    const loadRegions = vi.spyOn(detailProvider, "loadRegions");

    render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 2 }}
        detailLevel="regions"
        detailProvider={detailProvider}
        onDetailStatusChange={onDetailStatusChange}
      />,
    );

    await waitFor(() => {
      expect(onDetailStatusChange).toHaveBeenCalledWith({
        status: "unavailable",
        layer: "regions",
        warning: "Region detail appears at 4x zoom.",
      });
    });
    expect(loadRegions).not.toHaveBeenCalled();
  });
});
