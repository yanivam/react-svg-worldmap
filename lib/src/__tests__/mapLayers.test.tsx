import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import WorldMap, {
  mapRenderingLayers,
  mapRenderingLayerOrder,
  regions,
} from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us" as const, value: 100 }];

function getMapSvg(container: HTMLElement): SVGSVGElement {
  return container.querySelector('svg[role="img"]')!;
}

function getDirectMapLayerIds(svg: SVGSVGElement): string[] {
  return Array.from(svg.children)
    .filter((child) => child.hasAttribute("data-map-layer"))
    .map((child) => child.getAttribute("data-map-layer") ?? "");
}

describe("WorldMap — layers and data attributes", () => {
  it("renders the map layers as direct children of the svg in paint order", () => {
    const { container } = render(
      <WorldMap data={DATA} showDisputedTerritories />,
    );
    const svg = getMapSvg(container);

    expect(getDirectMapLayerIds(svg)).toEqual([...mapRenderingLayers]);
    for (const layer of mapRenderingLayers) {
      expect(
        svg
          .querySelector(`[data-map-layer="${layer}"]`)
          ?.getAttribute("data-map-layer-order"),
      ).toBe(String(mapRenderingLayerOrder[layer]));
    }
  });

  it("omits the disputed-territories layer unless it is turned on", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(getDirectMapLayerIds(getMapSvg(container))).toEqual([
      "ocean",
      "countries",
      "labels",
    ]);
  });

  it("draws the frame above the ocean and below the countries", () => {
    const { container } = render(<WorldMap data={DATA} frame />);
    const children = Array.from(getMapSvg(container).children);
    const frame = container.querySelector("[data-map-frame]")!;
    const ocean = container.querySelector('[data-map-layer="ocean"]')!;
    const countries = container.querySelector('[data-map-layer="countries"]')!;

    expect(children.indexOf(frame)).toBeGreaterThan(children.indexOf(ocean));
    expect(children.indexOf(frame)).toBeLessThan(children.indexOf(countries));
  });

  it("fills the ocean with backgroundColor", () => {
    const { container } = render(
      <WorldMap data={DATA} backgroundColor="#ddeeff" />,
    );
    const figure = container.querySelector("figure")!;
    const ocean = container.querySelector(
      '[data-map-layer="ocean"] [data-map-ocean]',
    )!;

    expect(figure).toHaveStyle({ backgroundColor: "#ddeeff" });
    expect(ocean.getAttribute("fill")).toBe("#ddeeff");
    expect(ocean).toHaveAttribute("aria-hidden", "true");
  });

  it("tags every country path with its code and name", () => {
    const { container } = render(<WorldMap data={DATA} />);
    const paths = container.querySelectorAll(
      '[data-map-layer="countries"] path[data-country-code]',
    );

    expect(paths).toHaveLength(regions.length);
    expect(
      Array.from(paths).map((path) => ({
        code: path.getAttribute("data-country-code"),
        name: path.getAttribute("data-country-name"),
      })),
    ).toEqual(regions);
  });

  it("keeps the data attributes on the path when the country is a link", () => {
    const { container } = render(
      <WorldMap data={DATA} hrefFunction={() => "https://example.com"} />,
    );
    const us = container.querySelector('[data-country-code="US"]')!;

    expect(us.tagName.toLowerCase()).toBe("path");
    expect(us.parentElement!.tagName.toLowerCase()).toBe("a");
    expect(us).toHaveAttribute("data-country-name", "United States");
  });
});
