import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

// The browser's Intl API translates country names and formats numbers.
const countryNames = new Intl.DisplayNames(["es"], { type: "region" });
const numbers = new Intl.NumberFormat("es");

const getTooltip = ({ countryCode, countryValue = 0 }: CountryContext) =>
  `${countryNames.of(countryCode)}: ${numbers.format(countryValue)} millones de habitantes`;

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="Población mundial"
      color="#2563eb"
      data={populationData}
      tooltipTextFunction={getTooltip}
    />
  );
}
