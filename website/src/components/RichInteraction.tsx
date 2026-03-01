import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      size="responsive"
      frame
      data={populationData}
      richInteraction
    />
  );
}
