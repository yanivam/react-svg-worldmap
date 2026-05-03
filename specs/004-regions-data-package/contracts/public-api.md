# Public API Contract: Optional Regions Data Package

## Core Package Contract

The core package continues to render country-level maps without requiring the optional regions package.

### Props

`detailLevel`

- Accepted values: `countries`, `regions`.
- Default: `countries`.
- `regions` requests a region overlay only when a `detailProvider` is supplied and supports the focused country.

`detailProvider`

- Optional provider that supplies region data.
- Must not be required for default country-level rendering.
- Must be ignored or reported as unavailable when `detailLevel` is `countries`.

`onDetailStatusChange`

- Optional callback that receives loading, ready, unavailable, and failed states for the region layer.
- Must not fire misleading ready states when no region coverage exists.

### Detail Provider

```ts
type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

type RegionCoverageStatus =
  | "complete"
  | "partial"
  | "experimental"
  | "unavailable";

interface DetailProvider {
  supports(countryCode: ISOCode): boolean;
  getCoverage?(countryCode?: ISOCode): RegionCoverageRecord[];
  loadRegions(countryCode: ISOCode): Promise<DetailProviderResult>;
}
```

Contract rules:

- `supports` returns `true` only for countries with loadable region coverage.
- `getCoverage` returns reviewable coverage metadata and may filter by country.
- `loadRegions` returns a ready result for covered countries and a graceful unavailable or failed result otherwise.
- Provider failures must not prevent country-level rendering.

### Detail Provider Result

```ts
interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  countryCode?: ISOCode;
  coverageStatus?: RegionCoverageStatus;
  collection?: RegionCollectionRecord;
  warning?: string;
}
```

Contract rules:

- `ready` results include `collection`.
- `unavailable` and `failed` results include a user-safe warning.
- `loading` results identify the requested country when known.

## Region Data Contract

### Region Coverage Record

```ts
interface RegionCoverageRecord {
  countryCode: ISOCode;
  countryName: string;
  status: RegionCoverageStatus;
  regionCount: number;
  expectedRegionCount?: number;
  sourceSummary?: string;
  sourceUrl?: string;
  reviewNotes?: string;
}
```

Contract rules:

- Coverage metadata includes records for all 23 target countries: United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia.
- The coverage shape is international and must not encode United States-only assumptions about names, kinds, or expected counts.
- Partial or experimental coverage includes review notes.
- Unavailable target-country coverage includes review notes and a zero `regionCount`.
- Coverage metadata is exported for consumer inspection.

### Region Collection Record

```ts
interface RegionCollectionRecord {
  countryCode: ISOCode;
  countryName: string;
  coverageStatus: RegionCoverageStatus;
  regions: RegionFeatureRecord[];
  preferredViewport?: RegionViewport;
  reviewNotes?: string;
}
```

Contract rules:

- `regions` is complete for countries marked `complete`.
- Single-region countries may contain one region record but must not imply an internal dotted boundary when no internal boundary exists.
- `preferredViewport` can help examples focus on covered-country detail but is optional.

### Region Feature Record

```ts
interface RegionFeatureRecord {
  id: string;
  countryCode: ISOCode;
  name: string;
  localizedName?: string;
  kind?: string;
  path: string;
  centroid?: readonly [number, number];
  bounds?: readonly [readonly [number, number], readonly [number, number]];
  order?: number;
  sourceId?: string;
}
```

Contract rules:

- `id`, `countryCode`, `name`, and `path` are required.
- `path` is a renderable SVG path in the core map coordinate system.
- `kind` records the local subdivision term when known.
- `centroid` and `bounds` support label visibility and fit checks.

## Optional Regions Package Contract

The optional package exports real target-country region data, coverage metadata, and provider helpers.

Expected package exports:

```ts
export { regionCoverage, getRegionCoverage } from "./coverage.js";
export { targetRegionCountries } from "./coverage.js";
export { regionCollections } from "./data/starter.js";
export { createRegionsDetailProvider } from "./providers/createRegionsDetailProvider.js";
export type {
  DetailProvider,
  DetailProviderResult,
  DetailLayerStatus,
  DetailLevel,
  RegionCollectionRecord,
  RegionCoverageRecord,
  RegionCoverageStatus,
  RegionFeatureRecord,
  RegionViewport,
} from "react-svg-worldmap";
```

Contract rules:

- The package includes no placeholder region shapes in released starter data.
- The package includes first-level region collections and coverage metadata for the 23 target countries.
- The package coverage catalog can represent additional countries with first-level official regions through the same public data structures, but release validation for this feature focuses on the 23 target countries.
- The package remains optional and is not imported by the core package.
- The package README documents installation, coverage, limitations, and non-authoritative boundary language.

## Rendering Contract

Region overlays must follow these visible behavior rules:

- Region boundaries render above country fills.
- Internal region borders use dotted styling by default.
- Country borders remain visually stronger than internal region borders.
- Region labels use the same fit and collision expectations as country labels.
- Region labels are hidden when zoomed out or when labels would be unreadable.
- Region overlay states must not block country tooltips, clicks, pins, values, zoom controls, or dispute metadata.
- Covered countries show region detail only when the current zoom and visibility rules allow it to be useful.

## Example Contract

Zoom with regions:

- Imports the optional regions package provider.
- Uses real target-country region coverage.
- Keeps existing toggles for capital cities and region details.
- Shows region boundaries and labels only when zoom makes them readable.

Sizing:

- Demonstrates optional regions data in at least one large-size example where region detail can be inspected.
- Does not use inline placeholder region shapes.
- Does not render the visible below-map region list, including headings such as "United States regions" or the full list of state/province names.
- Keeps code samples synchronized with rendered examples.

## Documentation And Release Contract

Documentation must include:

- Optional package installation.
- Meaning of "region" as first-level official subdivision.
- Coverage status and target country list.
- Dotted border meaning.
- Label visibility behavior.
- Non-authoritative thematic boundary language.
- Package-size impact and statement that core package size is unaffected for country-only consumers.

Release validation must include:

- Core package tests and build.
- Optional regions package tests and build.
- Region data validation for expected target-country region counts and coverage metadata.
- Website build for updated examples.
- npm pack dry-runs for both packages.
- Generated README synchronization.
