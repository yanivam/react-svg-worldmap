import * as React from "react";
import { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

export default function App(): JSX.Element {
  const theme = useMapTheme();
  const [selected, setSelected] = useState<CountryContext>();

  return (
    <>
      <WorldMap
        {...theme}
        title="Population"
        color="#3b82f6"
        valueSuffix="million people"
        data={populationData}
        onClickFunction={setSelected}
      />
      <p aria-live="polite">
        {selected
          ? `${selected.countryName}: ${
              selected.countryValue === undefined
                ? "no data"
                : `${selected.countryValue} million people`
            }`
          : "Click a country."}
      </p>
    </>
  );
}
