/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, react/jsx-no-bind -- userEvent is untyped here (as in WorldMap.test.tsx); callback props are the subject under test. */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type GeoJSON from "geojson";
import { geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";

import WorldMap, { projectionOptions } from "../index.js";
import type { CountryContext, ProjectionOption } from "../index.js";
import { createProjection, defaultProjection } from "../projections.js";
import topoData from "../countries.topo.js";
import { hashPathData } from "./snapshotPaths.js";

// Same mock as WorldMap.test.tsx: the tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [
  { country: "us", value: 100 },
  { country: "ua", value: 50 },
] as const;

/* eslint-disable @typescript-eslint/no-unsafe-argument */
const countries = topoFeature(
  topoData,
  topoData.objects.countries,
) as unknown as GeoJSON.FeatureCollection;
/* eslint-enable @typescript-eslint/no-unsafe-argument */

function countryFeature(iso: string) {
  const found = countries.features.find(
    (f) => (f.properties as { I: string }).I === iso,
  );
  if (!found) throw new Error(`No country ${iso}`);
  return found;
}

// `d` attribute of each country path, keyed by its <title>.
function pathData(container: HTMLElement) {
  return new Map(
    Array.from(container.querySelectorAll("path > title")).map((title) => [
      title.textContent,
      title.parentElement!.getAttribute("d"),
    ]),
  );
}

function pathWithTitle(container: HTMLElement, text: string) {
  const title = Array.from(container.querySelectorAll("path > title")).find(
    (t) => t.textContent === text,
  );
  if (!title) throw new Error(`No path with title "${text}"`);
  return title.parentElement as unknown as SVGPathElement;
}

describe("projection options", () => {
  it("lists mercator first as the default", () => {
    expect(projectionOptions).toEqual(["mercator", "equalEarth"]);
    expect(defaultProjection).toBe("mercator");
  });
});

describe("createProjection", () => {
  it("keeps d3's default Mercator scale and translate", () => {
    const mercator = createProjection("mercator");
    expect(mercator.scale()).toBeCloseTo(961 / (2 * Math.PI), 6);
    expect(mercator.translate()).toEqual([480, 250]);
  });

  it("fits the Equal Earth globe to the full width of its 960 × 480 viewport, vertically centred", () => {
    const path = geoPath(createProjection("equalEarth"));
    const [[x0, y0], [x1, y1]] = path.bounds({ type: "Sphere" });
    expect(x0).toBeCloseTo(8, 3);
    expect(x1).toBeCloseTo(952, 3);
    expect(y0).toBeGreaterThanOrEqual(8);
    expect(y1).toBeLessThanOrEqual(472);
    expect((y0 + y1) / 2).toBeCloseTo(240, 3);
    // Every country lies inside the globe.
    const [[cx0, cy0], [cx1, cy1]] = path.bounds(countries);
    expect(cx0).toBeGreaterThanOrEqual(x0);
    expect(cx1).toBeLessThanOrEqual(x1);
    expect(cy0).toBeGreaterThanOrEqual(y0);
    expect(cy1).toBeLessThanOrEqual(y1);
  });

  it("draws areas at their true relative size with Equal Earth only", () => {
    const ratio = (option: ProjectionOption) => {
      const path = geoPath(createProjection(option));
      return path.area(countryFeature("GL")) / path.area(countryFeature("CD"));
    };
    // Greenland (2.17M km²) is slightly smaller than DR Congo (2.34M km²).
    expect(ratio("equalEarth")).toBeGreaterThan(0.85);
    expect(ratio("equalEarth")).toBeLessThan(1);
    // Mercator inflates Greenland to several times the size of DR Congo.
    expect(ratio("mercator")).toBeGreaterThan(3);
  });
});

describe("WorldMap — projection prop", () => {
  it("renders the same paths for the default and projection='mercator'", () => {
    const byDefault = render(<WorldMap data={DATA} />);
    const explicit = render(<WorldMap data={DATA} projection="mercator" />);
    expect(pathData(explicit.container)).toEqual(pathData(byDefault.container));
  });

  it("renders different paths with projection='equalEarth'", () => {
    const mercator = render(<WorldMap data={DATA} />);
    const equalEarth = render(<WorldMap data={DATA} projection="equalEarth" />);
    const before = pathData(mercator.container);
    const after = pathData(equalEarth.container);
    expect(after.size).toBe(before.size);
    expect(after.get("United States 100")).not.toBe(
      before.get("United States 100"),
    );
  });

  it("uses a 2:1 frame for Equal Earth and keeps 4:3 for Mercator", () => {
    const equalEarth = render(
      <WorldMap data={DATA} size={480} projection="equalEarth" />,
    ).container.querySelector("svg")!;
    expect(equalEarth.getAttribute("width")).toBe("480px");
    expect(equalEarth.getAttribute("height")).toBe("240px");
    expect(
      equalEarth
        .querySelector('[data-map-layer="countries"]')!
        .getAttribute("transform"),
    ).toBe("translate(0, 0) scale(0.5) translate(0, 0)");

    const mercator = render(
      <WorldMap data={DATA} size={480} />,
    ).container.querySelector("svg")!;
    expect(mercator.getAttribute("height")).toBe("360px");
    expect(
      mercator
        .querySelector('[data-map-layer="countries"]')!
        .getAttribute("transform"),
    ).toBe("translate(0, 0) scale(0.5) translate(0, 240)");
  });

  it("draws the globe outline for Equal Earth only", () => {
    const equalEarth = render(
      <WorldMap data={DATA} projection="equalEarth" borderColor="#123456" />,
    ).container.querySelector(".worldmap__outline")!;
    expect(equalEarth.getAttribute("d")).toMatch(/^M/);
    expect(equalEarth.getAttribute("fill")).toBe("none");
    expect(equalEarth.getAttribute("stroke")).toBe("#123456");
    expect(equalEarth.getAttribute("aria-hidden")).toBe("true");

    const mercator = render(<WorldMap data={DATA} />).container;
    expect(mercator.querySelector(".worldmap__outline")).toBeNull();
  });

  it("falls back to Mercator for an unsupported projection value", () => {
    const fallback = render(
      <WorldMap data={DATA} size={480} projection={"robinson" as never} />,
    ).container;
    const mercator = render(<WorldMap data={DATA} size={480} />).container;
    expect(pathData(fallback)).toEqual(pathData(mercator));
    expect(fallback.querySelector("svg")!.getAttribute("height")).toBe("360px");
    expect(fallback.querySelector(".worldmap__outline")).toBeNull();
  });

  it("switches projection when the prop changes", () => {
    const { container, rerender } = render(<WorldMap data={DATA} />);
    const mercator = pathData(container);
    rerender(<WorldMap data={DATA} projection="equalEarth" />);
    const equalEarth = pathData(container);
    expect(equalEarth).not.toEqual(mercator);
    rerender(<WorldMap data={DATA} projection="mercator" />);
    expect(pathData(container)).toEqual(mercator);
  });

  it("keeps tooltips and click callbacks with Equal Earth", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        projection="equalEarth"
        onClickFunction={onClick}
      />,
    );
    await userEvent.click(pathWithTitle(container, "United States 100"));
    expect(onClick).toHaveBeenCalledTimes(1);
    const context = onClick.mock.calls[0]![0] as CountryContext;
    expect(context.countryCode).toBe("US");
    expect(context.countryValue).toBe(100);
  });

  it("keeps hrefFunction links with Equal Earth", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        projection="equalEarth"
        hrefFunction={({ countryCode }) =>
          countryCode === "US" ? "https://example.com/us" : undefined
        }
      />,
    );
    expect(
      container.querySelector('a[href="https://example.com/us"] path'),
    ).not.toBeNull();
  });

  it("keeps richInteraction zoom with Equal Earth", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        projection="equalEarth"
        richInteraction
      />,
    );
    const svg = container.querySelector("svg")!;
    const g = svg.querySelector('[data-map-layer="countries"]')!;
    const original = g.getAttribute("transform");
    fireEvent.keyDown(svg, { key: "+" });
    expect(g.getAttribute("transform")).not.toBe(original);
    fireEvent.keyDown(svg, { key: "-" });
    expect(g.getAttribute("transform")).toBe(original);
  });

  it("projects the disputed-territory overlay with Equal Earth", () => {
    const mercator = render(<WorldMap data={[]} showDisputedTerritories />);
    const equalEarth = render(
      <WorldMap data={[]} showDisputedTerritories projection="equalEarth" />,
    );
    const crimea = (container: HTMLElement) =>
      container
        .querySelector('[data-disputed-territory="crimea"]')!
        .getAttribute("d");
    expect(crimea(equalEarth.container)).toBeTruthy();
    expect(crimea(equalEarth.container)).not.toBe(crimea(mercator.container));
  });

  it("keeps stable Equal Earth geometry for the outline and sample countries", () => {
    const equalEarth = render(
      <WorldMap data={DATA} size={480} projection="equalEarth" />,
    ).container;
    const mercator = render(<WorldMap data={DATA} size={480} />).container;
    const outline = equalEarth.querySelector(".worldmap__outline")!;
    const us = pathWithTitle(equalEarth, "United States 100");

    expect(equalEarth.querySelectorAll("path").length).toBeGreaterThan(100);
    expect(hashPathData(outline.getAttribute("d")!)).toBe("sha1:b7318be3b985");
    expect(hashPathData(us.getAttribute("d")!)).toMatch(/^sha1:[0-9a-f]{12}$/);
    expect(us.getAttribute("d")).not.toBe(
      pathData(mercator).get("United States 100"),
    );
  });
});
