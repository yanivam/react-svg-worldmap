import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

describe("WorldMap zoom labels", () => {
  it("does not render default country labels when zoom is omitted", () => {
    const { container } = render(<WorldMap data={DATA} />);

    expect(container.querySelector("text")).toBeNull();
  });

  it("renders default country labels when zoom is enabled", () => {
    const { container } = render(
      <WorldMap data={DATA} size={1200} zoom={{ initialScale: 4 }} />,
    );

    expect(
      Array.from(container.querySelectorAll("text")).some(
        (label) => label.textContent?.startsWith("United States"),
      ),
    ).toBe(true);
  });

  it("can hide default country labels through zoom options", () => {
    const { container } = render(
      <WorldMap data={DATA} size={640} zoom={{ showCountryLabels: false }} />,
    );

    expect(container.querySelector("text")).toBeNull();
  });

  it("shows city markers at true locations when the country has enough visible area", () => {
    const { container } = render(
      <WorldMap data={DATA} size={1200} zoom={{ initialScale: 4 }} />,
    );

    expect(
      container.querySelector(
        '[data-city-kind="capital"][data-country-code="US"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '[data-city-kind="largest"][data-country-code="US"]',
      ),
    ).not.toBeNull();

    expect(screen.getByText("Washington, DC (capital)")).toBeInTheDocument();
    expect(screen.getByText("New York City")).toBeInTheDocument();
  });

  it("can hide city markers through zoom options", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        zoom={{ initialScale: 4, showCountryDetails: false }}
      />,
    );

    expect(container.querySelector("[data-city-kind]")).toBeNull();
  });
});
