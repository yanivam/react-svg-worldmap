import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { gdpData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

export default function App(): JSX.Element {
  const theme = useMapTheme();

  // Countries with data get darker as the value grows; the rest are a faint
  // tint of the border colour, which suits both light and dark mode.
  const getStyle = ({ countryValue, maxValue }: CountryContext) => ({
    fill: countryValue === undefined ? theme.borderColor : "#22c55e",
    fillOpacity:
      countryValue === undefined
        ? 0.12
        : 0.25 + 0.75 * (countryValue / maxValue),
    stroke: theme.backgroundColor,
    strokeWidth: 0.5,
    cursor: "pointer",
  });

  return (
    <WorldMap
      {...theme}
      title="GDP per capita"
      valuePrefix="$"
      data={gdpData}
      styleFunction={getStyle}
    />
  );
}
