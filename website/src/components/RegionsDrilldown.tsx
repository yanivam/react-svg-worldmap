import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions/dist/index.cjs";

const provider = createRegionsDetailProvider();

const data = [
  { country: "pt", value: 100 },
  { country: "es", value: 80 },
  { country: "fr", value: 60 },
  { country: "ma", value: 45 },
];

export default function RegionsDrilldown(): JSX.Element {
  return (
    <WorldMap
      data={data}
      title="Regions showcase"
      detailLevel="regions"
      detailProvider={provider}
      initialMapCenter={{ longitude: -9.142685, latitude: 38.736946 }}
      showLabels
      frame
      size="xxl"
    />
  );
}
