# Public API Contract: Regions Package

## Core Package Detail Props

The existing map component remains country-level by default.

Required additions:

```ts
type DetailLevel = "countries" | "regions";

interface Props<T extends string | number = number> {
  detailLevel?: DetailLevel;
  detailProvider?: DetailProvider;
  onDetailStatusChange?: (status: DetailProviderResult) => void;
}
```

Compatibility requirements:

- Omitting `detailLevel` preserves country-level rendering.
- Omitting `detailProvider` preserves country-level rendering.
- `detailLevel="regions"` without usable provider data falls back to countries and reports an unavailable status.
- Existing `zoom`, `pins`, `textLabelFunction`, style, tooltip, click, href, and accessibility behavior remain compatible.
- The core package must not import or require the optional regions package at runtime.

## Detail Provider Contract

```ts
type RegionCoverageStatus =
  | "complete"
  | "partial"
  | "experimental"
  | "unavailable";

type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

interface DetailProvider {
  supports(countryCode: ISOCode): boolean;
  getCoverage?(countryCode?: ISOCode): RegionCoverageRecord[];
  loadRegions(countryCode: ISOCode): Promise<DetailProviderResult>;
}

interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  countryCode?: ISOCode;
  coverageStatus?: RegionCoverageStatus;
  collection?: RegionCollectionRecord;
  warning?: string;
}
```

Behavior requirements:

- Providers report unsupported countries with `supports(countryCode) === false` or an `unavailable` result.
- Provider failures return or surface a `failed` result without breaking country rendering.
- Ready results include a valid region collection for the requested country.
- Warnings are used only when region detail is requested and cannot be shown as expected.

## Region Data Contract

```ts
interface RegionCoverageRecord {
  countryCode: ISOCode;
  countryName: string;
  status: RegionCoverageStatus;
  regionCount: number;
  sourceSummary?: string;
  reviewNotes?: string;
}

interface RegionCollectionRecord {
  countryCode: ISOCode;
  countryName: string;
  coverageStatus: RegionCoverageStatus;
  regions: RegionFeatureRecord[];
  preferredViewport?: RegionViewport;
  reviewNotes?: string;
}

interface RegionFeatureRecord {
  id: string;
  countryCode: ISOCode;
  name: string;
  localizedName?: string;
  path: string;
  centroid?: readonly [number, number];
  bounds?: readonly [readonly [number, number], readonly [number, number]];
  order?: number;
}

interface RegionViewport {
  center?: readonly [number, number];
  bounds?: readonly [readonly [number, number], readonly [number, number]];
  scale?: number;
}
```

Validation requirements:

- Region collections match the requested parent country.
- Region labels are non-empty.
- Region paths are renderable.
- Region ids are unique within each parent country.
- Partial or experimental coverage is documented.

## Optional Regions Package Exports

The optional regions package exposes:

```ts
export const regionCoverage: RegionCoverageRecord[];
export const regionCollections: Record<string, RegionCollectionRecord>;
export function createRegionsDetailProvider(): DetailProvider;
export function getRegionCoverage(
  countryCode?: ISOCode,
): RegionCoverageRecord[];
```

Compatibility requirements:

- The optional package depends on the core public types only.
- Consumers can use the helper provider or implement a custom provider.
- Package contents include coverage metadata and reviewed starter collections.

## Country Topology Generation Contract

The checked-in core country topology is not a public function, but it is part of the published package behavior. Regeneration must satisfy this contract:

```ts
type CountryTopologyGenerationSettings = {
  inputPath: string;
  outputPath: "lib/src/countries.topo.ts";
  minimumCoordinatePrecision: 6;
  compression: readonly string[];
  optimization: "none" | "quality-budgeted";
  qualityBudget?: CountryTopologyQualityBudget;
};

type CountryTopologyQualityBudget = {
  fixtureCountries: readonly string[];
  fixtureCategories: readonly (
    | "small-island"
    | "coastline"
    | "border"
    | "small-country"
  )[];
  minimumCoordinatePrecision: 6;
  requirePackageSizeReduction: true;
  maximumFixtureDegradation: "none-material-human-visible";
};

type CountryTopologyValidationReport = {
  countryCountBefore: number;
  countryCountAfter: number;
  isoCodesBefore: readonly string[];
  isoCodesAfter: readonly string[];
  minimumPrecisionObserved: number;
  coordinateDetailDelta: number;
  renderabilityResult: "pass" | "fail";
  qualityFixtureResult: "pass" | "fail";
  optimizationSettings?: Record<string, unknown>;
  packageSizeDeltaBytes: number;
  neutralityReviewResult: string;
};
```

Generation requirements:

- Regenerate `lib/src/countries.topo.ts` from the current project source path unless a later clarification explicitly changes the source strategy.
- Retain at least 6 decimal places of coordinate precision in generated country geometry where the source contains that precision.
- Avoid aggressive lossy simplification, coordinate truncation, or quantization below the precision target.
- Lossless TopoJSON arc sharing, delta encoding, JSON minification, and build-time formatting are allowed.
- Quality-budgeted simplification or quantization is allowed only when validation fixtures pass and packed core package size is reduced from the high-detail baseline.
- Document the input source, precision settings, compression steps, and validation output in repo-owned documentation or generated report output.

Validation requirements:

- Preserve all current country ISO codes and display names unless a map-policy-reviewed exception is documented.
- Decode the generated TopoJSON and verify all country geometries produce renderable SVG paths.
- Prove retained coordinate detail improved compared with the current bundled topology.
- Compare selected small-island, coastline, border, and small-country fixtures against the high-detail baseline and fail validation on material human-visible degradation.
- Record package-size impact for the source topology and built package.
- Review the regenerated country geometry against `docs/map-data-policy.md` and `docs/map-data-overrides.json`.

## Rendering Contract

Country and region rendering must provide:

- Country-level fallback when region detail is inactive, unavailable, failed, or unsupported.
- Higher-detail country geometry by default after topology regeneration.
- Region boundaries when a ready collection exists for the focused country.
- Region labels that fit and avoid collisions.
- Consumer pins that remain geographically anchored when region detail is active.
- Tooltips and custom interactions that remain stable unless documented otherwise.

## Accessibility Contract

The core package must provide:

- Keyboard-operable zoom and reset controls in country and region views.
- Live status announcements for ready, unavailable, failed, and reset detail states.
- A visible region list synchronized with rendered region detail.
- No inaccessible SVG-only path for discovering displayed regions.

## Documentation Contract

Documentation must explain:

- Country-level rendering remains the default.
- The bundled country topology is generated from a documented source path and retains at least 6 decimal places after this feature.
- Region detail is opt-in and provider-backed.
- The optional regions package is not required for country-only maps.
- Starter coverage is limited and discoverable.
- Unsupported countries fall back to country-level rendering.
- Region and country map data follow the project map-data policy and may include documented limitations.
