import * as React from "react";
import { useState } from "react";
import type { CountryContext, Data } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

const data: Data = [
  { country: "ua", value: 1 }, // Ukraine (Crimea)
  { country: "ps", value: 1 }, // Palestinian Territories
  { country: "tw", value: 1 }, // Taiwan
  { country: "in", value: 1 }, // India (Kashmir)
  { country: "pk", value: 1 }, // Pakistan (Kashmir)
  { country: "eh", value: 1 }, // Western Sahara
  { country: "xk", value: 1 }, // Kosovo
  { country: "fr", value: 1 }, // France (no dispute)
];

const getStyle = ({ dispute, color, countryValue }: CountryContext) => ({
  fill: color,
  fillOpacity: countryValue ? 0.5 : 0,
  stroke: dispute ? "#b00020" : "black",
  strokeWidth: dispute ? 1.5 : 1,
  strokeDasharray:
    dispute?.display.borderStyle === "dashed" ? "4 2" : undefined,
  cursor: "pointer",
});

const getTooltip = ({ dispute, countryName }: CountryContext) =>
  dispute?.display.tooltipLabel ?? countryName;

export default function Disputes(): JSX.Element {
  const [selected, setSelected] = useState<CountryContext | null>(null);

  const clickAction = React.useCallback((context: CountryContext) => {
    setSelected(context);
  }, []);

  const dispute = selected?.dispute;

  return (
    <>
      <WorldMap
        color="green"
        title="Dispute metadata"
        size="lg"
        data={data}
        styleFunction={getStyle}
        tooltipTextFunction={getTooltip}
        onClickFunction={clickAction}
      />
      <section aria-live="polite">
        {!selected && <p>Click a country to see its dispute metadata.</p>}
        {selected && !dispute && (
          <p>
            {selected.countryName} ({selected.countryCode}): no dispute
            metadata.
          </p>
        )}
        {selected && dispute && (
          <dl>
            <dt>Country</dt>
            <dd>
              {selected.countryName} ({selected.countryCode})
            </dd>
            <dt>Dispute</dt>
            <dd>
              {dispute.name} ({dispute.status})
            </dd>
            <dt>Parties</dt>
            <dd>{dispute.disputeParties.join(", ")}</dd>
            {dispute.recognizedSovereign && (
              <>
                <dt>Recognized sovereign</dt>
                <dd>{dispute.recognizedSovereign}</dd>
              </>
            )}
            {dispute.controllingPower && (
              <>
                <dt>Controlling power</dt>
                <dd>{dispute.controllingPower}</dd>
              </>
            )}
            <dt>Rationale</dt>
            <dd>{dispute.sourceRationale}</dd>
          </dl>
        )}
      </section>
    </>
  );
}
