import * as React from "react";
import { useState } from "react";
import type { DisputedTerritoryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

export default function Disputes(): JSX.Element {
  const [selected, setSelected] = useState<DisputedTerritoryContext>();

  return (
    <>
      <WorldMap
        title="Disputed territories"
        data={[]}
        richInteraction
        showDisputedTerritories
        onDisputedTerritoryClick={setSelected}
      />
      <section aria-live="polite">
        {selected ? (
          <dl>
            <dt>{selected.territoryName}</dt>
            <dd>
              {selected.dispute.name} ({selected.dispute.status})
            </dd>
            <dd>Parties: {selected.dispute.disputeParties.join(", ")}</dd>
            <dd>UN standing: {selected.dispute.unStanding}</dd>
          </dl>
        ) : (
          <p>Click a red territory for its dispute details.</p>
        )}
      </section>
    </>
  );
}
