import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="red"
      tooltipBgColor="blue"
      title="Top 10 Populous Countries Small Map"
      valueSuffix="people"
      size="sm"
      data={populationData}
      frame
    />
  );
}
