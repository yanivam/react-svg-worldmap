import { createHash } from "node:crypto";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import WorldMap from "../index.js";

// Same mock as WorldMap.test.tsx: the tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

// Guards the default look of `<WorldMap data={...} />` across releases.
// Path data is replaced by a short hash so the snapshot stays readable while
// still catching geometry changes. Update this snapshot only for an
// intentional visual change (a major release).
describe("WorldMap — default render", () => {
  it("matches the default render snapshot", () => {
    const { container } = render(
      <WorldMap
        data={[
          { country: "us", value: 100 },
          { country: "ua", value: 50 },
        ]}
      />,
    );
    const root = container.firstElementChild!.cloneNode(true) as Element;
    root.querySelectorAll("path[d]").forEach((path) => {
      const d = path.getAttribute("d")!;
      path.setAttribute(
        "d",
        `sha1:${createHash("sha1").update(d).digest("hex").slice(0, 12)}`,
      );
    });
    expect(root).toMatchSnapshot();
  });
});
