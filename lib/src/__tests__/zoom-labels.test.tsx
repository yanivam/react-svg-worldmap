import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us", value: 100 }] as const;

function getCountryLabelFontSize(
  container: HTMLElement,
  countryName: string,
): number {
  const label = Array.from(container.querySelectorAll("text")).find(
    (text) => text.textContent?.startsWith(countryName),
  );

  expect(label).toBeDefined();
  return Number(label!.getAttribute("font-size"));
}

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

  it("uses clamped zoom-aware country label sizing by default", () => {
    const lowZoom = render(
      <WorldMap data={DATA} size={960} zoom={{ initialScale: 4 }} />,
    );
    const highZoom = render(
      <WorldMap data={DATA} size={960} zoom={{ initialScale: 64 }} />,
    );

    const lowZoomScreenFontSize =
      getCountryLabelFontSize(lowZoom.container, "United States") * 4;
    const highZoomScreenFontSize =
      getCountryLabelFontSize(highZoom.container, "United States") * 64;

    expect(lowZoomScreenFontSize).toBeGreaterThan(12);
    expect(highZoomScreenFontSize).toBeCloseTo(20);

    lowZoom.unmount();
    highZoom.unmount();
  });

  it("respects country label size overrides", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={960}
        zoom={{
          initialScale: 16,
          countryLabelMinFontSize: 10,
          countryLabelMaxFontSize: 14,
          countryLabelZoomGrowthRate: 1,
        }}
      />,
    );

    expect(
      getCountryLabelFontSize(container, "United States") * 16,
    ).toBeCloseTo(14);
  });

  it("renders supplied pins at longitude and latitude positions", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        pins={[
          {
            id: "washington-dc",
            countryCode: "US",
            kind: "capital",
            caption: "Washington, DC (capital)",
            coordinates: [-77.0163, 38.9047],
          },
        ]}
        zoom={{ initialScale: 4 }}
      />,
    );

    expect(
      container.querySelector(
        '[data-map-pin="capital"][data-country-code="US"]',
      ),
    ).not.toBeNull();
    expect(screen.getByText("Washington, DC (capital)")).toBeInTheDocument();
  });

  it("does not render pins unless consumers supply them", () => {
    const { container } = render(
      <WorldMap data={DATA} size={1200} zoom={{ initialScale: 4 }} />,
    );

    expect(container.querySelector("[data-map-pin]")).toBeNull();
  });

  it("can hide supplied pins through zoom options", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={1200}
        pins={[
          {
            caption: "Hidden pin",
            coordinates: [-77.0163, 38.9047],
          },
        ]}
        zoom={{ initialScale: 4, showPins: false }}
      />,
    );

    expect(container.querySelector("[data-map-pin]")).toBeNull();
  });
});
