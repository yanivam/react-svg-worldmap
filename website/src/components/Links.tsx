import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

const getHref = ({ countryName }: CountryContext) => ({
  href: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
  target: "_blank",
});

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      data={populationData}
      hrefFunction={getHref}
    />
  );
}
