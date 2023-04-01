import * as React from "react";
import type { ComponentProps, ForwardedRef } from "react";

export interface Props extends Omit<ComponentProps<"path">, "href"> {
  strokeOpacity: string | number;
  href?: ComponentProps<"a"> | string | undefined;
}

function onMouseOver(strokeOpacity: number) {
  return (event: React.MouseEvent<SVGPathElement>) => {
    event.currentTarget.style.strokeWidth = "2";
    event.currentTarget.style.strokeOpacity = String(
      Math.min(strokeOpacity + 0.3, 1),
    );
  };
}

function onMouseOut(strokeOpacity: number) {
  return (event: React.MouseEvent<SVGPathElement>) => {
    event.currentTarget.style.strokeWidth = "1";
    event.currentTarget.style.strokeOpacity = String(strokeOpacity);
  };
}

function Region({ href, ...props }: Props, ref: ForwardedRef<SVGPathElement>) {
  const path = (
    <path
      onMouseOver={onMouseOver(Number(props.strokeOpacity))}
      onMouseOut={onMouseOut(Number(props.strokeOpacity))}
      ref={ref}
      {...props}
    />
  );

  if (href)
    return <a {...(typeof href === "string" ? { href } : href)}>{path}</a>;

  return path;
}

export default React.forwardRef(Region);
