// The detailed country topology (see scripts/build-detailed-countries.mjs).
import type { Topology, GeometryCollection } from "topojson-specification";

declare const topology: Topology<{
  countries: GeometryCollection<{ N: string; I: string }>;
}>;
export = topology;
