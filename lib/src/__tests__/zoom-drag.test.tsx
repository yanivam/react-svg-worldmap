import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

function getCountriesLayer(container: HTMLElement): SVGGElement {
  return container.querySelector('[data-map-layer="countries"]')!;
}

describe("WorldMap zoom drag", () => {
  it("pans the map while dragging when zoomed in", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom={{ initialScale: 2 }} />,
    );
    const svg = screen.getByRole("img", { name: "World map" });
    const group = getCountriesLayer(container);
    const initial = group.getAttribute("transform");

    fireEvent.mouseDown(svg, { clientX: 30, clientY: 25 });
    fireEvent.mouseMove(svg, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(svg);

    expect(group.getAttribute("transform")).not.toBe(initial);
    expect(group.getAttribute("transform")).toContain("translate(-20, -15)");
  });

  it("does not allow dragging past the map frame at minimum zoom", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = screen.getByRole("img", { name: "World map" });
    const group = getCountriesLayer(container);
    const initial = group.getAttribute("transform");

    fireEvent.mouseDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(svg, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(svg);

    expect(group.getAttribute("transform")).toBe(initial);
  });

  it("stops panning after mouse up", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = screen.getByRole("img", { name: "World map" });
    const group = getCountriesLayer(container);

    fireEvent.mouseDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(svg);
    const afterMouseUp = group.getAttribute("transform");
    fireEvent.mouseMove(svg, { clientX: 30, clientY: 25 });

    expect(group.getAttribute("transform")).toBe(afterMouseUp);
  });
});
