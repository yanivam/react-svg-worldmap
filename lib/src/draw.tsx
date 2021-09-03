import * as React from 'react';
import type {ComponentProps, RefObject} from 'react';
import {PathTooltip} from 'react-path-tooltip';

export function drawFrame(isFrame: boolean, frameColor: string): JSX.Element {
  return isFrame ? (
    <rect
      x={0}
      y={0}
      width={'100%'}
      height={'100%'}
      stroke={frameColor}
      fill="none"
    />
  ) : (
    <path></path>
  );
}

export function drawRegion(
  props: ComponentProps<'path'>,
  idx: number,
  href?: ComponentProps<'a'> | string,
): JSX.Element {
  const path = (
    <path
      key={`path${idx}`}
      onMouseOver={(event) => {
        event.currentTarget.style.strokeWidth = '2';
        event.currentTarget.style.strokeOpacity = '0.5';
      }}
      onMouseOut={(event) => {
        event.currentTarget.style.strokeWidth = '1';
        event.currentTarget.style.strokeOpacity = `${props.strokeOpacity}`;
      }}
      {...props}
    />
  );

  if (href) {
    return (
      <a key={`path${idx}`} {...(typeof href === 'string' ? {href} : href)}>
        {path}
      </a>
    );
  }
  return path;
}

export function drawTooltip(
  tip: string | undefined,
  tooltipBgColor: string,
  tooltipTextColor: string,
  idx: number,
  triggerRef: RefObject<SVGElement>,
  containerRef: RefObject<SVGSVGElement>,
): JSX.Element {
  return tip ? (
    <PathTooltip
      fontSize={12}
      bgColor={tooltipBgColor}
      textColor={tooltipTextColor}
      key={`path_${idx}_xyz`}
      pathRef={triggerRef}
      svgRef={containerRef}
      tip={tip}
    />
  ) : (
    <g pointerEvents={'none'} key={`path${idx}xyz`}></g>
  );
}
