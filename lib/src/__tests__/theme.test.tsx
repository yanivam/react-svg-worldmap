import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

import WorldMap, {
  mapThemeOptions,
  preloadDetailedCountryGeometry,
} from "../index.js";
import type { MapTheme, ProjectionOption } from "../index.js";
import { mapThemes } from "../constants.js";

// The tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [
  { country: "us", value: 100 },
  { country: "ua", value: 50 },
] as const;

const atlas = mapThemes.atlas;
const customStyle = () => ({ fill: "#123456", fillOpacity: 0.5 });

function country(container: HTMLElement, code: string) {
  const path = container.querySelector<SVGPathElement>(
    `path[data-country-code="${code}"]`,
  );
  if (!path) throw new Error(`No country ${code}`);
  return path;
}

describe("theme", () => {
  it("lists the themes", () => {
    expect(mapThemeOptions).toEqual(["default", "atlas"]);
  });

  it("renders the same with theme='default' as without a theme", () => {
    const { container: plain } = render(<WorldMap data={DATA} />);
    const { container: themed } = render(
      <WorldMap data={DATA} theme="default" />,
    );
    expect(themed.innerHTML).toBe(plain.innerHTML);
  });

  it("falls back to the default theme for an unknown value", () => {
    const { container: plain } = render(<WorldMap data={DATA} />);
    const { container: themed } = render(
      <WorldMap data={DATA} theme={"sepia" as MapTheme} />,
    );
    expect(themed.innerHTML).toBe(plain.innerHTML);
  });

  it("draws no land layer without the atlas theme", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector(".worldmap__land")).toBeNull();
    expect(country(container, "FR").getAttribute("vector-effect")).toBeNull();
  });
});

describe("atlas theme", () => {
  it("paints the water, borders and countries without data", () => {
    const { container } = render(<WorldMap data={DATA} theme="atlas" />);
    expect(
      container.querySelector("rect[data-map-ocean]")?.getAttribute("fill"),
    ).toBe(atlas.backgroundColor);
    expect(
      container.querySelector<HTMLElement>("figure")!.style.backgroundColor,
    ).toBe("rgb(160, 215, 235)");

    const france = country(container, "FR");
    expect(france.style.fill.toLowerCase()).toBe("#f4f2f2");
    expect(france.style.fillOpacity).toBe("1");
    expect(france.style.stroke).toBe("#607d86");
    expect(france.getAttribute("vector-effect")).toBe("non-scaling-stroke");
  });

  it("keeps the data colour for countries with data", () => {
    const { container } = render(
      <WorldMap data={DATA} theme="atlas" color="#3b82f6" />,
    );
    const us = country(container, "US");
    expect(us.style.fill).toBe("#3b82f6");
    expect(us.style.fillOpacity).toBe("0.8");
    expect(country(container, "UA").style.fillOpacity).toBe("0.2");
  });

  it("draws the land beneath the countries", () => {
    const { container } = render(<WorldMap data={DATA} theme="atlas" />);
    const land = container.querySelector(".worldmap__land")!;
    expect(land.getAttribute("fill")).toBe(atlas.landColor);
    expect(land.getAttribute("pointer-events")).toBe("none");
    expect(land.getAttribute("aria-hidden")).toBe("true");
    // Beneath every country path, in the countries layer.
    const layer = container.querySelector('[data-map-layer="countries"]')!;
    expect(land.parentElement).toBe(layer);
    expect(
      land.compareDocumentPosition(country(container, "FR")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(land.getAttribute("d")).toContain(
      country(container, "FR").getAttribute("d"),
    );
  });

  it("lets explicit colour props override the theme", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        theme="atlas"
        backgroundColor="#000000"
        borderColor="#ff0000"
        frame
        frameColor="#00ff00"
      />,
    );
    expect(
      container.querySelector("rect[data-map-ocean]")?.getAttribute("fill"),
    ).toBe("#000000");
    expect(country(container, "FR").style.stroke).toBe("#ff0000");
    expect(container.querySelector('rect[stroke="#00ff00"]')).not.toBeNull();
  });

  it("lets a styleFunction override the theme's country style", () => {
    const { container } = render(
      <WorldMap data={DATA} theme="atlas" styleFunction={customStyle} />,
    );
    const france = country(container, "FR");
    expect(france.style.fill).toBe("#123456");
    expect(france.style.fillOpacity).toBe("0.5");
  });

  it("uses the theme frame colour", () => {
    const { container } = render(<WorldMap data={DATA} theme="atlas" frame />);
    expect(
      container.querySelector(`rect[stroke="${atlas.frameColor}"]`),
    ).not.toBeNull();
  });

  it("styles the labels and pins with zoom, unless overridden", () => {
    const pins = [
      { caption: "Kyiv", coordinates: [30.52, 50.45] as const },
    ] as const;
    const { container, rerender } = render(
      <WorldMap
        data={DATA}
        theme="atlas"
        size={1200}
        zoom={{ initialScale: 4 }}
        pins={pins}
      />,
    );
    const label = container.querySelector(".worldmap__country-labels text");
    expect(label?.getAttribute("fill")).toBe(atlas.labelColor);
    expect(label?.getAttribute("stroke")).toBe(atlas.labelHaloColor);
    const caption = container.querySelector(".worldmap__pins text");
    expect(caption?.getAttribute("fill")).toBe(atlas.pinTextColor);

    rerender(
      <WorldMap
        data={DATA}
        theme="atlas"
        size={1200}
        zoom={{ initialScale: 4 }}
        pins={pins}
        labelColor="#111111"
        labelHaloColor="#eeeeee"
        pinTextColor="#222222"
      />,
    );
    const overridden = container.querySelector(
      ".worldmap__country-labels text",
    );
    expect(overridden?.getAttribute("fill")).toBe("#111111");
    expect(overridden?.getAttribute("stroke")).toBe("#eeeeee");
    expect(
      container.querySelector(".worldmap__pins text")?.getAttribute("fill"),
    ).toBe("#222222");
  });

  it.each(["mercator", "equalEarth"] as ProjectionOption[])(
    "works with the %s projection",
    (projection) => {
      const { container } = render(
        <WorldMap data={DATA} theme="atlas" projection={projection} />,
      );
      expect(container.querySelector(".worldmap__land")).not.toBeNull();
      expect(country(container, "FR").style.fill.toLowerCase()).toBe("#f4f2f2");
      expect(country(container, "UA").getAttribute("vector-effect")).toBe(
        "non-scaling-stroke",
      );
    },
  );

  it.each(["mercator", "equalEarth"] as ProjectionOption[])(
    "draws the land from the detailed borders when zoomed in (%s)",
    async (projection) => {
      await preloadDetailedCountryGeometry();
      const { container } = render(
        <WorldMap
          data={DATA}
          theme="atlas"
          projection={projection}
          zoom={{ initialScale: 4 }}
        />,
      );
      const layer = container.querySelector('[data-map-layer="countries"]')!;
      await waitFor(() =>
        expect(layer.getAttribute("data-map-geometry")).toBe("detailed"),
      );
      const land = container.querySelector(".worldmap__land")!;
      expect(land.getAttribute("d")).toContain(
        country(container, "UA").getAttribute("d"),
      );
      expect(country(container, "FR").style.fill.toLowerCase()).toBe("#f4f2f2");
    },
  );
});
