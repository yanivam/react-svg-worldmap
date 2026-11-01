import * as React from "react";
import { useState } from "react";
import type { ProjectionOption } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// Switch projections to compare: in Equal Earth, Greenland shrinks and
// Africa shows its true size.
export default function EqualEarth(): JSX.Element {
  const theme = useMapTheme();
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");

  return (
    <>
      <select
        aria-label="Projection"
        value={projection}
        onChange={(e) => setProjection(e.target.value as ProjectionOption)}>
        <option value="equalEarth">Equal Earth</option>
        <option value="mercator">Mercator</option>
      </select>
      <WorldMap
        {...theme}
        title="Population"
        color="#3b82f6"
        valueSuffix="million people"
        size="responsive"
        data={populationData}
        projection={projection}
      />
    </>
  );
}
