import * as React from "react";
import type { RegionCollectionRecord } from "../types.js";

export interface Props {
  collection: RegionCollectionRecord;
}

export default function VisibleRegionList({ collection }: Props): JSX.Element {
  return (
    <section
      aria-label={`Visible regions for ${collection.countryName}`}
      data-visible-region-list={collection.countryCode}>
      <h2>{collection.countryName} regions</h2>
      <p>
        Coverage: {collection.coverageStatus}
        {collection.expectedRegionCount != null
          ? ` (${collection.regions.length}/${collection.expectedRegionCount})`
          : ""}
      </p>
      <ul>
        {collection.regions.map((region) => (
          <li key={region.id}>{region.localizedName ?? region.name}</li>
        ))}
      </ul>
    </section>
  );
}
