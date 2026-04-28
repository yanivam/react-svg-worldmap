import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

describe("WorldMap zoom drag", () => {
  it("pans the map while dragging when zoom is enabled", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = container.querySelector("svg")!;
    const group = container.querySelector("svg > g")!;
    const initial = group.getAttribute("transform");

    fireEvent.mouseDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(svg, { clientX: 30, clientY: 25 });
    fireEvent.mouseUp(svg);

    expect(group.getAttribute("transform")).not.toBe(initial);
    expect(group.getAttribute("transform")).toContain("translate(20, 15)");
  });

  it("stops panning after mouse up", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = container.querySelector("svg")!;
    const group = container.querySelector("svg > g")!;

    fireEvent.mouseDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(svg);
    const afterMouseUp = group.getAttribute("transform");
    fireEvent.mouseMove(svg, { clientX: 30, clientY: 25 });

    expect(group.getAttribute("transform")).toBe(afterMouseUp);
  });
});
