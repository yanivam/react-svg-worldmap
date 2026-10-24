import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { gdpData } from "../data/CountryData";

// Countries with data get darker as the value grows; the rest are grey.
const getStyle = ({ countryValue, maxValue }: CountryContext) => ({
  fill: countryValue === undefined ? "#e5e7eb" : "#16a34a",
  fillOpacity:
    countryValue === undefined ? 1 : 0.2 + 0.8 * (countryValue / maxValue),
  stroke: "#ffffff",
  strokeWidth: 0.5,
  cursor: "pointer",
});

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="GDP per capita"
      valuePrefix="$"
      data={gdpData}
      styleFunction={getStyle}
    />
  );
}
