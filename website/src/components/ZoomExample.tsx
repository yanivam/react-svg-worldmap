import * as React from "react";
import WorldMap from "react-svg-worldmap";
import type { DetailProvider } from "react-svg-worldmap";
import { populationData } from "../data/CountryData";
import { capitalCityPins } from "../data/countryCapitalPins";
import styles from "./ZoomExample.module.css";

const detailProvider: DetailProvider = {
  supports: (countryCode) => countryCode.toUpperCase() === "US",
  getCoverage: () => [
    {
      countryCode: "US",
      countryName: "United States",
      status: "experimental",
      regionCount: 3,
      reviewNotes:
        "Simplified starter region shapes for the documentation example.",
    },
  ],
  loadRegions: () =>
    Promise.resolve({
      status: "ready",
      layer: "regions",
      countryCode: "US",
      coverageStatus: "experimental",
      collection: {
        countryCode: "US",
        countryName: "United States",
        coverageStatus: "experimental",
        regions: [
          {
            id: "us-west",
            countryCode: "US",
            name: "United States West",
            path: "M220 215 L300 205 L310 275 L225 285 Z",
            centroid: [265, 245],
          },
          {
            id: "us-central",
            countryCode: "US",
            name: "United States Central",
            path: "M310 210 L380 215 L385 285 L310 275 Z",
            centroid: [346, 248],
          },
          {
            id: "us-east",
            countryCode: "US",
            name: "United States East",
            path: "M380 215 L440 225 L430 295 L385 285 Z",
            centroid: [410, 255],
          },
        ],
      },
    }),
};

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
