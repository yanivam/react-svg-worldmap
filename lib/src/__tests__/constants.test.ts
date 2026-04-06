import { describe, it, expect } from "vitest";
import {
  defaultSize,
  defaultColor,
  heightRatio,
  sizeMap,
  sizeBreakpoints,
  defaultCountryStyle,
  defaultTooltip,
} from "../constants.js";
import type { CountryContext, ISOCode } from "../types.js";

// Satisfy the TS import for React.CSSProperties used
// in the string-value test below.
import type React from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeCtx = (overrides: Partial<CountryContext> = {}): CountryContext => ({
  countryCode: "US" as ISOCode,
  countryName: "United States",
  color: "#dddddd",
  minValue: 0,
  maxValue: 100,
  prefix: "",
  suffix: "",
  ...overrides,
});

// ── Global constants ─────────────────────────────────────────────────────────

describe("module constants", () => {
  it("defaultSize is xl", () => {
    expect(defaultSize).toBe("xl");
  });

  it("defaultColor is #dddddd", () => {
    expect(defaultColor).toBe("#dddddd");
  });

  it("heightRatio is 3/4", () => {
    expect(heightRatio).toBeCloseTo(0.75);
  });
});

// ── sizeMap ──────────────────────────────────────────────────────────────────

describe("sizeMap", () => {
  it("has the expected pixel widths for every preset", () => {
    expect(sizeMap.sm).toBe(240);
    expect(sizeMap.md).toBe(336);
    expect(sizeMap.lg).toBe(480);
    expect(sizeMap.xl).toBe(640);
    expect(sizeMap.xxl).toBe(1200);
  });
});

// ── sizeBreakpoints ──────────────────────────────────────────────────────────

describe("sizeBreakpoints", () => {
  it("is sorted in ascending order", () => {
    const sorted = [...sizeBreakpoints].sort((a, b) => a - b);
    expect(sizeBreakpoints).toEqual(sorted);
  });

  it("exactly mirrors the sizeMap values", () => {
    expect(sizeBreakpoints).toEqual(Object.values(sizeMap));
  });
});

// ── defaultCountryStyle ──────────────────────────────────────────────────────

describe("defaultCountryStyle", () => {
  const style = defaultCountryStyle("black", 0.2);

  it("returns opacity 0 when countryValue is undefined (country not in data)", () => {
    const result = style(makeCtx({ countryValue: undefined }));
    expect(result.fillOpacity).toBe(0);
  });

  it("returns the minimum opacity (0.2) when countryValue equals minValue", () => {
    const result = style(
      makeCtx({ countryValue: 0, minValue: 0, maxValue: 100 }),
    );
    expect(result.fillOpacity).toBeCloseTo(0.2);
  });

  it("returns the maximum opacity (0.8) when countryValue equals maxValue", () => {
    const result = style(
      makeCtx({ countryValue: 100, minValue: 0, maxValue: 100 }),
    );
    expect(result.fillOpacity).toBeCloseTo(0.8);
  });

  it("returns a mid-range opacity for a midpoint value", () => {
    const result = style(
      makeCtx({ countryValue: 50, minValue: 0, maxValue: 100 }),
    );
    // 0.2 + 0.6 * 0.5 = 0.5
    expect(result.fillOpacity).toBeCloseTo(0.5);
  });

  it("handles single-value data (min === max) by returning 0.8 instead of NaN", () => {
    const result = style(
      makeCtx({ countryValue: 50, minValue: 50, maxValue: 50 }),
    );
    expect(result.fillOpacity).toBe(0.8);
  });

  it("treats string countryValue as minValue for opacity calculation", () => {
    const strStyle = defaultCountryStyle("black", 0.2) as (
      ctx: CountryContext<string>,
    ) => React.CSSProperties;
    const result = strStyle({
      countryCode: "US" as ISOCode,
      countryName: "United States",
      color: "#dddddd",
      countryValue: "N/A",
      minValue: 0,
      maxValue: 100,
      prefix: "",
      suffix: "",
    });
    expect(result.fillOpacity).toBeCloseTo(0.2);
  });

  it("fills with the provided color from context", () => {
    const result = style(makeCtx({ color: "red", countryValue: 50 }));
    expect(result.fill).toBe("red");
  });

  it("applies the borderColor as the stroke", () => {
    const customStyle = defaultCountryStyle("green", 0.2);
    const result = customStyle(makeCtx({ countryValue: 50 }));
    expect(result.stroke).toBe("green");
  });

  it("passes strokeOpacity through unchanged", () => {
    const customStyle = defaultCountryStyle("black", 0.7);
    const result = customStyle(makeCtx({ countryValue: 50 }));
    expect(result.strokeOpacity).toBe(0.7);
  });

  it("always sets cursor to pointer", () => {
    const result = style(makeCtx({ countryValue: 50 }));
    expect(result.cursor).toBe("pointer");
  });
});

// ── defaultTooltip ───────────────────────────────────────────────────────────

describe("defaultTooltip", () => {
  it("returns country name and value separated by a space", () => {
    const tip = defaultTooltip(
      makeCtx({ countryName: "France", countryValue: 42 }),
    );
    expect(tip).toBe("France 42");
  });

  it("includes a prefix between the country name and value", () => {
    const tip = defaultTooltip(
      makeCtx({ countryName: "USA", countryValue: 42, prefix: "$" }),
    );
    expect(tip).toBe("USA $ 42");
  });

  it("appends a suffix after the value", () => {
    const tip = defaultTooltip(
      makeCtx({ countryName: "USA", countryValue: 42, suffix: "people" }),
    );
    expect(tip).toBe("USA 42 people");
  });

  it("includes both prefix and suffix", () => {
    const tip = defaultTooltip(
      makeCtx({
        countryName: "USA",
        countryValue: 42,
        prefix: "$",
        suffix: "USD",
      }),
    );
    expect(tip).toBe("USA $ 42 USD");
  });

  it("omits empty prefix/suffix parts so there are no double spaces", () => {
    const tip = defaultTooltip(
      makeCtx({ countryName: "UK", countryValue: 7, prefix: "", suffix: "" }),
    );
    expect(tip).not.toContain("  ");
  });
});
