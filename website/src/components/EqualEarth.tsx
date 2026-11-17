import * as React from "react";
import { useState } from "react";
import type { ProjectionOption, ZoomState } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// The recommended setup: the equal-area Equal Earth projection, with zoom
// and country names where they fit. In Equal Earth, Greenland
// shrinks and Africa shows its true size. Zoom in (drag to pan, double-click,
// use the buttons, or hold ctrl (⌘) and scroll) and the detailed borders load.
// Use the menu to compare with Mercator.
export default function EqualEarth(): JSX.Element {
  const theme = useMapTheme();
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translate: [0, 0] });

  return (
    <>
      <select
        aria-label="Projection"
        value={projection}
        onChange={(e) => setProjection(e.target.value as ProjectionOption)}>
        <option value="equalEarth">Equal Earth</option>
        <option value="mercator">Mercator</option>
      </select>
      <WorldMap
        {...theme}
        title="Population"
        color="#3b82f6"
        valueSuffix="million people"
        size="responsive"
        data={populationData}
        projection={projection}
        zoom={{ maxScale: 8 }}
        onZoomChange={setZoom}
      />
      <p>Zoom: {zoom.scale.toFixed(1)}x</p>
    </>
  );
}
