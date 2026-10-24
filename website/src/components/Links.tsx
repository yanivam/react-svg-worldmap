import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="Population: click a country to open its Wikipedia page"
      color="#2563eb"
      valueSuffix="million people"
      data={populationData}
      hrefFunction={({ countryName }) => ({
        href: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
        target: "_blank",
      })}
    />
  );
}
