import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { capitalCityPins } from "../data/countryCapitalPins";

export default function ZoomExample(): JSX.Element {
  return (
    <WorldMap
      title="Zoomable world map"
      size="responsive"
      frame
      data={populationData}
      pins={capitalCityPins}
      zoom
    />
  );
}
