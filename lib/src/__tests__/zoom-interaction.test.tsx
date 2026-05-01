import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

describe("WorldMap zoom interaction", () => {
  it("updates scale and notifies consumers during repeated zoom controls", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const group = container.querySelector("svg > g")!;
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const zoomedOnce = group.getAttribute("transform");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(zoomedOnce).not.toBe(initial);
    expect(group.getAttribute("transform")).not.toBe(zoomedOnce);
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 1.5 }),
    );
    expect(onZoomChange).toHaveBeenCalledWith(
      expect.objectContaining({ scale: 2.25 }),
    );
  });

  it("restores the initial transform after reset", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const group = container.querySelector("svg > g")!;
    const initial = group.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));

    expect(group.getAttribute("transform")).toBe(initial);
  });
});
