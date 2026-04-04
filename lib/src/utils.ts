import { useState, useLayoutEffect, useEffect } from "react";
import { sizeMap, defaultSize } from "./constants.js";
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
    // Defer the state update to the next animation frame to avoid the
    // "ResizeObserver loop completed with undelivered notifications" warning.
    // Without this, the callback fires → React re-renders → SVG resizes →
    // ResizeObserver fires again in the same frame → browser warning.
    let rafId = 0;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        rafId = requestAnimationFrame(() => {
          setWidth(entry.contentRect.width);
        });
      }
    });
    ro.observe(containerEl);
    setWidth(containerEl.getBoundingClientRect().width);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [containerEl]);

  return width;
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

  return Math.min(availableWidth, sizeMap[sizeOption]);
}
