import type { ComponentProps } from "react";
import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

function createTextLabels(width: number) {
  const labels: ({ label: string } & ComponentProps<"text">)[] = [
    { label: "Atlantic", x: 0.37 * width, y: 0.39 * width },
    { label: "Indian", x: 0.69 * width, y: 0.57 * width },
    { label: "Pacific", x: 0.083 * width, y: 0.48 * width },
    {
      label: "Arctic",
      x: 0.75 * width,
      y: 0.058 * width,
      style: { fill: "blue" },
    },
  ];
  if (width < 550) {
    return labels.map((label) => ({
      ...label,
      style: { ...label.style, fontSize: "70%" },
    }));
  }
  return labels;
}

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      size="responsive"
      frame
      data={populationData}
      textLabelFunction={createTextLabels}
    />
  );
}
