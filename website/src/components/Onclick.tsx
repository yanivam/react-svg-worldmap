import * as React from "react";
import { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

export default function App(): JSX.Element {
  const [selected, setSelected] = useState<CountryContext>();

  return (
    <>
      <WorldMap
        title="Population"
        color="#2563eb"
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
