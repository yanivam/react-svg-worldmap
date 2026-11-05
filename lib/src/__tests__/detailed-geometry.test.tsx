import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type GeoJSON from "geojson";
import { geoContains } from "d3-geo";
import { feature as topoFeature } from "topojson-client";

import WorldMap, { preloadDetailedCountryGeometry, regions } from "../index.js";
import topoData from "../countries.topo.js";
import detailedTopoData from "../map-assets/countries-detailed.cjs";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

type CountryFeature = GeoJSON.Feature & {
  properties: { N: string; I: string };
};

function decode(topology: unknown): CountryFeature[] {
  const topo = topology as Parameters<typeof topoFeature>[0];
  return (
    topoFeature(
      topo,
      topo.objects.countries!,
    ) as unknown as GeoJSON.FeatureCollection
  ).features as CountryFeature[];
}

const tiers = [
  ["default", decode(topoData)],
  ["detailed", decode(detailedTopoData)],
] as const;

const crimea: Record<string, [number, number]> = {
  Simferopol: [34.1, 44.95],
  Sevastopol: [33.52, 44.6],
  Kerch: [36.3, 45.3],
  Yalta: [34.16, 44.5],
};

const DATA = [{ country: "ua" as const, value: 1 }];

function countriesLayer(container: HTMLElement) {
  return container.querySelector('[data-map-layer="countries"]')!;
}
function countryPath(container: HTMLElement, code: string) {
  return container
    .querySelector(`[data-country-code="${code}"]`)!
    .getAttribute("d");
}

describe.each(tiers)("%s country geometry", (_, features) => {
  it("has the same countries, in the same order, as the default tier", () => {
    expect(features.map((f) => f.properties.I)).toEqual(
      regions.map((r) => r.code),
    );
  });

  it.each(Object.entries(crimea))(
    "draws %s in Crimea as part of Ukraine",
    (_name, point) => {
      const owners = features
        .filter((f) => geoContains(f, point))
        .map((f) => f.properties.I);
      expect(owners).toEqual(["UA"]);
    },
  );

  it("has no country covering open ocean (rings are wound for d3)", () => {
    for (const point of [
      [-30, 0],
      [-150, 0],
      [70, -30],
    ] as const) 
      expect(features.filter((f) => geoContains(f, [...point]))).toEqual([]);
    
  });
});

describe("detailed country geometry on zoom", () => {
  it("draws the detailed borders at zoom 2 and the default ones below", async () => {
    const { container } = render(<WorldMap data={DATA} zoom />);
    const defaultPath = countryPath(container, "UA");
    expect(countriesLayer(container)).toHaveAttribute(
      "data-map-geometry",
      "default",
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await waitFor(() =>
      expect(countriesLayer(container)).toHaveAttribute(
        "data-map-geometry",
        "detailed",
      ),
    );
    expect(countryPath(container, "UA")).not.toBe(defaultPath);

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(countriesLayer(container)).toHaveAttribute(
      "data-map-geometry",
      "default",
    );
    expect(countryPath(container, "UA")).toBe(defaultPath);
  });

  it("keeps the default borders with detailedGeometry: false", async () => {
    await preloadDetailedCountryGeometry();
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 4, detailedGeometry: false }}
      />,
    );
    await act(() => Promise.resolve());
    expect(countriesLayer(container)).toHaveAttribute(
      "data-map-geometry",
      "default",
    );
  });

  it("respects detailedGeometryMinScale", async () => {
    await preloadDetailedCountryGeometry();
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 2, detailedGeometryMinScale: 4 }}
      />,
    );
    await act(() => Promise.resolve());
    expect(countriesLayer(container)).toHaveAttribute(
      "data-map-geometry",
      "default",
    );
  });

  it("never draws the detailed borders without the zoom prop", async () => {
    await preloadDetailedCountryGeometry();
    const plain = render(<WorldMap data={DATA} />);
    const defaultPath = countryPath(plain.container, "UA");
    plain.unmount();

    const { container } = render(<WorldMap data={DATA} richInteraction />);
    const svg = container.querySelector("svg")!;
    fireEvent.doubleClick(svg);
    fireEvent.doubleClick(svg);
    await act(() => Promise.resolve());
    expect(countriesLayer(container)).not.toHaveAttribute("data-map-geometry");
    expect(countryPath(container, "UA")).toBe(defaultPath);
  });
});
