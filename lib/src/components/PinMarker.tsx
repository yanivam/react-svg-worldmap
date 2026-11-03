import * as React from "react";

import TextLabel from "./TextLabel.js";
import type { ISOCode } from "../types.js";

export interface Props {
  readonly caption: string;
  readonly countryCode?: ISOCode;
  readonly kind?: string;
  /** Screen pixels per map unit, so the marker keeps its on-screen size. */
  readonly mapScale: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly textColor: string;
  readonly outlineColor: string;
}

export default function PinMarker({
  caption,
  countryCode,
  kind = "pin",
  mapScale,
  x,
  y,
  color,
  textColor,
  outlineColor,
}: Props): JSX.Element {
  const markerScale = 1 / mapScale;
  const labelOffset = 10 * markerScale;
  const fontSize = 10 * markerScale;
  const strokeWidth = 1.5 * markerScale;
  const pinInset = 5 * markerScale;
  const pinRadius = 6 * markerScale;
  const pinTop = 7 * markerScale;
  const pinTip = 8 * markerScale;

  return (
    <g
      data-map-pin={kind}
      {...(countryCode != null
        ? { "data-country-code": countryCode.toUpperCase() }
        : {})}
      pointerEvents="none">
      <path
        d={[
          `M ${x} ${y + pinTip}`,
          `C ${x - pinInset} ${y + markerScale}`,
          `${x - pinRadius} ${y - 4 * markerScale}`,
          `${x - pinRadius} ${y - pinTop}`,
          `A ${pinRadius} ${pinRadius} 0 1 1 ${x + pinRadius} ${y - pinTop}`,
          `C ${x + pinRadius} ${y - 4 * markerScale}`,
          `${x + pinInset} ${y + markerScale}`,
          `${x} ${y + pinTip}`,
          "Z",
        ].join(" ")}
        fill={color}
        stroke={outlineColor}
        strokeWidth={strokeWidth}
      />
      <TextLabel
        label={caption}
        x={x + labelOffset}
        y={y - labelOffset}
        fill={textColor}
        fontSize={fontSize}
        paintOrder="stroke"
        stroke={outlineColor}
        strokeWidth={3 * markerScale}
      />
    </g>
  );
}
