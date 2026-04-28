import * as React from "react";

import TextLabel from "./TextLabel.js";
import type { ISOCode } from "../types.js";

export interface Props {
  countryCode: ISOCode;
  name: string;
  scale: number;
  x: number;
  y: number;
}

export default function CityMarker({
  countryCode,
  name,
  scale,
  x,
  y,
}: Props): JSX.Element {
  const markerScale = 1 / scale;
  const labelOffset = 10 * markerScale;
  const fontSize = 10 * markerScale;
  const strokeWidth = 1.5 * markerScale;
  const pinInset = 5 * markerScale;
  const pinRadius = 6 * markerScale;
  const pinTop = 7 * markerScale;
  const pinTip = 8 * markerScale;
  const label = `${name} (capital)`;

  return (
    <g
      data-city-kind="capital"
      data-country-code={countryCode.toUpperCase()}
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
        fill="#b91c1c"
        stroke="#fff"
        strokeWidth={strokeWidth}
      />
      <TextLabel
        label={label}
        x={x + labelOffset}
        y={y - labelOffset}
        fill="#1f2937"
        fontSize={fontSize}
        paintOrder="stroke"
        stroke="#fff"
        strokeWidth={3 * markerScale}
      />
    </g>
  );
}
