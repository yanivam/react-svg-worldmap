import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="pink"
      tooltipBgColor="black"
      title="Top 10 GDP per Capita Responsive Map"
      valuePrefix="$"
      size="responsive"
      data={GDPData}
      frame
    />
  );
}
