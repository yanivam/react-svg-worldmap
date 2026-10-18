import * as React from "react";
import { useState } from "react";
import type { Data, ProjectionOption } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

// Population in millions (rounded). Enough data to see size differences.
const data: Data = [
  { country: "cn", value: 1419 },
  { country: "in", value: 1451 },
  { country: "us", value: 345 },
  { country: "id", value: 284 },
  { country: "br", value: 212 },
  { country: "ng", value: 233 },
  { country: "ru", value: 145 },
  { country: "mx", value: 131 },
  { country: "jp", value: 124 },
  { country: "et", value: 132 },
  { country: "eg", value: 117 },
  { country: "cd", value: 110 },
  { country: "de", value: 84 },
  { country: "gb", value: 69 },
  { country: "fr", value: 66 },
  { country: "za", value: 64 },
  { country: "ca", value: 40 },
  { country: "au", value: 27 },
  { country: "gl", value: 0.06 },
];

const projections: Record<ProjectionOption, string> = {
  equalEarth: "Equal Earth",
  mercator: "Mercator",
};

export default function EqualEarth(): JSX.Element {
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");

  return (
    <>
      <div role="radiogroup" aria-label="Projection">
        {(Object.keys(projections) as ProjectionOption[]).map((option) => (
          <label key={option} style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="projection"
              value={option}
              checked={projection === option}
              onChange={() => setProjection(option)}
            />{" "}
            {projections[option]}
          </label>
        ))}
      </div>
      <WorldMap
        title="World population"
        color="red"
        valueSuffix="million people"
        size="responsive"
        data={data}
        projection={projection}
      />
    </>
  );
}
