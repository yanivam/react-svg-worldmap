import * as React from "react";
import WorldMap from "react-svg-worldmap";
import type { MapPin, ZoomState } from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { capitalCityPins } from "../data/countryCapitalPins";
import { awsRegionLocations } from "../data/awsRegionLocations";
import { useMapTheme } from "./mapTheme";

// Pins are [longitude, latitude]. When pins overlap, the earlier one in the
// array is kept; zoom in to see more of them.
const pinSets = {
  capitals: { label: "Capital cities", pins: capitalCityPins },
  aws: { label: "AWS regions", pins: awsRegionLocations },
} satisfies Record<string, { label: string; pins: readonly MapPin[] }>;
type PinSet = keyof typeof pinSets;

// Drag to pan; double-click, use the buttons, or hold ctrl (⌘) and scroll to
// zoom. Country names appear where they fit.
export default function App(): JSX.Element {
  const theme = useMapTheme();
  const [pinSet, setPinSet] = React.useState<PinSet>("capitals");
  const [zoom, setZoom] = React.useState<ZoomState>({
    scale: 1,
    translate: [0, 0],
  });
  return (
    <>
      <fieldset style={{ border: "none", padding: 0 }}>
        <legend style={{ fontSize: "0.9rem" }}>Pins</legend>
        {(Object.keys(pinSets) as PinSet[]).map((key) => (
          <label key={key} style={{ margin: "0 0.75rem" }}>
            <input
              type="radio"
              name="pin-set"
              value={key}
              checked={pinSet === key}
              onChange={() => setPinSet(key)}
            />{" "}
            {pinSets[key].label}
          </label>
        ))}
      </fieldset>
      <WorldMap
        {...theme}
        title="Population"
        color="#3b82f6"
        valueSuffix="million people"
        size="responsive"
        data={populationData}
        zoom={{ maxScale: 8 }}
        onZoomChange={setZoom}
        pins={pinSets[pinSet].pins}
      />
      <p>Zoom: {zoom.scale.toFixed(1)}x</p>
    </>
  );
}
