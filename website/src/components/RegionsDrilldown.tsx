import * as React from "react";
import { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions/dist/index.cjs";
import {
  regionsShowcaseCapitals,
  regionsShowcaseData,
} from "../data/RegionsShowcaseData";

const provider = createRegionsDetailProvider();

const defaultSelection = {
  country: "Portugal",
  capital: regionsShowcaseCapitals.pt,
};

export default function RegionsDrilldown(): JSX.Element {
  const [selection, setSelection] = useState(defaultSelection);

  const handleCountryClick = React.useCallback(
    ({ countryCode, countryName }: CountryContext) => {
      setSelection({
        country: countryName,
        capital:
          regionsShowcaseCapitals[countryCode.toLowerCase()] ?? "Unknown",
      });
    },
    [],
  );

  return (
    <>
      <WorldMap
        data={regionsShowcaseData}
        title="Regions showcase"
        detailLevel="regions"
        detailProvider={provider}
        initialMapCenter={{ longitude: -9.142685, latitude: 38.736946 }}
        showLabels
        frame
        size="xl"
        onClickFunction={handleCountryClick}
      />
      <ul>
        <li>Country: {selection.country}</li>
        <li>Capital: {selection.capital}</li>
      </ul>
    </>
  );
}
