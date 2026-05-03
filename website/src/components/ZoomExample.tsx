import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";
import { populationData } from "../data/CountryData";
import { capitalCityPins } from "../data/countryCapitalPins";
import styles from "./ZoomExample.module.css";

const detailProvider = createRegionsDetailProvider();

export default function ZoomExample(): JSX.Element {
  const [showCapitalCities, setShowCapitalCities] = React.useState(false);
  const [showRegionDetails, setShowRegionDetails] = React.useState(true);

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
      </div>
      <WorldMap
        title="Zoom with regions"
        size="xl"
        frame
        data={populationData}
        zoom
        detailLevel={showRegionDetails ? "regions" : "countries"}
        {...(showCapitalCities ? { pins: capitalCityPins } : {})}
        {...(showRegionDetails ? { detailProvider } : {})}
      />
    </div>
  );
}
