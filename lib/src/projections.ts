import type GeoJSON from "geojson";
import type { GeoProjection } from "d3-geo";
import { geoEqualEarth, geoMercator } from "d3-geo";
import type { ProjectionOption } from "./types.js";

/** Every projection the `projection` prop accepts, default first. */
export const projectionOptions: readonly ProjectionOption[] = [
  "mercator",
  "equalEarth",
];

export const defaultProjection: ProjectionOption = "mercator";

// The map is drawn in a 960 × 720 coordinate space. The group holding the
// paths is shifted down by 240 (see `translate(0, 240)` in index.tsx), so in
// projection coordinates the visible area runs from y = -240 to y = 480.
const viewportExtent: [[number, number], [number, number]] = [
  [0, -240],
  [960, 480],
];

/**
 * Builds the d3 projection for an option.
 *
 * Mercator keeps d3's default scale and translate so the default render is
 * unchanged. Equal Earth is fitted to the given features inside the viewport:
 * it is wider than it is tall, so it fills the width and is vertically
 * centred.
 */
export function createProjection(
  option: ProjectionOption,
  features: GeoJSON.FeatureCollection,
): GeoProjection {
  if (option === "equalEarth")
    return geoEqualEarth().fitExtent(viewportExtent, features);
  return geoMercator();
}
