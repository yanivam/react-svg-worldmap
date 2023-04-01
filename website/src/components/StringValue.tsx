import * as React from "react";
import WorldMap, { type Data } from "react-svg-worldmap";

export default function App(): JSX.Element {
  const data: Data<string> = [
    { country: "cn", value: "🇨🇳" }, // China
    { country: "in", value: "🇮🇳" }, // India
  ];

  return (
    <WorldMap color="green" title="This is My Map" size="lg" data={data} />
  );
}
