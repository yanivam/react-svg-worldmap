import * as React from "react";
import WorldMap from "react-svg-worldmap";
import type { MapPin, ZoomState } from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// A few capitals, as [longitude, latitude].
const capitals: MapPin[] = (
  [
    {
      caption: "Washington, D.C.",
      coordinates: [-77.04, 38.91],
      countryCode: "US",
    },
    { caption: "Brasília", coordinates: [-47.88, -15.79], countryCode: "BR" },
    { caption: "London", coordinates: [-0.13, 51.51], countryCode: "GB" },
    { caption: "Nairobi", coordinates: [36.82, -1.29], countryCode: "KE" },
    { caption: "New Delhi", coordinates: [77.21, 28.61], countryCode: "IN" },
    { caption: "Beijing", coordinates: [116.41, 39.9], countryCode: "CN" },
    { caption: "Tokyo", coordinates: [139.69, 35.69], countryCode: "JP" },
    { caption: "Canberra", coordinates: [149.13, -35.28], countryCode: "AU" },
  ] as const
).map((pin) => ({ ...pin, kind: "capital" }));

// Drag to pan; double-click, use the buttons, or hold ctrl (⌘) and scroll to
// zoom. Country names appear where they fit.
export default function App(): JSX.Element {
  const theme = useMapTheme();
  const [zoom, setZoom] = React.useState<ZoomState>({
    scale: 1,
    translate: [0, 0],
  });
  return (
    <>
      <WorldMap
        {...theme}
        title="Population"
        color="#3b82f6"
        valueSuffix="million people"
        size="responsive"
        data={populationData}
        zoom={{ maxScale: 8 }}
        onZoomChange={setZoom}
        pins={capitals}
      />
      <p>Zoom: {zoom.scale.toFixed(1)}x</p>
    </>
  );
}
