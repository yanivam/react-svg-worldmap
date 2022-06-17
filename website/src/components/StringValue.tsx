import React from "react";
import WorldMap from "react-svg-worldmap";

export default function App(): JSX.Element {
  const data = [
    { country: "cn", value: "🇨🇳" }, // China
    { country: "in", value: "🇮🇳" }, // India
  ];

  return (
    <WorldMap color="green" title="This is My Map" size="lg" data={data} />
  );
}
