import * as React from "react";

export interface Props {
  color: string;
}

export default function Frame({ color }: Props): JSX.Element | null {
  return (
    <rect x={0} y={0} width="100%" height="100%" stroke={color} fill="none" />
  );
}
