import type GeoJSON from "geojson";
import type { GeoProjection } from "d3-geo";
import { geoEqualEarth, geoMercator } from "d3-geo";
import type { ProjectionOption } from "./types.js";
import { heightRatio } from "./constants.js";

/** Every projection the `projection` prop accepts, default first. */
export const projectionOptions: readonly ProjectionOption[] = [
  "mercator",
  "equalEarth",
];

export const defaultProjection: ProjectionOption = "mercator";

/**
 * How the map sits in the SVG for one projection. Paths are drawn in a
 * coordinate space 960 wide and `960 * heightRatio` tall, shifted down by
 * `offsetY` (kept at 240 for Mercator so the default render is unchanged).
 */
export interface ProjectionLayout {
  heightRatio: number;
  offsetY: number;
}

export const projectionLayouts: Record<ProjectionOption, ProjectionLayout> = {
  // 960 × 720, as in every release before 2.3.0.
  mercator: { heightRatio, offsetY: 240 },
  // Equal Earth is about twice as wide as it is tall, so a 2:1 frame avoids
  // the empty bands a 4:3 frame would leave above and below the map.
  equalEarth: { heightRatio: 1 / 2, offsetY: 0 },
};

// Margin around the fitted Equal Earth map, in viewport units.
const equalEarthPadding = 8;

/**
 * Builds the d3 projection for an option.
 *
 * Mercator keeps d3's default scale and translate so the default render is
 * unchanged. Equal Earth is fitted to the given features inside its 960 × 480
 * viewport with a small margin: it fills the width and is vertically centred.
 */
export function createProjection(
  option: ProjectionOption,
  features: GeoJSON.FeatureCollection,
): GeoProjection {
  if (option === "equalEarth") {
    const height = 960 * projectionLayouts.equalEarth.heightRatio;
    return geoEqualEarth().fitExtent(
      [
        [equalEarthPadding, equalEarthPadding],
        [960 - equalEarthPadding, height - equalEarthPadding],
      ],
      features,
    );
  }
  return geoMercator();
}
