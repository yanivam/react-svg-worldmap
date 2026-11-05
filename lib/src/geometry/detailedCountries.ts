import type GeoJSON from "geojson";
import { useEffect, useState } from "react";
import type { GeoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";

export type CountryFeature = GeoJSON.Feature & {
  properties: { N: string; I: string };
};

let pending: Promise<CountryFeature[]> | undefined = undefined;
let loaded: CountryFeature[] | undefined = undefined;

/**
 * Loads and decodes the detailed (Natural Earth 10m) country geometry. The
 * data is a separate file that bundlers emit as its own chunk, so it is only
 * downloaded the first time this runs. A failed load can be retried.
 */
export function loadDetailedCountryFeatures(): Promise<CountryFeature[]> {
  if (pending) return pending;
  pending = import("../map-assets/countries-detailed.cjs").then((module) => {
    // Native ESM and most bundlers expose module.exports as `default`; some
    // CommonJS interop returns module.exports itself.
    const topology =
      (module as { default?: typeof module.default }).default ??
      (module as unknown as typeof module.default);
    loaded = (
      topoFeature(
        topology,
        topology.objects.countries,
      ) as unknown as GeoJSON.FeatureCollection
    ).features as CountryFeature[];
    return loaded;
  });
  pending.catch(() => {
    pending = undefined;
  });
  return pending;
}

/**
 * Starts loading the detailed country borders that the map draws when
 * zoomed in, for example on hover over a map, so the first zoom past
 * `detailedGeometryMinScale` shows them straight away.
 */
export function preloadDetailedCountryGeometry(): Promise<void> {
  return loadDetailedCountryFeatures().then(() => undefined);
}

/**
 * The detailed country features while `active`, or `undefined` while they
 * are loading, not wanted, or failed to load (the map then keeps the default
 * borders).
 */
export function useDetailedCountryFeatures(
  active: boolean,
): CountryFeature[] | undefined {
  const [features, setFeatures] = useState(loaded);
  useEffect(() => {
    if (!active || features) return undefined;
    let cancelled = false;
    loadDetailedCountryFeatures().then(
      (result) => {
        if (!cancelled) setFeatures(result);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [active, features]);
  return active ? features : undefined;
}

// Projected detailed paths per projection, in the order of the default
// countries. A country missing from the detailed data keeps its default path.
const pathCache = new Map<string, Array<string | undefined>>();
export function getDetailedCountryPaths(
  projection: string,
  pathGenerator: GeoPath,
  countries: readonly CountryFeature[],
  detailed: readonly CountryFeature[],
): Array<string | undefined> {
  let paths = pathCache.get(projection);
  if (!paths) {
    const byCode = new Map(detailed.map((f) => [f.properties.I, f]));
    paths = countries.map((country) => {
      const match = byCode.get(country.properties.I);
      return (match && pathGenerator(match)) ?? undefined;
    });
    pathCache.set(projection, paths);
  }
  return paths;
}
