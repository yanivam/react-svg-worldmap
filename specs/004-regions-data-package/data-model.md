# Data Model: Optional Regions Data Package

## Region Package

Represents the optional distributable package that delivers first-level region data and helpers for the core map.

Fields:

- `name`: Package name, expected to remain `@react-svg-worldmap/regions`.
- `version`: Package version published independently from the core package when appropriate.
- `coverage`: List of country coverage records included in the package.
- `collections`: Country-keyed region collections.
- `targetCountries`: Fixed target coverage country list for this feature.
- `providerFactory`: Helper that creates a core-compatible detail provider from bundled or custom region collections.

Validation rules:

- Must not be required by the core package for country-only rendering.
- Must publish ESM, CJS, TypeScript declarations, README, and only intended package files.
- Must expose coverage metadata for every target country, even when a country is partial, experimental, unavailable, or represented as a single region.

## Country Region Coverage

Represents what region data is available for one country.

Fields:

- `countryCode`: ISO country code matching the core map country code.
- `countryName`: Display country name.
- `status`: `complete`, `partial`, `experimental`, or `unavailable`.
- `regionCount`: Number of included first-level region records.
- `expectedRegionCount`: Expected number of first-level regions when known.
- `sourceSummary`: Human-readable source and processing summary.
- `reviewNotes`: Neutrality, limitation, or coverage notes.
- `sourceUrl`: Optional source URL or source reference when the source can be safely published.
- `generatedAt`: Optional generated data date or version marker.

Validation rules:

- Target country coverage records must exist for United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia.
- `complete` coverage requires `regionCount` to match `expectedRegionCount`.
- `partial` and `experimental` coverage must include review notes explaining the limitation.

## Coverage Catalog

Represents the package-level index of countries with optional region coverage.

Fields:

- `records`: Country region coverage records keyed or searchable by country code.
- `supportedCountryCodes`: Country codes with loadable region collections.
- `coverageStatuses`: The available statuses represented by the package.
- `sourceSummaries`: Reviewable source summaries grouped by target country.

Validation rules:

- Must not assume United States-specific region terminology, identifiers, or counts.
- Must include entries for all 23 target countries in this feature.
- Must support countries with states, provinces, territories, cantons, departments, or equivalent first-level subdivisions through the same record shape.
- Must support future complete, partial, experimental, unavailable, and single-region country entries without changing core package APIs.
- Must allow consumers and examples to discover target countries and loadable countries without importing the optional package from the core package.

## Target Coverage Country

Represents one country required for first-level region breakdown in this feature.

Fields:

- `countryCode`: ISO country code matching the core map country code.
- `countryName`: Display country name.
- `continentGroup`: Americas, Europe, Asia, Africa, or Oceania.
- `expectedSubdivisionTerms`: Known first-level terminology for source review, such as state, province, territory, canton, department, emirate, republic, state/region, or equivalent.
- `coverageRecord`: Associated country region coverage record.

Validation rules:

- The target country list contains exactly 23 countries.
- The required countries are grouped as:
  - Americas: United States, Canada, Mexico, Brazil, Argentina, Venezuela.
  - Europe: Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia.
  - Asia: India, Pakistan, United Arab Emirates, Malaysia, Iraq.
  - Africa: Nigeria, Ethiopia, South Africa, Sudan.
  - Oceania: Australia, Micronesia.
- Every target country must have coverage metadata and a source review entry even if a country is represented as partial, experimental, unavailable, or single-region.

## Region Record

Represents one first-level official local government subdivision within a country.

Fields:

- `id`: Stable package identifier unique within the country collection.
- `countryCode`: Parent country code.
- `name`: Display name.
- `localizedName`: Optional local-language display name when different from `name`.
- `kind`: Local subdivision term such as state, province, territory, canton, department, emirate, republic, state/region, or region.
- `path`: Renderable SVG path in the core map coordinate system.
- `centroid`: Optional label anchor point in map coordinate space.
- `bounds`: Optional rendered bounds for visibility and fit checks.
- `order`: Optional display priority for labels and lists.
- `sourceId`: Optional source feature identifier for auditability.

Validation rules:

- `id`, `countryCode`, `name`, and `path` are required for rendered regions.
- `countryCode` must match the parent collection.
- `path` must render as a non-empty shape.
- `centroid`, when present, must fall inside or near the rendered bounds enough to be useful as a label anchor.
- Region records for a complete country must have unique names and identifiers.

## Region Boundary Geometry

Represents the geometry used to draw the region overlay.

Fields:

- `path`: Projected SVG path.
- `bounds`: Projected bounding box.
- `centroid`: Projected label candidate point.
- `sourcePrecision`: Precision or quality metadata recorded during generation when available.
- `qualityNotes`: Simplification, quantization, clipping, or projection notes.

Validation rules:

- Must align with the existing country map projection closely enough that internal borders appear inside the parent country.
- Must not draw fake internal dotted borders for single-region countries.
- Must be documented as thematic and non-authoritative.

## Detail Provider

Represents the bridge between optional package data and the core map.

Fields:

- `supports(countryCode)`: Reports whether a country can load region data.
- `getCoverage(countryCode?)`: Returns coverage metadata for all countries or one country.
- `loadRegions(countryCode)`: Returns the region collection or a graceful unavailable/failed result.

Validation rules:

- Unsupported countries must return unavailable status without throwing.
- Loading target countries with loadable coverage must return a ready region collection.
- Target countries with unavailable coverage must return unavailable status with coverage metadata rather than throwing.
- Provider helpers must support both bundled starter data and future custom data.

## Region Overlay

Represents the rendered map layer that appears above countries.

Fields:

- `regions`: Rendered region paths.
- `borderStyle`: Default dotted internal border style.
- `fillStyle`: Optional transparent or non-dominant fill style.
- `labels`: Region labels selected for the current zoom and visible area.
- `statusMessage`: Optional loading, unavailable, or failure status.

Validation rules:

- Country borders and fills remain visible.
- Internal region borders use dotted styling by default.
- Region overlay does not interfere with country click, tooltip, pin, dispute, or zoom behavior.
- Loading, unavailable, and failed states remain accessible and non-blocking.

## Region Label

Represents a visible region name on the map.

Fields:

- `regionId`: Parent region identifier.
- `label`: Text to display.
- `x`: Rendered x coordinate.
- `y`: Rendered y coordinate.
- `fontSize`: Resolved label size.
- `priority`: Placement priority.
- `availableWidth`: Region-derived width available for label fit.
- `availableHeight`: Region-derived height available for label fit.

Validation rules:

- Must use the same fit and collision expectations as country labels.
- Must be hidden when zoom, region area, or collision rules make it unreadable.
- Must not overlap with country labels or higher-priority region labels in tested zoom scenarios.

## Region Data Validation Report

Represents the generated evidence that a region data update is releasable.

Fields:

- `countryCode`: Country validated.
- `expectedRegionCount`: Expected first-level region count.
- `actualRegionCount`: Generated region count.
- `missingRegions`: Expected names not present.
- `extraRegions`: Unexpected names present.
- `emptyPathCount`: Regions with missing or empty paths.
- `sourceSummary`: Source and generation summary.
- `packageSizeBytes`: Optional package dry-run size.

Validation rules:

- Target country reports must show no missing expected regions for countries marked `complete` before release.
- Empty rendered paths fail validation.
- Package-size changes must be recorded for the optional package and must not affect the core package dry-run size.

## Example Region Scenario

Represents an example state in the documentation website.

Fields:

- `exampleName`: Zoom with regions or sizing.
- `regionPackageImport`: Optional package data/provider used by the example.
- `enabledControls`: User controls for region detail and related overlays.
- `coveredCountry`: Country used to demonstrate real region detail.
- `showVisibleRegionList`: Whether the visible below-map list of all regions is rendered.
- `expectedVisibleBehavior`: Boundaries, labels, zoom behavior, and fallback behavior.

Validation rules:

- Examples must not use inline placeholder region shapes.
- Zoom and sizing examples must demonstrate real optional package data where region visibility is enabled.
- Sizing examples must set `showVisibleRegionList` behavior to false and avoid printing the visible below-map list of regions.
- Code samples must match the package-facing documentation.
