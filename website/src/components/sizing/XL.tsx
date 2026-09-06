import * as React from "react";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

const detailProvider = createRegionsDetailProvider();

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
      zoom
      detailLevel="regions"
      detailProvider={detailProvider}
    />
  );
}
