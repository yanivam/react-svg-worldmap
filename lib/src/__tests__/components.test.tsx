import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Frame from "../components/Frame.js";
import TextLabel from "../components/TextLabel.js";

function Svg({ children }: { children: React.ReactNode }) {
  return <svg>{children}</svg>;
}

// ── Frame ────────────────────────────────────────────────────────────────────

describe("Frame", () => {
  it("renders a <rect> element", () => {
    const { container } = render(<Frame color="blue" />, { wrapper: Svg });
    expect(container.querySelector("rect")).not.toBeNull();
  });

  it("applies the stroke color", () => {
    const { container } = render(<Frame color="red" />, { wrapper: Svg });
    expect(container.querySelector("rect")?.getAttribute("stroke")).toBe("red");
  });

  it('has fill="none" so it does not obscure the map', () => {
    const { container } = render(<Frame color="red" />, { wrapper: Svg });
    expect(container.querySelector("rect")?.getAttribute("fill")).toBe("none");
  });

  it("spans the full width and height of the SVG", () => {
    const { container } = render(<Frame color="black" />, { wrapper: Svg });
    const rect = container.querySelector("rect")!;
    expect(rect.getAttribute("width")).toBe("100%");
    expect(rect.getAttribute("height")).toBe("100%");
  });

  it("is anchored at (0, 0)", () => {
    const { container } = render(<Frame color="black" />, { wrapper: Svg });
    const rect = container.querySelector("rect")!;
    expect(rect.getAttribute("x")).toBe("0");
    expect(rect.getAttribute("y")).toBe("0");
  });
});

// ── TextLabel ────────────────────────────────────────────────────────────────

describe("TextLabel", () => {
  it("renders a <text> element", () => {
    const { container } = render(<TextLabel label="Hello" />, { wrapper: Svg });
    expect(container.querySelector("text")).not.toBeNull();
  });

  it("renders the label string as text content", () => {
    const { container } = render(<TextLabel label="World Population" />, {
      wrapper: Svg,
    });
    expect(container.querySelector("text")?.textContent).toBe(
      "World Population",
    );
  });

  it("passes x and y coordinates through to the <text> element", () => {
    const { container } = render(<TextLabel label="Point" x={42} y={99} />, {
      wrapper: Svg,
    });
    const text = container.querySelector("text")!;
    expect(text.getAttribute("x")).toBe("42");
    expect(text.getAttribute("y")).toBe("99");
  });

  it("passes arbitrary SVG text props (fill, fontSize, textAnchor)", () => {
    const { container } = render(
      <TextLabel
        label="Styled"
        fill="navy"
        fontSize={14}
        textAnchor="middle"
      />,
      { wrapper: Svg },
    );
    const text = container.querySelector("text")!;
    expect(text.getAttribute("fill")).toBe("navy");
    expect(text.getAttribute("font-size")).toBe("14");
    expect(text.getAttribute("text-anchor")).toBe("middle");
  });
});
