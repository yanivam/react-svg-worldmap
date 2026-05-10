# @react-svg-worldmap/regions

Optional target-country region data and provider helpers for `react-svg-worldmap`.

The core world map package does not require this package. Add it only when an application needs reviewed country-scoped first-level region detail.

For release `2.1.0`, use this package with `react-svg-worldmap@2.1.0`.

## Install

```sh
npm install react-svg-worldmap @react-svg-worldmap/regions
```

## Usage

Enable region overlays in four consumer steps:

1. Install `@react-svg-worldmap/regions` alongside `react-svg-worldmap`.
2. Import `createRegionsDetailProvider`.
3. Create and pass the provider to `WorldMap`.
4. Set `detailLevel="regions"` with zoom enabled so the overlay can appear at region-detail zoom.

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const detailProvider = createRegionsDetailProvider();

<WorldMap
  data={[{ country: "US", value: 1 }]}
  zoom
  detailLevel="regions"
  detailProvider={detailProvider}
/>;
```

## Target Coverage

The package includes first-level region collections and coverage metadata for 23 target countries:

- Americas: United States, Canada, Mexico, Brazil, Argentina, Venezuela
- Europe: Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia
- Asia: India, Pakistan, United Arab Emirates, Malaysia, Iraq
- Africa: Nigeria, Ethiopia, South Africa, Sudan
- Oceania: Australia, Micronesia

All 23 target countries are marked `complete`. Future non-target countries may use `partial`, `experimental`, or `unavailable` metadata when source review or expected-count validation is not complete.

Coverage metadata is exported through `targetRegionCountries`, `regionCoverage`, `getRegionCoverage()`, and the provider's `getCoverage()` method.

## Loading Behavior

Region collections are split by country. `loadRegionCollection(countryCode)` always returns a promise: supported countries resolve to a collection, and unsupported countries resolve to `undefined`. This keeps promise chaining safe for applications that probe coverage dynamically.

`createRegionsDetailProvider()` uses the same loaders. It reports unsupported, failed, or unavailable region detail without breaking the country-level map.

Region overlays are intended for zoomed thematic inspection. In `react-svg-worldmap`, they appear at `4x` zoom and above, render as dotted internal borders, and use concise hover text in the form `Region, Country`.

## Sources

- United States: `us-atlas@3.0.1` `states-10m.json`, derived from U.S. Census Bureau cartographic boundary data.
- Canada: Opendatasoft `georef-canada-province` GeoJSON using Statistics Canada province and territory records.
- Other target countries: Natural Earth Admin 1 states/provinces 10m cultural vectors, with expected-count validation recorded in package tests.

## Release Notes

See `CHANGELOG.md` for package-specific release notes.

## License

This optional package is distributed under the MIT license and includes a package-local `LICENSE` file in the npm artifact.

## Boundary Policy

Region boundaries are thematic visualization data. They are not legal, diplomatic, cadastral, navigational, or authoritative boundary references. Internal region borders are intended to render as dotted overlays above the country map so they are visually distinct from country borders.

See `CONTRIBUTING.md` in the repository root for region data source, generation, neutrality review, and validation guidance.
