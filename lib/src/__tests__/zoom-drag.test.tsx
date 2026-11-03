import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us" as const, value: 100 }];

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

  it("keeps dragging after focus moves between clickable countries", () => {
    // A country that loses focus dispatches a synthetic mouseout; it must
    // not end the next drag.
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 2 }}
        onClickFunction={vi.fn()}
      />,
    );
    const group = getCountriesLayer(container);
    const fr = container.querySelector<SVGPathElement>(
      'path[data-country-code="FR"]',
    )!;
    const br = container.querySelector<SVGPathElement>(
      'path[data-country-code="BR"]',
    )!;

    fireEvent.mouseDown(fr, { clientX: 200, clientY: 150 });
    fr.focus();
    fireEvent.mouseMove(fr, { clientX: 190, clientY: 145 });
    fireEvent.mouseUp(fr);
    expect(group.getAttribute("transform")).toContain("translate(-10, -5)");

    fireEvent.mouseDown(br, { clientX: 100, clientY: 100 });
    br.focus();
    expect(document.activeElement).toBe(br);
    fireEvent.mouseMove(br, { clientX: 80, clientY: 90 });
    fireEvent.mouseUp(br);
    expect(group.getAttribute("transform")).toContain("translate(-30, -15)");
  });

  it("keeps dragging when the pointer leaves the map", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom={{ initialScale: 2 }} />,
    );
    const svg = screen.getByRole("img", { name: "World map" });
    const group = getCountriesLayer(container);

    fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(svg);
    fireEvent.mouseMove(document.body, { clientX: 60, clientY: 80 });
    expect(group.getAttribute("transform")).toContain("translate(-40, -20)");
    fireEvent.mouseUp(document.body);
    fireEvent.mouseMove(document.body, { clientX: 0, clientY: 0 });
    expect(group.getAttribute("transform")).toContain("translate(-40, -20)");
  });

  it("removes its window listeners when unmounted mid-drag", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(
      <WorldMap data={DATA} size={400} zoom={{ initialScale: 2 }} />,
    );
    const svg = screen.getByRole("img", { name: "World map" });
    fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
    unmount();
    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toContain("mousemove");
    expect(removed).toContain("mouseup");
    remove.mockRestore();
  });
});
