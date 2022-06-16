import React, { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

// E.g. format the number 1000000 to "1 thousand"
function formattedNumber(num: number | undefined, digits: number) {
  if (typeof num === "undefined") return "";
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: " thousand " },
    { value: 1e6, symbol: " million " },
    { value: 1e9, symbol: " billion " },
  ];
  const rx = /\.0+$|(?<number>\.[0-9]*[1-9])0+$/;
  for (let i = si.length - 1; i > 0; i--) {
    if (num >= si[i]!.value) {
      return (
        (num / si[i]!.value).toFixed(digits).replace(rx, "$1") + si[i]!.symbol
      );
    }
  }
  return "";
}

export default function App(): JSX.Element {
  const [state, setState] = useState({
    cName: "Select Country",
    iso: "",
    val: "",
  });

  const clickAction = React.useCallback(
    ({ countryName, countryCode, countryValue }: CountryContext) => {
      setState({
        cName: countryName,
        iso: countryCode,
        val: formattedNumber(countryValue, 2),
      });
    },
    [],
  );

  return (
    <>
      <WorldMap
        title="The ten highest GDP per capita countries"
        data={populationData}
        onClickFunction={clickAction}
      />
      <ul>
        <li>Country: {state.cName}</li>
        <li>ISO Code: {state.iso}</li>
        <li>GDP per capita: {state.val}</li>
      </ul>
    </>
  );
}
