import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

describe("WorldMap zoom controls", () => {
  it("does not render zoom controls by default", () => {
    render(<WorldMap data={DATA} />);

    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  });

  it("renders zoom controls when zoom is enabled", () => {
    render(<WorldMap data={DATA} zoom />);

    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Zoom out" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset zoom" }),
    ).toBeInTheDocument();
  });

  it("zooms in, zooms out, and resets with explicit controls", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const group = container.querySelector("svg > g")!;
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(group.getAttribute("transform")).not.toBe(initial);

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(group.getAttribute("transform")).toBe(initial);
    expect(onZoomChange).toHaveBeenCalled();
  });

  it("keeps country border strokes from scaling during repeated zoom", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const countryPath = container.querySelector("path")!;

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(countryPath.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke",
    );
  });

  it("announces zoom and reset status changes", () => {
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
