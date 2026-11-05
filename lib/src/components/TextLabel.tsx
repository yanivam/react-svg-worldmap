import * as React from "react";
import type { ComponentProps } from "react";

export interface Props extends ComponentProps<"text"> {
  readonly label: string;
}

export default function TextLabel({ label, ...props }: Props): JSX.Element {
  return <text {...props}>{label}</text>;
}
