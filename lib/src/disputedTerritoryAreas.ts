import type GeoJSON from "geojson";
import { feature as topoFeature } from "topojson-client";

import topoData from "./disputed-territories.topo.js";
import type { DisputeId } from "./disputes.js";

export interface DisputedTerritoryArea {
  /** Territory id, e.g. `"crimea"` or `"aksai-chin"`. */
  id: string;
  name: string;
  disputeId: DisputeId;
  /** Natural Earth administration note. Empty when none. */
  administration: string;
}

type TerritoryFeature = GeoJSON.Feature<
  GeoJSON.MultiPolygon,
  { id: string; d: DisputeId; n: string; a: string }
>;

// Decoded once at module load, like the country topology.
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
export const disputedTerritoryFeatures = (
  topoFeature(
    topoData,
    topoData.objects.territories,
  ) as unknown as GeoJSON.FeatureCollection
).features as TerritoryFeature[];
/* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

/** The territory shapes drawn by `showDisputedTerritories`, in render order. */
export const disputedTerritoryAreas: DisputedTerritoryArea[] =
  disputedTerritoryFeatures.map(({ properties: { id, d, n, a } }) => ({
    id,
    name: n,
    disputeId: d,
    administration: a,
  }));
