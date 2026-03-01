import * as React from "react";
import { useState } from "react";
import type { CountryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";
import { populationData } from "../data/CountryData.js";

/**
 * Repro page for tooltip + click interaction (Issue #148).
 * Verifies tooltips show on hover and click still fires and updates state.
 */
export default function TooltipAndClick(): JSX.Element {
  const [lastClicked, setLastClicked] = useState<{
    name: string;
    code: string;
    value: string;
  } | null>(null);

  const handleClick = React.useCallback(
    ({ countryName, countryCode, countryValue }: CountryContext) => {
      setLastClicked({
        name: countryName,
        code: countryCode,
        value: String(countryValue ?? ""),
      });
    },
    [],
  );

  return (
    <>
      <WorldMap
        title="Tooltip + Click: hover for tooltip, click to select"
        data={populationData}
        onClickFunction={handleClick}
      />
      {lastClicked && (
        <p data-testid="click-result">
          Last clicked: {lastClicked.name} ({lastClicked.code}) — value:{" "}
          {lastClicked.value}
        </p>
      )}
    </>
  );
}
