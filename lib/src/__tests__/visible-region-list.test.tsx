import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import VisibleRegionList from "../components/VisibleRegionList.js";
import type { RegionCollectionRecord } from "../types.js";

const collection: RegionCollectionRecord = {
  countryCode: "US",
  countryName: "United States",
  coverageStatus: "experimental",
  regions: [
    {
      id: "west",
      countryCode: "US",
      name: "West",
      path: "M0 0 L1 0 L1 1 Z",
    },
    {
      id: "east",
      countryCode: "US",
      name: "East",
      path: "M1 0 L2 0 L2 1 Z",
    },
  ],
};

describe("VisibleRegionList", () => {
  it("renders an accessible list synchronized with region records", () => {
    render(<VisibleRegionList collection={collection} />);

    expect(
      screen.getByLabelText("Visible regions for United States"),
    ).toHaveAttribute("data-visible-region-list", "US");
    expect(screen.getByText("West")).toBeInTheDocument();
    expect(screen.getByText("East")).toBeInTheDocument();
  });
});
