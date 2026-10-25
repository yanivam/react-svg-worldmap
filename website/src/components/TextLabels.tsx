import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// Positions are fractions of the map width, so labels follow the map's size.
const oceans = [
  { label: "Pacific", x: 0.1, y: 0.48 },
  { label: "Atlantic", x: 0.37, y: 0.33 },
  { label: "Indian", x: 0.7, y: 0.57 },
  { label: "Arctic", x: 0.78, y: 0.06 },
];

export default function App(): JSX.Element {
  const theme = useMapTheme();
  return (
    <WorldMap
      {...theme}
      title="Population"
      color="#3b82f6"
      valueSuffix="million people"
      size="responsive"
      data={populationData}
      textLabelFunction={(width) =>
        oceans.map(({ label, x, y }) => ({
          label,
          x: x * width,
          y: y * width,
          textAnchor: "middle",
          fill: "#64748b",
          fontSize: Math.max(10, width / 50),
          fontStyle: "italic",
        }))
      }
    />
  );
}
