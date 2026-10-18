import * as React from "react";
import { useState } from "react";
import type {
  CountryContext,
  Data,
  ProjectionOption,
} from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

// Population in millions, 2024 estimates (rounded).
const population: Data = [
  { country: "in", value: 1451 },
  { country: "cn", value: 1419 },
  { country: "us", value: 345 },
  { country: "id", value: 284 },
  { country: "pk", value: 251 },
  { country: "ng", value: 233 },
  { country: "br", value: 212 },
  { country: "bd", value: 174 },
  { country: "ru", value: 145 },
  { country: "et", value: 132 },
  { country: "mx", value: 131 },
  { country: "jp", value: 124 },
  { country: "eg", value: 117 },
  { country: "ph", value: 116 },
  { country: "cd", value: 110 },
  { country: "vn", value: 101 },
  { country: "ir", value: 92 },
  { country: "tr", value: 87 },
  { country: "de", value: 84 },
  { country: "th", value: 72 },
  { country: "tz", value: 69 },
  { country: "gb", value: 69 },
  { country: "fr", value: 66 },
  { country: "za", value: 64 },
  { country: "it", value: 59 },
  { country: "ke", value: 56 },
  { country: "co", value: 53 },
  { country: "sd", value: 51 },
  { country: "ug", value: 50 },
  { country: "es", value: 48 },
  { country: "dz", value: 47 },
  { country: "ar", value: 45 },
  { country: "iq", value: 46 },
  { country: "ca", value: 40 },
  { country: "ma", value: 38 },
  { country: "ao", value: 38 },
  { country: "ua", value: 38 },
  { country: "pl", value: 38 },
  { country: "sa", value: 34 },
  { country: "pe", value: 34 },
  { country: "mz", value: 35 },
  { country: "gh", value: 35 },
  { country: "au", value: 27 },
];

// Population spans three orders of magnitude, so shade on a log scale.
// Countries without data are drawn as plain land on a light-blue ocean.
const styleFunction = ({
  countryValue,
  minValue,
  maxValue,
}: CountryContext): React.CSSProperties => {
  const value = typeof countryValue === "number" ? countryValue : undefined;
  const share =
    value === undefined
      ? 0
      : Math.log(value / minValue) / Math.log(maxValue / minValue);
  return {
    fill: value === undefined ? "#ffffff" : "#1565c0",
    fillOpacity: value === undefined ? 1 : 0.2 + 0.8 * share,
    stroke: "#607d8b",
    strokeWidth: 0.5,
    cursor: "pointer",
  };
};

const projections: Record<ProjectionOption, string> = {
  equalEarth: "Equal Earth",
  mercator: "Mercator",
};

export default function EqualEarth(): JSX.Element {
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");
  const [showDisputes, setShowDisputes] = useState(true);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}>
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
        <label>
          <input
            type="checkbox"
            checked={showDisputes}
            onChange={(e) => setShowDisputes(e.target.checked)}
          />{" "}
          Show disputed territories
        </label>
      </div>
      <WorldMap
        title={`World population (${projections[projection]} projection)`}
        size="responsive"
        backgroundColor="#dceefb"
        styleFunction={styleFunction}
        valueSuffix="million people"
        data={population}
        projection={projection}
        showDisputedTerritories={showDisputes}
      />
    </>
  );
}
