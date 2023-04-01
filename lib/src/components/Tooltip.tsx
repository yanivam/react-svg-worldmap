import * as React from "react";
import type { RefObject } from "react";
import { PathTooltip } from "react-path-tooltip";

export interface Props {
  tip?: string;
  bgColor: string;
  textColor: string;
  pathRef: RefObject<SVGElement>;
  svgRef: RefObject<SVGSVGElement>;
}

// TODO: need React.forwardRef to handle this
export function Tooltip({ tip, ...props }: Props): JSX.Element | null {
  return tip ? <PathTooltip fontSize={12} tip={tip} {...props} /> : null;
}

export default Tooltip;
