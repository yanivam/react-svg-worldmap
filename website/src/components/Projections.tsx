import * as React from "react";
import { useState } from "react";
import type { ProjectionOption } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

const labels: Record<ProjectionOption, string> = {
  mercator: "Mercator (default)",
  equalEarth: "Equal Earth (true relative size)",
};

export default function Projections(): JSX.Element {
  const [projection, setProjection] = useState<ProjectionOption>("mercator");

  return (
    <>
      <fieldset>
        <legend>Projection</legend>
        {(Object.keys(labels) as ProjectionOption[]).map((option) => (
          <label key={option} style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="projection"
              value={option}
              checked={projection === option}
              onChange={() => setProjection(option)}
            />{" "}
            {labels[option]}
          </label>
        ))}
      </fieldset>
      <WorldMap
        title={`Population, ${labels[projection]}`}
        size="responsive"
        frame
        data={populationData}
        projection={projection}
      />
    </>
  );
}
