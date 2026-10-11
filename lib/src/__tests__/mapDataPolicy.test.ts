import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const policyPath = resolve(process.cwd(), "../docs/map-data-policy.md");
const overridesPath = resolve(process.cwd(), "../docs/map-data-overrides.json");

function readPolicy() {
  return readFileSync(policyPath, "utf8");
}

function normalizedPolicy() {
  return readPolicy().replace(/\s+/g, " ").toLowerCase();
}

function readOverrides() {
  return JSON.parse(readFileSync(overridesPath, "utf8")) as {
    cases: Array<{
      id: string;
      tier?: string;
      mode?: string;
      reviewStatus?: string;
      notes?: string;
      cutoffCriteria?: string[];
    }>;
  };
}

describe("map data policy", () => {
  it("documents Tier 1 scope and cutoff criteria", () => {
    const policy = normalizedPolicy();

    expect(policy).toContain("tier 1");
    expect(policy).toContain("crimea");
    expect(policy).toContain("palestinian territories");
    expect(policy).toContain("taiwan");
    expect(policy).toContain("kashmir");
    expect(policy).toContain("western sahara");
    expect(policy).toContain("kosovo");
    expect(policy).toContain("inclusion criteria");
    expect(policy).toContain("united nations");
    expect(policy).toContain("major map platforms");
  });

  it("documents rejected fringe claims and contributor evidence expectations", () => {
    const policy = normalizedPolicy();

    expect(policy).toContain("reject");
    expect(policy).toContain("fringe");
    expect(policy).toContain("requested change");
    expect(policy).toContain("public source evidence");
    expect(policy).toContain("which inclusion criterion is met");
  });

  it("documents review outcomes for credible, deferred, and fringe proposals", () => {
    const policy = normalizedPolicy();

    expect(policy).toContain("accept");
    expect(policy).toContain("request-evidence");
    expect(policy).toContain("redirect");
    expect(policy).toContain("defer");
    expect(policy).toContain("reject");
    expect(policy).toContain("deferred tier 2");
    expect(policy).toContain("rejected fringe");
  });
});

describe("map data overrides", () => {
  it("contains the six required Tier 1 cases with governance fields", () => {
    const overrides = readOverrides();

    for (const id of [
      "crimea",
      "palestinian-territories",
      "taiwan",
      "kashmir",
      "western-sahara",
      "kosovo",
    ]) {
      const entry = overrides.cases.find((item) => item.id === id);

      expect(entry).toBeDefined();
      expect(entry?.tier).toBe("tier-1");
      expect(entry?.reviewStatus).toBe("active");
      expect(typeof entry?.mode).toBe("string");
      expect(typeof entry?.notes).toBe("string");
      expect(Array.isArray(entry?.cutoffCriteria)).toBe(true);
    }
  });
});
