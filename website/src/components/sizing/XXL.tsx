import * as React from "react";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";
import WorldMap from "react-svg-worldmap";
import { GDPData } from "../../data/CountryData";

const detailProvider = createRegionsDetailProvider();

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
      zoom={{ initialScale: 4 }}
      detailLevel="regions"
      detailProvider={detailProvider}
      showRegionList={false}
    />
  );
}
