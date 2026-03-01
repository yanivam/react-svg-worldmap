import * as React from "react";
import { useState } from "react";
import type { ComponentProps, ForwardedRef } from "react";

export interface Props extends Omit<ComponentProps<"path">, "href"> {
  strokeOpacity: string | number;
  href?: ComponentProps<"a"> | string | undefined;
  regionClassName?: string;
}

const HOVER_CLASS = "worldmap__region--hover";

function Region(
  { href, regionClassName, className, ...pathProps }: Props,
  ref: ForwardedRef<SVGPathElement>,
) {
  const [hover, setHover] = useState(false);
  const strokeOpacity = Number(pathProps.strokeOpacity);

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

  const path = (
    <path
      ref={ref}
      className={pathClassName || undefined}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      {...pathProps}
      style={
        hoverStyle ? { ...pathProps.style, ...hoverStyle } : pathProps.style
      }
    />
  );

  if (href)
    return <a {...(typeof href === "string" ? { href } : href)}>{path}</a>;

  return path;
}

export default React.forwardRef(Region);
