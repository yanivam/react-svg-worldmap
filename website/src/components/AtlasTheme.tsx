import * as React from "react";
import { useState } from "react";
import WorldMap from "react-svg-worldmap";
import type { MapTheme, ProjectionOption } from "react-svg-worldmap";
import { gdpData } from "../data/CountryData";
import { useMapTheme } from "./mapTheme";

// The atlas theme: blue water, slate borders and light land for countries
// without data. Borders stay one pixel wide as you zoom. Any color prop you
// pass (backgroundColor, borderColor, styleFunction, ...) overrides the theme.
export default function AtlasTheme(): JSX.Element {
  const siteTheme = useMapTheme();
  const [theme, setTheme] = useState<MapTheme>("atlas");
  const [projection, setProjection] = useState<ProjectionOption>("equalEarth");

  // The atlas palette is the same in light and dark mode; only the tooltip
  // follows the site. The default theme takes all the site's map colors.
  const colors =
    theme === "atlas"
      ? {
          tooltipBgColor: siteTheme.tooltipBgColor,
          tooltipTextColor: siteTheme.tooltipTextColor,
        }
      : siteTheme;

  return (
    <>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as MapTheme)}>
        <option value="atlas">Atlas</option>
        <option value="default">Default</option>
      </select>{" "}
      <select
        aria-label="Projection"
        value={projection}
        onChange={(e) => setProjection(e.target.value as ProjectionOption)}>
        <option value="equalEarth">Equal Earth</option>
        <option value="mercator">Mercator</option>
      </select>
      <WorldMap
        {...colors}
        theme={theme}
        title="GDP per capita"
        color="#e65100"
        valuePrefix="$"
        size="responsive"
        data={gdpData}
        projection={projection}
        zoom={{ maxScale: 8 }}
        frame
      />
    </>
  );
}
