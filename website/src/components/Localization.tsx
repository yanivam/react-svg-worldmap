import * as React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

// Spanish translation of country names
const localizedCountryDictionary = new Map<string, string>([
  ["br", "Brasil"], // Brazil
  ["cn", "China"], // China
  ["id", "Indonesia"], // Indonesia
  ["in", "India"], // India
  ["mx", "México"], // Mexico
  ["ng", "Nigeria"], // Nigeria
  ["ru", "Rusia"], // Russia
  ["us", "Estados Unidos"], // United States
]);

// Spanish number formatting for thousands, millions, and billions
// E.g. translate the number 1000000 to "1 millónes"
function localizeNumber(num: number | undefined, digits: number) {
  if (typeof num === "undefined") return "";
  const magnitude = [
    { value: 1e9, text: " mil millónes " },
    { value: 1e6, text: " millónes " },
    { value: 1e3, text: " miles " },
    { value: 1, text: "" },
  ].find((magnitude) => num >= magnitude.value);
  if (magnitude) {
    return (
      (num / magnitude.value)
        .toFixed(digits)
        .replace(/\.0+$|(?<number>\.[0-9]*[1-9])0+$/, "$1") + magnitude.text
    );
  }
  return "";
}

const getLocalizedText = ({
  countryCode,
  countryValue,
  prefix,
  suffix,
}: CountryContext) =>
  `${
    localizedCountryDictionary.get(countryCode.toLocaleLowerCase()) ?? "Unknown"
  }: ${prefix}${localizeNumber(countryValue, 2)}${suffix}`;

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="Los diez países principales por población"
      data={populationData}
      valueSuffix="personas"
      tooltipTextFunction={getLocalizedText}
    />
  );
}
