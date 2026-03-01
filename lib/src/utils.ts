import { useState, useLayoutEffect, useEffect } from "react";
import { sizeMap, defaultSize, sizeBreakpoints } from "./constants.js";
import type { SizeOption } from "./types.js";

/**
 * This hook is like useLayoutEffect, but without the SSR warning
 * It seems hacky but it's used in many React libs (Redux, Formik...)
 * Also mentioned here: https://github.com/facebook/react/issues/16956
 * It is useful when you need to update a ref as soon as possible after a React
 * Render (before `useEffect`)
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Calculate window width (fallback when container is not measured)
export function useWindowWidth(): number {
  const [width, setWidth] = useState(sizeMap[defaultSize]);
  useIsomorphicLayoutEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  return width;
}

/**
 * Returns the width of the container element when available.
 * Pass the wrapper element (e.g. from ref callback or state);
 * When null or in SSR,
 * Returns null (caller should fall back to window width).
 */
export function useContainerWidth(
  containerEl: HTMLElement | null,
): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || !containerEl) {
      setWidth(null);
      return undefined;
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    ro.observe(containerEl);
    setWidth(containerEl.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [containerEl]);

  return width;
}

/**
 * Pick the largest breakpoint <= available width, then cap by preset if given.
 * Uses deterministic sorted breakpoints (not object key order).
 */
function largestFittingWidth(availableWidth: number): number {
  const fitting =
    sizeBreakpoints.filter((s) => s <= availableWidth).pop() ??
    sizeBreakpoints[0];
  return fitting ?? sizeMap[defaultSize]; // Fallback to default size if no fitting breakpoint is found
}

// Adjust responsive size (container-first when containerWidth is provided)
export function responsify(
  sizeOption: SizeOption | "responsive",
  availableWidth: number,
): number {
  if (sizeOption === "responsive") {
    if (typeof window === "undefined") return sizeMap[defaultSize];
    return Math.min(
      availableWidth,
      Math.min(window.innerHeight, window.innerWidth) * 0.75,
    );
  }
  if (typeof window === "undefined") return sizeMap[sizeOption];

  const fittingSize = largestFittingWidth(availableWidth);
  return Math.min(fittingSize, sizeMap[sizeOption]);
}
