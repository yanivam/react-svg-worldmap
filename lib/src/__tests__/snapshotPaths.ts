import { createHash } from "node:crypto";

// SVG path data is replaced by a short hash so render snapshots stay readable
// while still catching geometry changes. Coordinates are rounded to 0.1 first:
// d3's trigonometry gives slightly different floating-point results on arm64
// (Apple Silicon) and x86, so hashing the raw strings fails on one of them.
export function hashPathData(d: string): string {
  const rounded = d.replace(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi, (n) => {
    const fixed = Number(n).toFixed(1);
    return fixed === "-0.0" ? "0.0" : fixed;
  });
  return `sha1:${createHash("sha1").update(rounded).digest("hex").slice(0, 12)}`;
}

/** Clones a rendered map and replaces every path's `d` with its hash. */
export function withHashedPaths(root: Element): Element {
  const clone = root.cloneNode(true) as Element;
  clone.querySelectorAll("path[d]").forEach((path) => {
    path.setAttribute("d", hashPathData(path.getAttribute("d")!));
  });
  return clone;
}
