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

// Seven shades from light to dark blue. Population spans three orders of
// magnitude, so countries are placed in a shade on a log scale.
const shades = [
  "#d2e3fc",
  "#a8c7f5",
  "#7eaaec",
  "#4f87e0",
  "#3a69be",
  "#284a92",
  "#172f63",
];
const noDataColor = "#eef0f5";
const borderColor = "#b5bdcc";

const values = population.map(({ value }) => value);
const minValue = Math.min(...values);
const maxValue = Math.max(...values);

function shadeFor(value: number): string {
  const share = Math.log(value / minValue) / Math.log(maxValue / minValue);
  return shades[
    Math.min(shades.length - 1, Math.floor(share * shades.length))
  ]!;
}

const styleFunction = ({
  countryValue,
}: CountryContext): React.CSSProperties => ({
  fill: typeof countryValue === "number" ? shadeFor(countryValue) : noDataColor,
  fillOpacity: 1,
  stroke: borderColor,
  strokeWidth: 0.5,
  strokeOpacity: 1,
  cursor: "pointer",
});

const projections: Record<ProjectionOption, string> = {
  equalEarth: "Equal Earth",
  mercator: "Mercator",
};

const swatch: React.CSSProperties = {
  display: "inline-block",
  width: 28,
  height: 18,
  verticalAlign: "middle",
};

export default function EqualEarth(): JSX.Element {
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");
  const [showDisputes, setShowDisputes] = useState(true);

  return (
    <section
      aria-labelledby="population-heading"
      style={{
        textAlign: "left",
        color: "#1f2328",
        background: "#ffffff",
        border: "1px solid #d0d7de",
        borderRadius: 12,
        padding: "1.5rem 2rem",
      }}>
      <h2 id="population-heading" style={{ fontWeight: 400 }}>
        World population
      </h2>
      <p>
        Stronger shading means more people. Countries without data are grey.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "0.5rem",
          color: "#57606a",
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
        size="responsive"
        borderColor="#9aa5b8"
        strokeOpacity={1}
        styleFunction={styleFunction}
        valueSuffix="million people"
        data={population}
        projection={projection}
        showDisputedTerritories={showDisputes}
      />
      <p style={{ color: "#57606a", margin: "0.75rem 0 0.5rem" }}>
        Hover or focus a shaded country for its value.
      </p>
      <div style={{ color: "#57606a" }} aria-hidden="true">
        <span
          style={{
            ...swatch,
            background: noDataColor,
            border: `1px solid ${borderColor}`,
          }}
        />{" "}
        No data
        <span style={{ marginLeft: "1rem" }}>
          {shades.map((shade) => (
            <span key={shade} style={{ ...swatch, background: shade }} />
          ))}
        </span>{" "}
        {minValue} to {maxValue.toLocaleString()} million people
      </div>
    </section>
  );
}
