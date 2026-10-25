import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../../data/CountryData";
import { useMapTheme } from "../mapTheme";

export default function App(): JSX.Element {
  const theme = useMapTheme();
  return (
    <WorldMap
      {...theme}
      title="Population"
      color="#3b82f6"
      valueSuffix="million people"
      size="md"
      data={populationData}
    />
  );
}
