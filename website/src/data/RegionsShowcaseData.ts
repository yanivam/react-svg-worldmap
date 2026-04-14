import type { Data } from "react-svg-worldmap";

export const regionsShowcaseData: Data = [
  { country: "pt", value: 100 },
  { country: "es", value: 80 },
  { country: "fr", value: 60 },
  { country: "ma", value: 45 },
];

export const regionsShowcaseCapitals: Record<string, string> = {
  pt: "Lisbon",
  es: "Madrid",
  fr: "Paris",
  ma: "Rabat",
};
