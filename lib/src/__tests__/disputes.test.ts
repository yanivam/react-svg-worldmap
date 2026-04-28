import { describe, expect, it } from "vitest";

import {
  disputeIds,
  disputedTerritories,
  disputesByCountryCode,
  getDisputeByCountryCode,
  getDisputeById,
} from "../disputes.js";
import type {
  DisputeClassification,
  DisputeDisplayGuidance,
  DisputeStatus,
  DisputeTier,
} from "../index.js";

const REQUIRED_TIER_1_IDS = [
  "crimea",
  "palestinian-territories",
  "taiwan",
  "kashmir",
  "western-sahara",
  "kosovo",
] as const;

describe("disputedTerritories", () => {
  it("contains exactly the six Tier 1 disputes", () => {
    const compare = (a: string, b: string) => a.localeCompare(b);

    expect([...disputeIds].sort(compare)).toEqual(
      [...REQUIRED_TIER_1_IDS].sort(compare),
    );
  });

  it("provides required metadata fields for every Tier 1 dispute", () => {
    for (const id of REQUIRED_TIER_1_IDS) {
      const dispute = disputedTerritories[id];

      expect(dispute.id).toBe(id);
      expect(dispute.tier).toBe("tier-1");
      expect(dispute.name.length).toBeGreaterThan(0);
      expect(dispute.status.length).toBeGreaterThan(0);
      expect(dispute.disputeParties.length).toBeGreaterThan(0);
      expect(dispute.territories.length).toBeGreaterThan(0);
      expect(dispute.sourceRationale.length).toBeGreaterThan(0);
      expect(dispute.display.tooltipLabel.length).toBeGreaterThan(0);
      expect(dispute.display.defaultDescription.length).toBeGreaterThan(0);
      expect(dispute.reviewStatus).toBe("active");
    }
  });

  it("records the required classification recommendations", () => {
    expect(disputedTerritories.crimea.recognizedSovereign).toBe("Ukraine");
    expect(disputedTerritories.crimea.controllingPower).toBe("Russia");
    expect(disputedTerritories["palestinian-territories"].territories).toEqual([
      "West Bank",
      "Gaza",
    ]);
    expect(disputedTerritories.taiwan.controllingPower).toBe("Taiwan");
    expect(disputedTerritories.kashmir.disputeParties).toEqual([
      "India",
      "Pakistan",
      "China",
    ]);
    expect(disputedTerritories["western-sahara"].status).toBe(
      "non-self-governing",
    );
    expect(disputedTerritories.kosovo.status).toBe("partially-recognized");
  });

  it("maps existing rendered region codes to dispute metadata", () => {
    expect(getDisputeByCountryCode("UA")?.id).toBe("crimea");
    expect(getDisputeByCountryCode("ps")?.id).toBe("palestinian-territories");
    expect(getDisputeByCountryCode("TW")?.id).toBe("taiwan");
    expect(getDisputeByCountryCode("IN")?.id).toBe("kashmir");
    expect(getDisputeByCountryCode("PK")?.id).toBe("kashmir");
    expect(getDisputeByCountryCode("CN")?.id).toBe("kashmir");
    expect(getDisputeByCountryCode("EH")?.id).toBe("western-sahara");
    expect(getDisputeByCountryCode("XK")?.id).toBe("kosovo");
    expect(getDisputeByCountryCode("US")).toBeUndefined();
  });

  it("exposes lookups keyed by id and country code", () => {
    expect(getDisputeById("crimea")).toBe(disputedTerritories.crimea);
    expect(disputesByCountryCode.UA).toBe("crimea");
  });

  it("exports public dispute types from the package entry point", () => {
    const tier: DisputeTier = "tier-1";
    const status: DisputeStatus = "disputed";
    const display: DisputeDisplayGuidance = disputedTerritories.crimea.display;
    const classification: DisputeClassification = disputedTerritories.crimea;

    expect(tier).toBe("tier-1");
    expect(status).toBe("disputed");
    expect(display.borderStyle).toBe("dashed");
    expect(classification.id).toBe("crimea");
  });
});
