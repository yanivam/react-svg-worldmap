# Data Model: Regions Package

## Region Package

Represents the optional distribution artifact that contains starter region data and provider helpers.

Fields:

- `packageName`: Published package name for the optional region data package.
- `version`: Package version aligned with the release.
- `coverage`: List of region coverage records.
- `collections`: Region collections keyed by parent country.
- `providerFactory`: Helper that creates a core-compatible region detail provider.

Validation rules:

- The core country map must work without this package installed.
- The package must expose coverage metadata before region collections are requested.
- Package contents must include only reviewed starter coverage.
- Package license and dependencies must remain compatible with project distribution.

## Region Coverage Record

Represents whether a country has region detail and what reliability level applies.

Fields:

- `countryCode`: Parent country ISO code.
- `countryName`: Human-readable parent country name.
- `status`: `complete`, `partial`, `experimental`, or `unavailable`.
- `regionCount`: Number of included region records.
- `sourceSummary`: Short description of the data source or derivation.
- `reviewNotes`: Neutrality and limitation notes.

Validation rules:

- Coverage records must be available for all starter supported countries.
- `complete`, `partial`, and `experimental` records must have at least one region.
- `unavailable` records must not be treated as renderable.
- Partial or experimental coverage must be documented in user-facing docs.

## Region Collection

Represents the region features for one parent country.

Fields:

- `countryCode`: Parent country ISO code.
- `countryName`: Parent country display name.
- `coverageStatus`: Coverage status for the collection.
- `regions`: Ordered list of region records.
- `preferredViewport`: Optional bounds or center for fitting the focused country.
- `reviewNotes`: Optional neutrality and quality notes.

Relationships:

- Belongs to one region package.
- Has one matching region coverage record.
- Contains one or more region records when ready.

Validation rules:

- Collection country code must match every child region record.
- Collection must not be returned as ready when it has zero regions.
- Collection review notes must capture known boundary or naming limitations.

## Region Record

Represents a state, province, territory, or equivalent sub-country geographic feature.

Fields:

- `id`: Stable identifier unique within the parent country.
- `countryCode`: Parent country ISO code.
- `name`: Default display name.
- `localizedName`: Optional consumer-facing localized display name.
- `path`: Renderable boundary path or equivalent prepared geometry.
- `centroid`: Optional x/y label anchor.
- `bounds`: Optional bounding box for fitting and hit testing.
- `order`: Optional ordering for rendering, lists, and label priority.

Relationships:

- Belongs to one region collection.
- Can produce a visible region list item.
- Can produce a region label candidate.

Validation rules:

- Region id, country code, name, and geometry must be present.
- Region ids must be stable and unique within a country.
- Region names must be non-empty and policy-reviewed.
- Geometry must be renderable and must not break the country-level map when invalid data is rejected.

## Detail Provider

Represents the source of region coverage and collections consumed by the core map.

Fields:

- `supports`: Reports whether a country has usable region detail.
- `getCoverage`: Returns coverage metadata for one or more countries.
- `loadRegions`: Loads a region collection for a requested country.

Relationships:

- May be created by the optional region package.
- May be implemented by consumers with custom region data.
- Produces detail provider results for the core map.

Validation rules:

- Must return explicit unavailable or failed status instead of throwing for expected unsupported coverage.
- Must not require the core package to import the optional region package.
- Ready results must include a valid region collection.

## Detail Provider Result

Represents the outcome of requesting region detail for a focused country.

Fields:

- `status`: `idle`, `loading`, `ready`, `unavailable`, or `failed`.
- `countryCode`: Requested parent country.
- `coverageStatus`: Optional coverage status.
- `collection`: Optional region collection for ready results.
- `warning`: Optional user-visible warning.

State transitions:

- `idle` -> `loading` when a supported request starts.
- `loading` -> `ready` when a valid collection is available.
- `loading` -> `unavailable` when support or coverage is absent.
- `loading` -> `failed` when provider loading fails.
- Any non-idle state -> `idle` when detail mode is disabled or reset.

Validation rules:

- `ready` must include a collection.
- `unavailable` and `failed` must leave the map in country-level fallback.
- Warnings must not appear when region detail is not requested.

## Region Detail State

Represents the core map state for country-level versus region-level display.

Fields:

- `detailLevel`: `countries` or `regions`.
- `focusedCountryCode`: Optional focused country.
- `providerResult`: Current detail provider result.
- `fallbackReason`: Optional reason for country-level fallback.
- `announcement`: Current status text for assistive technologies.

Validation rules:

- Omitted detail level behaves as country-level rendering.
- Region detail requires a focused country and ready provider result.
- Reset returns to country-level world view.
- Region state must not mutate consumer data values.

## Visible Region List

Represents an accessible list of currently available or displayed regions.

Fields:

- `countryCode`: Focused parent country.
- `items`: Region list items.
- `activeRegionId`: Optional active or focused region.
- `status`: Current detail status.

Validation rules:

- List appears when region detail is ready.
- List stays synchronized with rendered region records.
- List remains keyboard-operable.
- Empty or unavailable detail does not render a misleading region list.

## Region Label Candidate

Represents a possible region label at the current zoom and focused country.

Fields:

- `regionId`: Parent region identifier.
- `label`: Display label.
- `anchor`: x/y label anchor.
- `bounds`: Computed label bounds.
- `priority`: Ordering for collision resolution.

Validation rules:

- Labels must fit within the region or focused country viewport.
- Labels must avoid collisions with higher-priority labels and pins.
- Labels must remain readable at the current zoom level.
- Hidden labels must not remove the region from the visible list.
