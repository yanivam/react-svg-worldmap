# Public API Contract: Optional Regions Data Package

## Core `WorldMap` Contract

The default import from `react-svg-worldmap` remains the main React component.

Rendering behavior:

- Default sea/background color is `#A0D7EB`.
- Default no-data land/country color is `#F4F2F2`.
- Country shapes render as closed land/fill paths above the ocean/background layer.
- Region overlays render as dotted internal boundaries above countries when `detailLevel="regions"` and a compatible provider is ready.
- Labels, pins, and interaction targets render above geometry in the documented layer order.

Layer contract:

```text
ocean/background
countries
regions
labels
pins
interaction-targets
```

Required structural behavior:

- The SVG output MUST expose stable group identity for these layers through implementation-owned attributes suitable for tests.
- Country visual paths MUST include country identity attributes so tests and tools can verify rendered identity.
- Interaction targets MUST align with visible country identity and must not report a different country than the visible shape.

## Region Detail Contract

Consumers opt into region detail with:

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

Rules:

- The core package MUST work without importing `@react-svg-worldmap/regions`.
- The core package MUST NOT load selected region geometry below `4x` zoom.
- The public `showRegionList` prop is removed and must not be documented or accepted as a supported behavior.
- Region borders default to dotted styling and must not replace country fills or country borders.

## Optional Regions Package Contract

Package: `@react-svg-worldmap/regions`

Exports:

- `createRegionsDetailProvider()`
- `targetRegionCountries`
- `regionCoverage`
- data/helper exports already required by the package tests

Rules:

- Package metadata license is `MIT`.
- Package artifact includes `LICENSE`.
- Every target country from FR-011 is marked `complete`.
- Future non-target countries may be `partial`, `experimental`, or `unavailable`, but target countries may not.

## Zoom Example Contract

The zoom-with-regions example must:

- Use `size="xl"`.
- Use the optional regions package for region data.
- Remove generic `../data/CountryData` usage.
- Provide independent controls for optional regions, capital cities, and AWS locations.
- Never render a below-map region list.

AWS pin behavior:

- Source region list and AWS display names from `https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html`.
- Include commercial, GovCloud, and China AWS Regions in the documentation snapshot used by the package.
- Include region code, AWS display name, city, optional state/province/equivalent administrative area, country, coordinates, precision, and published-vs-inferred marker.
- Add `(location not published)` when the city is a state-capital or country-capital fallback.

## Validation Contract

Required command coverage:

```bash
yarn workspace react-svg-worldmap test
yarn workspace @react-svg-worldmap/regions test
yarn typecheck
yarn lint
yarn format-check
yarn spellcheck
yarn test:coverage
yarn build
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions
```
