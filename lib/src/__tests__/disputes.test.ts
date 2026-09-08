import { describe, expect, it } from "vitest";

import {
  disputeIds,
  disputedTerritories,
  getDisputeByCountryCode,
  getDisputeById,
} from "../disputes.js";

describe("disputed territories", () => {
  it("defines the supported Tier 1 disputes", () => {
    expect(disputeIds).toEqual([
      "crimea",
      "palestinian-territories",
      "taiwan",
      "kashmir",
      "western-sahara",
      "kosovo",
    ]);
    expect(disputedTerritories.crimea.recognizedSovereign).toBe("Ukraine");
    expect(disputedTerritories.kosovo.status).toBe("partially-recognized");
  });

  it("resolves metadata by ID and existing country code", () => {
    expect(getDisputeById("crimea")).toBe(disputedTerritories.crimea);
    expect(getDisputeByCountryCode("ua")?.id).toBe("crimea");
    expect(getDisputeByCountryCode("US")).toBeUndefined();
  });
});
