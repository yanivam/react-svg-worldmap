import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

export default function App(): JSX.Element {
  const theme = useMapTheme();
  return (
    <WorldMap
      {...theme}
      title="Population: click a country to open its Wikipedia page"
      color="#3b82f6"
      valueSuffix="million people"
      data={populationData}
      hrefFunction={({ countryName }) => ({
        href: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
        target: "_blank",
      })}
    />
  );
}
