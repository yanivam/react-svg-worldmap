# @react-svg-worldmap/regions

Optional target-country region data and provider helpers for `react-svg-worldmap`.

The core world map package does not require this package. Add it only when an application needs reviewed country-scoped first-level region detail.

## Install

```sh
npm install react-svg-worldmap @react-svg-worldmap/regions
```

## Usage

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

United States and Canada are marked `complete`. The other target countries are currently marked `experimental` because they are generated from Natural Earth Admin 1 and need country-specific official source review before being marked complete.

Coverage metadata is exported through `targetRegionCountries`, `regionCoverage`, `getRegionCoverage()`, and the provider's `getCoverage()` method.

## Sources

- United States: `us-atlas@3.0.1` `states-10m.json`, derived from U.S. Census Bureau cartographic boundary data.
- Canada: Opendatasoft `georef-canada-province` GeoJSON using Statistics Canada province and territory records.
- Other target countries: Natural Earth Admin 1 states/provinces 10m cultural vectors.

## Boundary Policy

Region boundaries are thematic visualization data. They are not legal, diplomatic, cadastral, navigational, or authoritative boundary references. Internal region borders are intended to render as dotted overlays above the country map so they are visually distinct from country borders.

See `CONTRIBUTING.md` in the repository root for region data source, generation, neutrality review, and validation guidance.
