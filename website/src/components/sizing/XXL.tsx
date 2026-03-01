import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="yellow"
      tooltipBgColor="black"
      title="Top 10 GDP per Capita Extra Extra Large Map"
      valuePrefix="$"
      size="xxl"
      data={GDPData}
      frame
    />
  );
}
