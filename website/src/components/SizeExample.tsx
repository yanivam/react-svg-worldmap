import * as React from "react";
import type { SizeOption } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

export type ExampleSize = SizeOption | "responsive" | number;

export default function SizeExample({
  size,
}: {
  readonly size: ExampleSize;
}): JSX.Element {
  const theme = useMapTheme();
  return (
    <WorldMap
      {...theme}
      title="Population"
      color="#3b82f6"
      valueSuffix="million people"
      size={size}
      data={populationData}
    />
  );
}
