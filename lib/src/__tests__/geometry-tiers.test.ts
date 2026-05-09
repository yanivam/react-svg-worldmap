import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import WorldMap from "../index.js";
import { mapRenderingLayers } from "../types.js";
import {
  getCountryGeometryTierName,
  getGeometryTierParseGuards,
  loadDetailedCountryGeometry,
  reducedCountryGeometryTier,
  resetGeometryTierParseGuardsForTests,
  shouldLoadDetailedCountryGeometry,
  shouldLoadRegionGeometry,
} from "../map-data/geometry-tiers.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

function getDirectMapLayerIds(svg: SVGSVGElement): string[] {
  return Array.from(svg.children)
    .filter((child) => child.hasAttribute("data-map-layer"))
    .map((child) => child.getAttribute("data-map-layer") ?? "");
}

describe("country geometry tiers", () => {
  beforeEach(() => {
    resetGeometryTierParseGuardsForTests();
  });

  it("uses reduced country geometry below 2x", () => {
    expect(getCountryGeometryTierName(1)).toBe("reduced");
    expect(shouldLoadDetailedCountryGeometry(1.99)).toBe(false);
    expect(reducedCountryGeometryTier.features).toHaveLength(175);
    expect(reducedCountryGeometryTier.metadata.tier).toBe("reduced");
  });

  it("loads detailed country geometry at 2x", async () => {
    expect(getCountryGeometryTierName(2)).toBe("detailed");
    expect(shouldLoadDetailedCountryGeometry(2)).toBe(true);
    expect(getGeometryTierParseGuards().detailedParsed).toBe(false);

    const detailed = await loadDetailedCountryGeometry();

    expect(detailed.name).toBe("detailed");
    expect(detailed.features).toHaveLength(175);
    expect(detailed.metadata.tier).toBe("detailed");
    expect(getGeometryTierParseGuards().detailedParsed).toBe(true);
  });

  it("keeps region geometry unavailable until 4x", () => {
    expect(shouldLoadRegionGeometry(3.99)).toBe(false);
    expect(shouldLoadRegionGeometry(4)).toBe(true);
  });

  it("keeps the SVG layer order stable across reduced and detailed tiers", async () => {
    const { container } = render(
      React.createElement(WorldMap, {
        data: [{ country: "US", value: 1 }],
        zoom: true,
      }),
    );
    const svg = container.querySelector('svg[role="img"]')!;

    expect(svg).toHaveAttribute("data-country-geometry-tier", "reduced");
    expect(getDirectMapLayerIds(svg)).toEqual([...mapRenderingLayers]);

    const detailedRender = render(
      React.createElement(WorldMap, {
        data: [{ country: "US", value: 1 }],
        zoom: { initialScale: 2 },
      }),
    );

    await waitFor(() => {
      expect(
        detailedRender.container.querySelector('svg[role="img"]'),
      ).toHaveAttribute("data-country-geometry-tier", "detailed");
    });
    expect(
      getDirectMapLayerIds(
        detailedRender.container.querySelector('svg[role="img"]')!,
      ),
    ).toEqual([...mapRenderingLayers]);
  });

  it("keeps external geometry providers and custom maps out of the current contract", () => {
    expect("customGeometryProvider" in reducedCountryGeometryTier).toBe(false);
    expect("externalMapProvider" in reducedCountryGeometryTier).toBe(false);
  });
});
