import * as React from "react";
import { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData";

// E.g. format the number 1000000 to "1 thousand"
function formattedNumber(num: number | undefined, digits: number) {
  if (typeof num === "undefined") return "";
  const magnitude = [
    { value: 1e9, text: " billion " },
    { value: 1e6, text: " million " },
    { value: 1e3, text: " thousand " },
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
