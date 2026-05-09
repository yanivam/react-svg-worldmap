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

describe("WorldMap zoom interaction", () => {
  it("updates scale and notifies consumers during repeated zoom controls", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const group = getCountriesLayer(container);
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const zoomedOnce = group.getAttribute("transform");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(zoomedOnce).not.toBe(initial);
    expect(group.getAttribute("transform")).not.toBe(zoomedOnce);
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 2 }),
    );
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 4 }),
    );
  });

  it("zooms around the clicked point on double click with the configured zoom factor", () => {
    const onZoomChange = vi.fn();
    render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ zoomFactor: 2 }}
        onZoomChange={onZoomChange}
      />,
    );
    const svg = screen.getByRole("img", { name: "World map" });
    const getBoundingClientRect = vi
      .spyOn(svg, "getBoundingClientRect")
      .mockReturnValue({
        left: 10,
        top: 20,
        width: 400,
        height: 200,
      } as DOMRect);

    fireEvent.doubleClick(svg, { clientX: 160, clientY: 110 });

    expect(onZoomChange).toHaveBeenCalledWith({
      scale: 2,
      translate: [-150, -90],
    });
    getBoundingClientRect.mockRestore();
  });

  it("clamps double-click zoom near the map edge", () => {
    const onZoomChange = vi.fn();
    render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ zoomFactor: 2 }}
        onZoomChange={onZoomChange}
      />,
    );
    const svg = screen.getByRole("img", { name: "World map" });
    const getBoundingClientRect = vi
      .spyOn(svg, "getBoundingClientRect")
      .mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
      } as DOMRect);

    fireEvent.doubleClick(svg, { clientX: 390, clientY: 290 });

    expect(onZoomChange).toHaveBeenCalledWith({
      scale: 2,
      translate: [-390, -290],
    });
    getBoundingClientRect.mockRestore();
  });
});
