import * as React from "react";
import { useState } from "react";
import type { DisputedTerritoryContext } from "react-svg-worldmap";
import WorldMap from "react-svg-worldmap";

export default function Disputes(): JSX.Element {
  const [selected, setSelected] = useState<DisputedTerritoryContext | null>(
    null,
  );

  const clickAction = React.useCallback(
    ({
      territoryId,
      territoryName,
      administration,
      dispute,
    }: DisputedTerritoryContext) => {
      setSelected({ territoryId, territoryName, administration, dispute });
    },
    [],
  );

  const dispute = selected?.dispute;

  return (
    <>
      <WorldMap
        title="Disputed territories"
        size="lg"
        data={[]}
        richInteraction
        showDisputedTerritories
        onDisputedTerritoryClick={clickAction}
      />
      <section aria-live="polite">
        {!selected && (
          <p>
            Click a red territory to see its dispute details. Double-click the
            map to zoom in.
          </p>
        )}
        {selected && dispute && (
          <dl>
            <dt>Territory</dt>
            <dd>{selected.territoryName}</dd>
            {selected.administration && (
              <>
                <dt>Administration</dt>
                <dd>{selected.administration}</dd>
              </>
            )}
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
            <dt>UN standing</dt>
            <dd>{dispute.unStanding}</dd>
            <dt>Rationale</dt>
            <dd>{dispute.sourceRationale}</dd>
          </dl>
        )}
      </section>
    </>
  );
}
