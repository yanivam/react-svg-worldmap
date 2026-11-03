import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import WorldMap from "../index.js";

// Pins the richInteraction behavior of releases before zoom was added, so
// that the `zoom` prop stays strictly opt-in: without it, double-click and
// keyboard zoom must behave exactly as they always have.

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us" as const, value: 100 }];

// At size 400 the map draws at 400 / 960 of its 960-wide coordinate space.
const base = 400 / 960;
const transformFor = (scale: number, x: number, y: number) =>
  `translate(${x}, ${y}) scale(${base * scale}) translate(0, 240)`;

function setup() {
  const utils = render(<WorldMap data={DATA} size={400} richInteraction />);
  const svg = utils.container.querySelector<SVGSVGElement>('svg[role="img"]')!;
  const countries = utils.container.querySelector(
    '[data-map-layer="countries"]',
  )!;
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    left: 10,
    top: 20,
    width: 400,
    height: 300,
  } as DOMRect);
  return {
    ...utils,
    svg,
    transform: () => countries.getAttribute("transform"),
  };
}

describe("richInteraction without zoom (legacy behavior)", () => {
  it("double-click cycles the scale 1 → 2 → 4 → reset", () => {
    const { svg, transform } = setup();
    expect(transform()).toBe(transformFor(1, 0, 0));

    // Point (100, 100) inside the map.
    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    expect(transform()).toBe(transformFor(2, -100, -100));

    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    expect(transform()).toBe(transformFor(4, -300, -300));

    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    expect(transform()).toBe(transformFor(1, 0, 0));
  });

  it("'+' and '=' zoom to the centre and stop at 4x", () => {
    const { svg, transform } = setup();

    fireEvent.keyDown(svg, { key: "+" });
    expect(transform()).toBe(transformFor(2, -200, -150));
    fireEvent.keyDown(svg, { key: "=" });
    expect(transform()).toBe(transformFor(4, -600, -450));
    fireEvent.keyDown(svg, { key: "+" });
    expect(transform()).toBe(transformFor(4, -600, -450));
  });

  it("'-' and '_' reset the zoom", () => {
    const { svg, transform } = setup();

    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "-" });
    expect(transform()).toBe(transformFor(1, 0, 0));

    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "_" });
    expect(transform()).toBe(transformFor(1, 0, 0));
  });

  it("ignores Escape, wheel and dragging", () => {
    const { svg, transform } = setup();

    fireEvent.keyDown(svg, { key: "+" });
    const zoomed = transform();

    const escape = fireEvent.keyDown(svg, { key: "Escape" });
    expect(escape).toBe(true); // Default not prevented
    expect(transform()).toBe(zoomed);

    const wheel = fireEvent.wheel(svg, { deltaY: -100, ctrlKey: true });
    expect(wheel).toBe(true);
    expect(transform()).toBe(zoomed);

    fireEvent.mouseDown(svg, { clientX: 30, clientY: 30 });
    fireEvent.mouseMove(svg, { clientX: 80, clientY: 80 });
    fireEvent.mouseUp(svg);
    expect(transform()).toBe(zoomed);
  });

  it("adds no zoom UI, attributes or figure styles", () => {
    const { container, svg } = setup();
    const figure = container.querySelector("figure")!;
    const wrapper = container.firstElementChild as HTMLElement;

    expect(figure.getAttribute("style")).toBe("background-color: white;");
    expect(wrapper.getAttribute("style")).toBe("width: 100%; min-height: 0;");
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
    expect(svg.getAttribute("aria-keyshortcuts")).toBe("+ -");
    expect(svg.getAttribute("tabindex")).toBe("0");
    expect(svg.hasAttribute("data-zoom-scale")).toBe(false);
    expect(
      container
        .querySelector("[data-country-code]")!
        .hasAttribute("vector-effect"),
    ).toBe(false);
  });
});

describe("richInteraction markup", () => {
  it("keeps the svg attribute order of earlier releases", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    expect(
      container.querySelector('svg[role="img"]')!.getAttributeNames(),
    ).toEqual([
      "role",
      "aria-label",
      "tabindex",
      "aria-keyshortcuts",
      "height",
      "width",
    ]);
  });
});
