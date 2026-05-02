import type { RegionCollectionRecord } from "react-svg-worldmap";

export const regionCollections: Record<string, RegionCollectionRecord> = {
  US: {
    countryCode: "US",
    countryName: "United States",
    coverageStatus: "experimental",
    reviewNotes:
      "Starter demonstration coverage uses simplified regional shapes for package integration validation; it is not a legal boundary reference.",
    regions: [
      {
        id: "us-west",
        countryCode: "US",
        name: "United States West",
        path: "M220 215 L300 205 L310 275 L225 285 Z",
        centroid: [265, 245],
        bounds: [
          [220, 205],
          [310, 285],
        ],
        order: 1,
      },
      {
        id: "us-central",
        countryCode: "US",
        name: "United States Central",
        path: "M310 210 L380 215 L385 285 L310 275 Z",
        centroid: [346, 248],
        bounds: [
          [310, 210],
          [385, 285],
        ],
        order: 2,
      },
      {
        id: "us-east",
        countryCode: "US",
        name: "United States East",
        path: "M380 215 L440 225 L430 295 L385 285 Z",
        centroid: [410, 255],
        bounds: [
          [380, 215],
          [440, 295],
        ],
        order: 3,
      },
    ],
  },
};
