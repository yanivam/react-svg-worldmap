import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="green"
      tooltipBgColor="purple"
      title="Top 10 GDP per Capita Extra Large Map"
      valuePrefix="$"
      size="xl"
      data={GDPData}
      frame
    />
  );
}
