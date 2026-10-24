import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="Population"
      color="#2563eb"
      valueSuffix="million people"
      size="responsive"
      data={populationData}
    />
  );
}
