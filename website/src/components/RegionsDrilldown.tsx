import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions/dist/index.cjs";

const provider = createRegionsDetailProvider();

const data = [
  { country: "us", value: 100 },
  { country: "ca", value: 80 },
  { country: "mx", value: 60 },
];

export default function RegionsDrilldown(): JSX.Element {
  return (
    <WorldMap
      data={data}
      title="Regions showcase"
      detailLevel="regions"
      detailProvider={provider}
      initialDrilldownCountryCode="US"
      showLabels
      frame
      size="xl"
    />
  );
}
