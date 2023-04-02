import type { RefObject } from "react";
import * as React from "react";
import { PathTooltip } from "react-path-tooltip";

export function drawTooltip(
  tip: string | undefined,
  tooltipBgColor: string,
  tooltipTextColor: string,
  rtl: boolean,
  triggerRef: RefObject<SVGElement>,
  containerRef: RefObject<SVGSVGElement>,
): JSX.Element | null {
  return tip ? (
    <PathTooltip
      fontSize={12}
      bgColor={tooltipBgColor}
      textColor={tooltipTextColor}
      key={tip}
      pathRef={triggerRef}
      svgRef={containerRef}
      rtl={rtl}
      tip={tip}
    />
  ) : null;
}
