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

describe("WorldMap zoom controls", () => {
  it("does not render zoom controls by default", () => {
    render(<WorldMap data={DATA} />);

    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  });

  it("renders zoom controls when zoom is enabled", () => {
    render(<WorldMap data={DATA} zoom />);

    expect(
      screen.getByRole("group", { name: "Map zoom controls" }),
    ).toHaveStyle({
      position: "absolute",
      right: "12px",
      bottom: "12px",
    });
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Zoom out" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveAttribute(
      "title",
      "Reset zoom",
    );
  });

  it("uses primary plus/minus controls plus home-icon reset", () => {
    render(<WorldMap data={DATA} zoom />);

    expect(screen.getByRole("button", { name: "Zoom in" })).toHaveTextContent(
      "+",
    );
    expect(screen.getByRole("button", { name: "Zoom out" })).toHaveTextContent(
      "-",
    );
    expect(
      screen.getByRole("button", { name: "Reset zoom" }).querySelector("svg"),
    ).toBeInTheDocument();
  });

  it("zooms in and zooms out with explicit controls", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const group = getCountriesLayer(container);
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(group.getAttribute("transform")).not.toBe(initial);

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(group.getAttribute("transform")).toContain(
      "scale(0.4166666666666667)",
    );
    expect(onZoomChange).toHaveBeenCalled();
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 1 }),
    );
  });

  it("resets zoom to the initial full-world view in one click", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const group = getCountriesLayer(container);
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(group.getAttribute("transform")).not.toBe(initial);

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));

    expect(group.getAttribute("transform")).toBe(initial);
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 1, translate: [0, 0] }),
    );
  });

  it("keeps country border strokes from scaling during repeated zoom", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const countryPath = container.querySelector("[data-country-code]")!;

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(countryPath.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke",
    );
  });

  it("keeps the latest requested scale during repeated zoom clicks", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = container.querySelector('svg[role="img"]')!;

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));

    expect(svg).toHaveAttribute("data-zoom-scale", "2");
    expect(svg).toHaveAttribute("data-zoom-render-phase", "immediate-feedback");
  });

  it("announces zoom status changes", () => {
    render(<WorldMap data={DATA} size={400} zoom />);
    const status = screen.getByText("Map zoom reset");

    expect(status).toHaveAttribute("aria-live", "polite");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(status).toHaveTextContent("Map zoomed in");

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(status).toHaveTextContent("Map zoomed out");

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(status).toHaveTextContent("Map zoom reset");
  });
});
