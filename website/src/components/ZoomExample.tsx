import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

export default function ZoomExample(): JSX.Element {
  return (
    <WorldMap
      title="Zoomable world map"
      size="responsive"
      frame
      data={populationData}
      zoom
    />
  );
}
