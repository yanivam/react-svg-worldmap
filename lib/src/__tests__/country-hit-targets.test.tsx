import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import WorldMap from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const regressionCountries = [
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" },
  { code: "NG", name: "Nigeria" },
  { code: "BR", name: "Brazil" },
  { code: "RU", name: "Russia" },
] as const;

describe("country hit target geometry", () => {
  it("keeps rendered country identity aligned for known regression countries", () => {
    const { container } = render(
      <WorldMap
        data={regressionCountries.map(({ code }, index) => ({
          country: code,
          value: index + 1,
        }))}
        zoom
      />,
    );

    for (const country of regressionCountries) {
      const path = container.querySelector(
        `[data-country-code="${country.code}"]`,
      );

      expect(path).not.toBeNull();
      expect(path?.getAttribute("d")).toMatch(/^M/);
      expect(path?.getAttribute("data-map-interaction-target")).toBe("country");
      expect(path?.querySelector("title")?.textContent).toContain(country.name);
    }
  });

  it("does not report Russia for other visible regression countries", () => {
    const { container } = render(
      <WorldMap
        data={[
          { country: "US", value: 1 },
          { country: "MX", value: 2 },
          { country: "NG", value: 3 },
          { country: "BR", value: 4 },
          { country: "RU", value: 5 },
        ]}
        zoom
      />,
    );

    for (const code of ["US", "MX", "NG", "BR"] as const) {
      const path = container.querySelector(`[data-country-code="${code}"]`);

      expect(path?.querySelector("title")?.textContent).not.toContain("Russia");
    }
  });

  it("places United States label on its largest visible land part", () => {
    const { container } = render(
      <WorldMap data={[{ country: "US", value: 1 }]} zoom />,
    );
    const label = Array.from(container.querySelectorAll("svg text")).find(
      (text) => text.textContent === "United States",
    );

    expect(label).not.toBeNull();
    expect(Number(label?.getAttribute("x"))).toBeLessThan(320);
    expect(Number(label?.getAttribute("y"))).toBeLessThan(220);
  });
});
