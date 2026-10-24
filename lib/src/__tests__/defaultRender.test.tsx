import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import WorldMap from "../index.js";
import { withHashedPaths } from "./snapshotPaths.js";

// Same mock as WorldMap.test.tsx: the tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [
  { country: "us", value: 100 },
  { country: "ua", value: 50 },
] as const;

// Removes the styling and testing hooks added in 2.4.0: the `data-map-*` and
// `data-country-*` attributes, and the ocean layer, whose rect has the same
// colour as the figure behind it. What is left must match the 2.3.0 render.
function withoutStylingHooks(root: Element): Element {
  const clone = root.cloneNode(true) as Element;
  clone.querySelector('[data-map-layer="ocean"]')?.remove();
  for (const el of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
    for (const name of el.getAttributeNames()) {
      if (name.startsWith("data-map-") || name.startsWith("data-country-")) 
        el.removeAttribute(name);
      
    }
  }
  return clone;
}

// Guards the default look of `<WorldMap data={...} />` across releases.
// Path data is hashed (see snapshotPaths.ts) so the snapshot stays readable
// while still catching geometry changes. Update this snapshot only for an
// intentional visual change (a major release).
describe("WorldMap — default render", () => {
  it("matches the default render snapshot", () => {
    const { container } = render(<WorldMap data={[...DATA]} />);
    expect(
      withoutStylingHooks(withHashedPaths(container.firstElementChild!)),
    ).toMatchSnapshot();
  });

  it("paints the ocean in the figure's background colour", () => {
    const { container } = render(<WorldMap data={[...DATA]} />);
    const figure = container.querySelector("figure")!;
    const ocean = container.querySelector("[data-map-ocean]")!;
    expect(figure.style.backgroundColor).toBe("white");
    expect(ocean.getAttribute("fill")).toBe("white");
  });
});
