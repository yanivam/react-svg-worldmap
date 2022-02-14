import React from "react";
import type { ComponentProps, ForwardedRef } from "react";

export interface Props extends Omit<ComponentProps<"path">, "href"> {
  strokeOpacity: string | number;
  href?: ComponentProps<"a"> | string;
}

function onMouseOver(event: React.MouseEvent<SVGPathElement>) {
  event.currentTarget.style.strokeWidth = "2";
  event.currentTarget.style.strokeOpacity = "0.5";
}

function onMouseOut(event: React.MouseEvent<SVGPathElement>) {
  event.currentTarget.style.strokeWidth = "2";
  event.currentTarget.style.strokeOpacity = "0.5";
}

function Region({ href, ...props }: Props, ref: ForwardedRef<SVGPathElement>) {
  const path = (
    <path
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      ref={ref}
      {...props}
    />
  );

  if (href)
    return <a {...(typeof href === "string" ? { href } : href)}>{path}</a>;

  return path;
}

export default React.forwardRef(Region);
