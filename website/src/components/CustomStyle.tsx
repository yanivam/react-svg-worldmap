import * as React from "react";
import type { CountryContext, Data } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

const data: Data = [
  { country: "cn", value: 5 }, // China
  { country: "us", value: 10 }, // United States
  { country: "ru", value: 7 }, // Russia
];

const getStyle = ({
  countryValue,
  countryCode,
  minValue,
  maxValue,
  color,
}: CountryContext) => ({
  fill: countryCode === "US" ? "blue" : color,
  fillOpacity: countryValue
    ? 0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue)
    : 0,
  stroke: "green",
  strokeWidth: 1,
  strokeOpacity: 0.2,
  cursor: "pointer",
});

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="red"
      tooltipBgColor="#D3D3D3"
      title="Custom Styles Map"
      valueSuffix="points"
      data={data}
      frame
      styleFunction={getStyle}
    />
  );
}
