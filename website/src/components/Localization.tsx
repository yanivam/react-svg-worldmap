import React from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

// spanish translation of country names
const localizedCountryDictionary: Map<string, string> = new Map([
  ["br", "Brasil"], // brazil
  ["cn", "China"], // china
  ["id", "Indonesia"], // indonesia
  ["in", "India"], // india
  ["mx", "México"], // mexico
  ["ng", "Nigeria"], // nigeria
  ["ru", "Rusia"], // russia
  ["us", "Estados Unidos"], // united states
]);

// Spanish number formating for thusdands, milions, and billions
// E.g. translate the number 1000000 to "1 millónes"
const localizedNumber = (num: number, digits: number) => {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: " miles " },
    { value: 1e6, symbol: " millónes " },
    { value: 1e9, symbol: " mil millónes " },
  ];
  const rx = /\.0+$|(?<number>\.[0-9]*[1-9])0+$/;
  for (let i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      return (
        (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol
      );
    }
  }
  return undefined;
};

// localization callback
const getLocalizedText = ({
  countryCode,
  countryValue,
  prefix,
  suffix,
}: CountryContext) => {
  const localizedCountryName = localizedCountryDictionary.has(
    countryCode.toLocaleLowerCase(),
  )
    ? localizedCountryDictionary.get(countryCode.toLocaleLowerCase())
    : "Unknown";
  const spanishTranlation = `${localizedCountryName}: ${
    prefix ? `${prefix} ` : ""
  }${localizedNumber(countryValue, 2)}${suffix ? suffix : ""}`;
  return spanishTranlation;
};

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
