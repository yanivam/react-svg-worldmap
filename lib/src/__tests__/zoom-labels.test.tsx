import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import WorldMap from "../index.js";
import {
  createRegionLabelCandidate,
  placeMapLabels,
  placeRegionLabels,
} from "../labels/placement.js";
import type {
  DetailProvider,
  RegionCollectionRecord,
  RegionFeatureRecord,
} from "../types.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

const collection: RegionCollectionRecord = {
  countryCode: "CA",
  countryName: "Canada",
  coverageStatus: "complete",
  regions: [
    {
      id: "ca-west",
      countryCode: "CA",
      name: "West",
      path: "M220 215 L300 215 L300 285 L220 285 Z",
      centroid: [260, 250],
      bounds: [
        [220, 215],
        [300, 285],
      ],
    },
    {
      id: "ca-east",
      countryCode: "CA",
      name: "East",
      path: "M320 215 L420 215 L420 285 L320 285 Z",
      centroid: [370, 250],
      bounds: [
        [320, 215],
        [420, 285],
      ],
    },
  ],
};

const provider: DetailProvider = {
  supports: (countryCode) => countryCode.toUpperCase() === "CA",
  loadRegions: () =>
    Promise.resolve({
      status: "ready",
      layer: "regions",
      countryCode: "CA",
      coverageStatus: "complete",
      collection,
    }),
};

function getCountryLabelFontSize(
  container: HTMLElement,
  countryName: string,
): number {
  const label = Array.from(container.querySelectorAll("text")).find(
    (text) => text.textContent?.startsWith(countryName),
  );

  expect(label).toBeDefined();
  return Number(label!.getAttribute("font-size"));
}

describe("WorldMap zoom labels", () => {
  it("does not render default country labels when zoom is omitted", () => {
    const { container } = render(<WorldMap data={DATA} />);

    expect(container.querySelector("text")).toBeNull();
  });

  it("renders default country labels when zoom is enabled", () => {
    const { container } = render(
      <WorldMap data={DATA} size={1200} zoom={{ initialScale: 4 }} />,
    );

    expect(
      Array.from(container.querySelectorAll("text")).some(
        (label) => label.textContent?.startsWith("United States"),
      ),
    ).toBe(true);
  });

  it("can hide default country labels through zoom options", () => {
    const { container } = render(
      <WorldMap data={DATA} size={640} zoom={{ showCountryLabels: false }} />,
    );

    expect(container.querySelector("text")).toBeNull();
  });

  it("uses clamped zoom-aware country label sizing by default", () => {
    const lowZoom = render(
      <WorldMap data={DATA} size={960} zoom={{ initialScale: 4 }} />,
    );
    const highZoom = render(
      <WorldMap data={DATA} size={960} zoom={{ initialScale: 64 }} />,
    );

    const lowZoomScreenFontSize =
      getCountryLabelFontSize(lowZoom.container, "United States") * 4;
    const highZoomScreenFontSize =
      getCountryLabelFontSize(highZoom.container, "United States") * 64;

    expect(lowZoomScreenFontSize).toBeGreaterThan(12);
    expect(highZoomScreenFontSize).toBeCloseTo(20);

    lowZoom.unmount();
    highZoom.unmount();
  });

  it("respects country label size overrides", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={960}
        zoom={{
          initialScale: 16,
          countryLabelMinFontSize: 10,
          countryLabelMaxFontSize: 14,
          countryLabelZoomGrowthRate: 1,
        }}
      />,
    );

    expect(
      getCountryLabelFontSize(container, "United States") * 16,
    ).toBeCloseTo(14);
  });

  it("renders supplied pins at longitude and latitude positions", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        pins={[
          {
            id: "washington-dc",
            countryCode: "US",
            kind: "capital",
            caption: "Washington, DC (capital)",
            coordinates: [-77.0163, 38.9047],
          },
        ]}
        zoom={{ initialScale: 4 }}
      />,
    );

    expect(
      container.querySelector(
        '[data-map-pin="capital"][data-country-code="US"]',
      ),
    ).not.toBeNull();
    expect(screen.getByText("Washington, DC (capital)")).toBeInTheDocument();
  });

  it("does not render pins unless consumers supply them", () => {
    const { container } = render(
      <WorldMap data={DATA} size={1200} zoom={{ initialScale: 4 }} />,
    );

    expect(container.querySelector("[data-map-pin]")).toBeNull();
  });

  it("can hide supplied pins through zoom options", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        pins={[
          {
            caption: "Hidden pin",
            coordinates: [-77.0163, 38.9047],
          },
        ]}
        zoom={{ initialScale: 4, showPins: false }}
      />,
    );

    expect(container.querySelector("[data-map-pin]")).toBeNull();
  });

  it("creates region label candidates using bounds and centroid fit", () => {
    const region: RegionFeatureRecord = {
      id: "us-ca",
      countryCode: "US",
      name: "California",
      kind: "state",
      path: "M0 0 L100 0 L100 80 L0 80 Z",
      centroid: [50, 40],
      bounds: [
        [0, 0],
        [100, 80],
      ],
    };

    expect(createRegionLabelCandidate(region, 10)).toMatchObject({
      regionId: "us-ca",
      countryCode: "US",
      label: "California",
      x: 50,
      y: 40,
    });
  });

  it("hides region label candidates that cannot fit their bounds", () => {
    const region: RegionFeatureRecord = {
      id: "us-ri",
      countryCode: "US",
      name: "Rhode Island",
      path: "M0 0 L10 0 L10 5 L0 5 Z",
      centroid: [5, 2.5],
      bounds: [
        [0, 0],
        [10, 5],
      ],
    };

    expect(createRegionLabelCandidate(region, 12)).toBeUndefined();
  });

  it("places region labels without accepting colliding lower-priority labels", () => {
    const large = createRegionLabelCandidate(
      {
        id: "large",
        countryCode: "US",
        name: "Large Region",
        path: "M0 0 L200 0 L200 100 L0 100 Z",
        centroid: [100, 50],
        bounds: [
          [0, 0],
          [200, 100],
        ],
      },
      10,
    );
    const colliding = createRegionLabelCandidate(
      {
        id: "small",
        countryCode: "US",
        name: "Small",
        path: "M80 35 L130 35 L130 70 L80 70 Z",
        centroid: [105, 52],
        bounds: [
          [80, 35],
          [130, 70],
        ],
      },
      10,
    );

    expect(
      placeRegionLabels([colliding, large]).map((label) => label.regionId),
    ).toEqual(["large"]);
  });

  it("handles representative large, dense, and island region label fixtures deterministically", () => {
    const fixtures: RegionFeatureRecord[] = [
      {
        id: "large-west",
        countryCode: "BR",
        name: "Large West",
        path: "M0 0 L240 0 L240 120 L0 120 Z",
        centroid: [120, 60],
        bounds: [
          [0, 0],
          [240, 120],
        ],
      },
      {
        id: "large-east",
        countryCode: "BR",
        name: "Large East",
        path: "M300 0 L540 0 L540 120 L300 120 Z",
        centroid: [420, 60],
        bounds: [
          [300, 0],
          [540, 120],
        ],
      },
      {
        id: "dense-major",
        countryCode: "BE",
        name: "Dense Major",
        path: "M0 170 L150 170 L150 230 L0 230 Z",
        centroid: [75, 200],
        bounds: [
          [0, 170],
          [150, 230],
        ],
      },
      {
        id: "dense-minor",
        countryCode: "BE",
        name: "Dense Minor",
        path: "M40 178 L118 178 L118 222 L40 222 Z",
        centroid: [79, 201],
        bounds: [
          [40, 178],
          [118, 222],
        ],
      },
      {
        id: "island-visible",
        countryCode: "FM",
        name: "Yap",
        path: "M260 170 L340 170 L340 230 L260 230 Z",
        centroid: [300, 200],
        bounds: [
          [260, 170],
          [340, 230],
        ],
      },
      {
        id: "island-hidden",
        countryCode: "FM",
        name: "Pohnpei",
        path: "M380 190 L395 190 L395 200 L380 200 Z",
        centroid: [387, 195],
        bounds: [
          [380, 190],
          [395, 200],
        ],
      },
    ];

    const labels = placeRegionLabels(
      fixtures.map((fixture) => createRegionLabelCandidate(fixture, 10)),
    );

    expect(labels.map((label) => label.regionId)).toEqual([
      "dense-major",
      "large-east",
      "large-west",
      "island-visible",
    ]);
    expect(labels).not.toContainEqual(
      expect.objectContaining({ regionId: "dense-minor" }),
    );
    expect(labels).not.toContainEqual(
      expect.objectContaining({ regionId: "island-hidden" }),
    );
  });

  it("does not load or show region labels below 4x", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        zoom={{ initialScale: 2 }}
        detailLevel="regions"
        detailProvider={provider}
      />,
    );

    await waitFor(() =>
      expect(container.querySelector("[data-region-id]")).toBeNull(),
    );
    expect(
      Array.from(container.querySelectorAll("text")).some(
        (label) => label.textContent === "West",
      ),
    ).toBe(false);
  });

  it("shows readable region labels at 4x", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={provider}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector("[data-region-id='ca-west']"),
      ).not.toBeNull();
    });
    expect(
      Array.from(container.querySelectorAll("text")).some(
        (label) => label.textContent === "West",
      ),
    ).toBe(true);
  });

  it("keeps country labels over colliding region labels at 4x", () => {
    const labels = placeMapLabels({
      countryCandidates: [
        {
          countryCode: "CA",
          countryName: "Canada",
          label: "Canada",
          x: 100,
          y: 100,
          width: 80,
          height: 16,
          availableWidth: 300,
          availableHeight: 200,
          priority: 60000,
        },
      ],
      regionCandidates: [
        {
          regionId: "ca-collision",
          countryCode: "CA",
          regionName: "Collision",
          label: "Collision",
          x: 100,
          y: 100,
          width: 70,
          height: 12,
          availableWidth: 160,
          availableHeight: 80,
          priority: 12800,
        },
      ],
      scale: 4,
    });

    expect(labels.countryLabels.map((label) => label.countryName)).toEqual([
      "Canada",
    ]);
    expect(labels.regionLabels).toEqual([]);
  });

  it("prefers colliding region labels over country labels at 6x", () => {
    const labels = placeMapLabels({
      countryCandidates: [
        {
          countryCode: "CA",
          countryName: "Canada",
          label: "Canada",
          x: 100,
          y: 100,
          width: 80,
          height: 16,
          availableWidth: 300,
          availableHeight: 200,
          priority: 60000,
        },
      ],
      regionCandidates: [
        {
          regionId: "ca-collision",
          countryCode: "CA",
          regionName: "Collision",
          label: "Collision",
          x: 100,
          y: 100,
          width: 70,
          height: 12,
          availableWidth: 160,
          availableHeight: 80,
          priority: 12800,
        },
      ],
      scale: 6,
    });

    expect(labels.countryLabels).toEqual([]);
    expect(labels.regionLabels.map((label) => label.regionId)).toEqual([
      "ca-collision",
    ]);
  });
});
