import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import WorldMap from "../index.js";
import { withHashedPaths } from "./snapshotPaths.js";

// Same mock as WorldMap.test.tsx: the tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

// Guards the default look of `<WorldMap data={...} />` across releases.
// Path data is hashed (see snapshotPaths.ts) so the snapshot stays readable
// while still catching geometry changes. Update this snapshot only for an
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
    expect(withHashedPaths(container.firstElementChild!)).toMatchSnapshot();
  });
});
