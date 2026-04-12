import * as React from "react";
import type { RegionFeatureRecord } from "../detail/types.js";

interface VisibleRegionListProps {
  regions: RegionFeatureRecord[];
  onSelect: (regionId: string) => void;
}

export default function VisibleRegionList({
  regions,
  onSelect,
}: VisibleRegionListProps): JSX.Element | null {
  if (regions.length === 0) return null;

  return (
    <section aria-label="Visible regions">
      <ul>
        {regions.map((region) => (
          <li key={region.id}>
            <button type="button" onClick={() => onSelect(region.id)}>
              {region.labels.localizedName ?? region.labels.englishName}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
