import { useState, useLayoutEffect, useEffect } from "react";
import { sizeMap, defaultSize } from "./constants.js";
import type { SizeOption } from "./types.js";

/**
 * This hook is like useLayoutEffect, but without the SSR warning
 * It seems hacky but it's used in many React libs (Redux, Formik...)
 * Also mentioned here: https://github.com/facebook/react/issues/16956
 * It is useful when you need to update a ref as soon as possible after a React
 * render (before `useEffect`)
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Calculate window width
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

// Adjust responsive size
export function responsify(
  sizeOption: SizeOption | "responsive",
  windowWidth: number,
): number {
  if (sizeOption === "responsive") {
    // Make component work in SSR
    if (typeof window === "undefined") return sizeMap[defaultSize];

    return Math.min(window.innerHeight, window.innerWidth) * 0.75;
  }
  if (typeof window === "undefined") return sizeMap[sizeOption];

  // First size that fits window size
  const fittingSize =
    Object.values(sizeMap)
      .reverse()
      .find((size) => size <= windowWidth) ?? sizeMap.sm;
  return Math.min(fittingSize, sizeMap[sizeOption]);
}
