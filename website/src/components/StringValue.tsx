import * as React from "react";
import WorldMap, { type Data } from "react-svg-worldmap";
import { useMapTheme } from "./mapTheme";

// Values can be text. All text values get the same shade.
const trips: Data<string> = [
  { country: "jp", value: "Tokyo, 2023" },
  { country: "pe", value: "Cusco, 2022" },
  { country: "pt", value: "Lisbon, 2021" },
  { country: "ke", value: "Nairobi, 2019" },
  { country: "nz", value: "Queenstown, 2018" },
];

export default function App(): JSX.Element {
  const theme = useMapTheme();
  return <WorldMap {...theme} title="My trips" color="#db2777" data={trips} />;
}
