import * as React from "react";
import WorldMap from "react-svg-worldmap";
import {
  createRegionsDetailProvider,
  targetRegionCountries,
} from "@react-svg-worldmap/regions";
import type { MapPin } from "react-svg-worldmap";
import { awsRegionLocations } from "../data/awsRegionLocations";
import { capitalCityPins } from "../data/countryCapitalPins";
import styles from "./ZoomExample.module.css";

const detailProvider = createRegionsDetailProvider();
const targetRegionData = targetRegionCountries.map((country, index) => ({
  country: country.countryCode,
  value: index + 1,
}));
const neutralCountryStyle = () => ({
  fill: "#F4F2F2",
  fillOpacity: 1,
  stroke: "#607d86",
  strokeWidth: 1,
  strokeOpacity: 0.2,
  cursor: "pointer",
});
const countryNameTooltip = ({ countryName }: { countryName: string }) =>
  countryName;

export default function ZoomExample(): JSX.Element {
  const [showCapitalCities, setShowCapitalCities] = React.useState(false);
  const [showRegionDetails, setShowRegionDetails] = React.useState(true);
  const [showAwsLocations, setShowAwsLocations] = React.useState(false);

  const pins = React.useMemo(
    (): readonly MapPin[] => [
      ...(showCapitalCities ? capitalCityPins : []),
      ...(showAwsLocations ? awsRegionLocations : []),
    ],
    [showAwsLocations, showCapitalCities],
  );

  return (
    <div className={styles.example}>
      <div className={styles.controls} aria-label="Map overlays">
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showCapitalCities}
            onChange={(event) => setShowCapitalCities(event.target.checked)}
          />
          Capital cities
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showRegionDetails}
            onChange={(event) => setShowRegionDetails(event.target.checked)}
          />
          Region details
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showAwsLocations}
            onChange={(event) => setShowAwsLocations(event.target.checked)}
          />
          AWS locations
        </label>
      </div>
      <WorldMap
        title="Zoom with regions"
        size="xl"
        frame
        data={targetRegionData}
        zoom
        styleFunction={neutralCountryStyle}
        tooltipTextFunction={countryNameTooltip}
        detailLevel={showRegionDetails ? "regions" : "countries"}
        {...(pins.length > 0 ? { pins } : {})}
        {...(showRegionDetails ? { detailProvider } : {})}
      />
    </div>
  );
}
