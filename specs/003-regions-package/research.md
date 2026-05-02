# Research: Regions Package

## Decision: Optional Regions Package With Provider Boundary

**Rationale**: Region data can be large, politically sensitive, and unnecessary for country-only users. Keeping starter region coverage in an optional package preserves the existing core package footprint while making region detail available to consumers who choose it. A provider boundary lets consumers use the optional package or their own reviewed data.

**Alternatives considered**:

- Bundle starter region data in the core package: rejected because it increases default package size and makes country-only consumers carry unused data.
- Require consumers to fetch region data from a hosted service: rejected because the project should remain usable without hosted map-service dependencies.
- Hard-code one region source inside the core renderer: rejected because it blocks custom coverage and makes neutrality review less modular.

## Decision: Core Detail Provider Contract

**Rationale**: The core package should know how to request, validate, and render region detail without depending on any specific data package. The provider reports support, loading status, unavailable coverage, failure, warnings, and ready region collections. This supports clean fallback behavior and explicit consumer warnings.

**Alternatives considered**:

- Pass raw region arrays directly to the map: rejected because support checks, fallback states, async loading, and custom providers become inconsistent.
- Add a broad plugin system: rejected as too much surface area for the current feature.
- Infer region availability from package presence: rejected because package presence does not prove coverage for a specific country.

## Decision: Starter Coverage Is Limited And Explicit

**Rationale**: The first region package release can provide a reviewed starter set rather than global coverage. The important user guarantee is that coverage is discoverable and unsupported countries fall back cleanly. Coverage metadata must distinguish complete, partial, experimental, and unavailable states.

**Alternatives considered**:

- Delay release until global region coverage exists: rejected because it blocks provider integration and would expand map-data review beyond the feature scope.
- Ship incomplete data as if complete: rejected because it violates consumer trust and neutrality expectations.
- Omit coverage metadata: rejected because consumers need to know support before enabling region detail.

## Decision: Region Geometry As Normalized Package Records

**Rationale**: Region records need stable identifiers, parent country, names, renderable boundary data, and optional label/viewport metadata. Keeping geometry in normalized package records makes validation and package smoke tests straightforward, and it avoids requiring network conversion at runtime.

**Alternatives considered**:

- Store only source dataset references: rejected because consumers need ready-to-render package data.
- Store only SVG paths without metadata: rejected because labels, coverage validation, parent-country checks, and visible region lists need structured records.
- Store multiple localized names in the initial release: deferred because default English labels and optional consumer translation hooks cover the initial use case with less data policy surface.

## Decision: Fallback-First Region Rendering

**Rationale**: Region detail must never break country-level map rendering. Unsupported, unavailable, failed, or loading provider states should leave a stable country view and communicate status. This preserves compatibility and makes region detail safe to enable incrementally.

**Alternatives considered**:

- Hide the map while loading or unavailable: rejected because it reduces usability and creates avoidable layout changes.
- Throw runtime errors for unsupported countries: rejected because unsupported coverage is expected.
- Automatically zoom into unsupported countries without detail: rejected because it could imply a detail mode is available when it is not.

## Decision: Region Accessibility Mirrors Country Zoom Accessibility

**Rationale**: The completed zoom foundation already includes keyboard controls and live status. Region detail should reuse those expectations, adding visible region list behavior and status announcements when a focused country has ready, unavailable, loading, or failed detail.

**Alternatives considered**:

- SVG-only region interaction: rejected because a synchronized visible list is needed for accessible non-graphical navigation and review.
- Mouse-only drill-down: rejected because it would regress keyboard accessibility.
- Silent fallback: rejected because users need to understand why region detail did not appear.

## Decision: Region Data Requires Neutrality Review

**Rationale**: Sub-country boundaries and names can introduce additional political claims beyond the base world map. Every starter country and future contribution must be reviewed against the map-data policy, with limitations and disputed or sensitive cases documented.

**Alternatives considered**:

- Treat region data as purely technical: rejected because boundaries and names are user-visible map data.
- Accept source data without project review: rejected because the project maintains its own neutrality policy and override register.
- Exclude all sensitive countries permanently: rejected because documented review and fallback behavior are sufficient for scoped starter coverage.
