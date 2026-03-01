import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="#39cac4"
      tooltipBgColor="black"
      title="Top 10 GDP per Capita Numerically Sized Map"
      valuePrefix="$"
      size={100}
      data={GDPData}
      frame
    />
  );
}
