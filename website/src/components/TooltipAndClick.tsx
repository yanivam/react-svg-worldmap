import * as React from "react";
import { useState } from "react";
import WorldMap from "react-svg-worldmap";
import { gdpData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

const money = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function App(): JSX.Element {
  const theme = useMapTheme();
  const [selected, setSelected] = useState<string>();

  // Hover shows a formatted tooltip; click outlines the country.
  return (
    <WorldMap
      {...theme}
      title="GDP per capita: hover for details, click to select"
      color="#22c55e"
      data={gdpData}
      tooltipTextFunction={({ countryName, countryValue = 0 }) =>
        `${countryName}: ${money.format(countryValue)} per person`
      }
      onClickFunction={({ countryCode }) => setSelected(countryCode)}
      styleFunction={({ countryCode, countryValue, minValue, maxValue }) => ({
        fill: "#22c55e",
        fillOpacity:
          countryValue === undefined
            ? 0
            : 0.2 + (0.6 * (countryValue - minValue)) / (maxValue - minValue),
        stroke: countryCode === selected ? theme.borderColor : "#9ca3af",
        strokeWidth: countryCode === selected ? 2 : 0.5,
        cursor: "pointer",
      })}
    />
  );
}
