import * as React from "react";
import { useState, useRef, useCallback } from "react";
import type { ComponentProps, ForwardedRef } from "react";

export interface Props extends Omit<ComponentProps<"path">, "href"> {
  strokeOpacity: string | number;
  href?: ComponentProps<"a"> | string | undefined;
  regionClassName?: string;
  /** Country name used as the accessible label and SVG title fallback. */
  countryName?: string;
  /**
   * Text rendered as an SVG <title> child — read by screen readers and shown
   * as a native browser tooltip on hover. Provides a text alternative for the
   * colour-coded data values (WCAG 1.1.1, 1.4.1).
   */
  svgTitle?: string;
  /**
   * When true the region is interactive (onClick or href is set).
   * Enables keyboard support and appropriate ARIA role (WCAG 2.1.1, 4.1.2).
   */
  isInteractive?: boolean;
}

const HOVER_CLASS = "worldmap__region--hover";

function Region(
  {
    href,
    regionClassName,
    className,
    countryName,
    svgTitle,
    isInteractive,
    ...pathProps
  }: Props,
  forwardedRef: ForwardedRef<SVGPathElement>,
) {
  const [hover, setHover] = useState(false);
  // Local ref needed to dispatch synthetic mouse events on keyboard focus so
  // that react-path-tooltip (which listens to mouse events on the element)
  // also activates when a keyboard user focuses the region (WCAG 1.4.13).
  const localRef = useRef<SVGPathElement | null>(null);
  const strokeOpacity = Number(pathProps.strokeOpacity);

  // Merge the externally-forwarded ref (used by react-path-tooltip for
  // positioning) with our internal local ref.
  const mergedRef = useCallback(
    (node: SVGPathElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const pathClassName = [className, regionClassName, hover && HOVER_CLASS]
    .filter(Boolean)
    .join(" ");

  const hoverStyle =
    !regionClassName && hover
      ? {
          strokeWidth: 2,
          strokeOpacity: Math.min(strokeOpacity + 0.3, 1),
        }
      : undefined;

  const showHover = () => {
    setHover(true);
    // Fire both bubbling mouseover and non-bubbling mouseenter so that
    // react-path-tooltip shows its popup when the element gains keyboard focus.
    localRef.current?.dispatchEvent(
      new MouseEvent("mouseover", { bubbles: true }),
    );
    localRef.current?.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: false }),
    );
  };

  const hideHover = () => {
    setHover(false);
    localRef.current?.dispatchEvent(
      new MouseEvent("mouseout", { bubbles: true }),
    );
    localRef.current?.dispatchEvent(
      new MouseEvent("mouseleave", { bubbles: false }),
    );
  };

  // Activate onClick via Enter or Space for button-like regions (WCAG 2.1.1).
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pathProps.onClick?.(e as unknown as React.MouseEvent<SVGPathElement>);
    }
  };

  // Extra ARIA/keyboard props — only applied when the region acts as a button.
  const buttonProps =
    isInteractive && !href
      ? { role: "button" as const, tabIndex: 0, onKeyDown: handleKeyDown }
      : {};

  const path = (
    <path
      ref={mergedRef}
      className={pathClassName || undefined}
      aria-label={isInteractive ? countryName : undefined}
      {...buttonProps}
      {...pathProps}
      style={
        hoverStyle ? { ...pathProps.style, ...hoverStyle } : pathProps.style
      }
      // Accessibility handlers come after pathProps spread so they are never
      // accidentally overridden by the consumer.
      onMouseOver={showHover}
      onMouseOut={hideHover}
      onFocus={showHover}
      onBlur={hideHover}>
      {/* SVG <title> provides a text alternative for the colour-coded value
          (WCAG 1.1.1) and a native tooltip visible on hover/focus (WCAG 1.4.13). */}
      {svgTitle != null && <title>{svgTitle}</title>}
    </path>
  );

  if (href) {
    return (
      // Aria-label on <a> ensures the link has an accessible name even though
      // its only child is an SVG path (WCAG 4.1.2).
      <a
        aria-label={countryName}
        {...(typeof href === "string" ? { href } : href)}>
        {path}
      </a>
    );
  }

  return path;
}

export default React.forwardRef(Region);
