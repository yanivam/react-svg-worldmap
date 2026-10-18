import { describe, it, expect } from "vitest";

import { hashPathData } from "./snapshotPaths.js";

describe("hashPathData", () => {
  it("ignores floating-point noise between platforms", () => {
    expect(hashPathData("M480.12345678901,250.000000000001L1e-13,-2.5Z")).toBe(
      hashPathData("M480.12345678902,249.999999999999L-1e-13,-2.5Z"),
    );
  });

  it("changes when the geometry moves by a visible amount", () => {
    expect(hashPathData("M480,250L10,20Z")).not.toBe(
      hashPathData("M480,250.5L10,20Z"),
    );
  });

  it("returns a short sha1 label", () => {
    expect(hashPathData("M0,0Z")).toMatch(/^sha1:[0-9a-f]{12}$/);
  });
});
