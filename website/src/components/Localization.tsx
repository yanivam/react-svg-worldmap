import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// The browser's Intl API translates country names and formats numbers.
const countryNames = new Intl.DisplayNames(["es"], { type: "region" });
const numbers = new Intl.NumberFormat("es");

const getTooltip = ({ countryCode, countryValue = 0 }: CountryContext) =>
  `${countryNames.of(countryCode)}: ${numbers.format(countryValue)} millones de habitantes`;

export default function App(): JSX.Element {
  const theme = useMapTheme();
  return (
    <WorldMap
      {...theme}
      title="Población mundial"
      color="#3b82f6"
      data={populationData}
      tooltipTextFunction={getTooltip}
    />
  );
}
