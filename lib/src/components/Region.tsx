import React from 'react';
import type {ComponentProps, ForwardedRef} from 'react';

export interface Props extends Omit<ComponentProps<'path'>, 'href'> {
  strokeOpacity: string | number;
  href?: ComponentProps<'a'> | string;
}

const Region = React.forwardRef(function Region(
  {href, ...props}: Props,
  ref: ForwardedRef<SVGPathElement>,
) {
  const path = (
    <path
      onMouseOver={(event) => {
        event.currentTarget.style.strokeWidth = '2';
        event.currentTarget.style.strokeOpacity = '0.5';
      }}
      onMouseOut={(event) => {
        event.currentTarget.style.strokeWidth = '1';
        event.currentTarget.style.strokeOpacity = `${props.strokeOpacity}`;
      }}
      ref={ref}
      {...props}
    />
  );

  if (href) {
    return <a {...(typeof href === 'string' ? {href} : href)}>{path}</a>;
  }
  return path;
});

export default Region;
