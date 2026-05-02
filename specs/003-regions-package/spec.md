# Feature Specification: Regions Package

**Feature Branch**: `003-regions-package`  
**Created**: 2026-05-02  
**Status**: Draft

## Clarifications

### Session 2026-05-02

- Q: What should the default overlay state be for the renamed Zoom with regions example? → A: Region details on by default; capital city overlay off by default.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add Region Detail Package (Priority: P1)

As a map consumer, I want an optional region-detail package so I can add state, province, or equivalent sub-country detail only when my application needs it.

**Why this priority**: This creates the independent data artifact that makes region detail possible while keeping the existing core map lightweight for consumers who only need countries.

**Independent Test**: Can be tested by installing or referencing the optional region package, confirming it exposes documented coverage information and region records for supported countries, and confirming the existing country-only package still works without it.

**Acceptance Scenarios**:

1. **Given** a consumer only uses the country map package, **When** they update to the release containing this feature, **Then** their existing country map usage remains unchanged and does not require region-detail data.
2. **Given** a consumer chooses to use region detail, **When** they add the optional region package, **Then** they can discover supported countries and retrieve normalized region records for those countries.
3. **Given** the optional region package has limited starter coverage, **When** a consumer inspects coverage, **Then** supported and unsupported countries are clearly distinguishable before runtime use.

---

### User Story 2 - Display Regions When Available (Priority: P2)

As a map consumer, I want the map to use region data when I provide it and when the viewed country is supported, so users can zoom from a country-level view into meaningful regional detail.

**Why this priority**: The optional package is valuable only if the core map can recognize and display supported region detail while preserving stable fallback behavior.

**Independent Test**: Can be tested by enabling region detail with supported region data, selecting or zooming into a covered country, and confirming regional shapes and labels replace or augment the country view according to the documented detail mode.

**Acceptance Scenarios**:

1. **Given** region detail is enabled and region data exists for the selected country, **When** the user focuses that country, **Then** the map presents the available regional boundaries and region labels for that country.
2. **Given** region detail is enabled but region data does not exist for the selected country, **When** the user focuses that country, **Then** the map keeps a usable country-level view and communicates that regional detail is unavailable.
3. **Given** region detail is disabled or no region data source is provided, **When** users interact with the map, **Then** country-level zoom, labels, pins, tooltips, and accessibility behavior remain unchanged.
4. **Given** a user opens the "Zoom with regions" website example, **When** the example renders, **Then** it uses an XL canvas, displays region detail by default, keeps the capital city overlay hidden by default, and provides independent controls to toggle capital cities and region details.

---

### User Story 3 - Handle Region Data Quality And Neutrality (Priority: P3)

As a maintainer, I want region data to follow documented quality and neutrality rules so the package can be released responsibly and extended safely over time.

**Why this priority**: Region boundaries and names introduce new geopolitical and quality risks; release readiness depends on a clear review trail.

**Independent Test**: Can be tested by reviewing the package coverage metadata, region names, boundaries, and neutrality notes for each supported country, then confirming incomplete or uncertain coverage is not presented as complete.

**Acceptance Scenarios**:

1. **Given** a supported country is included in the region package, **When** maintainers review its records, **Then** each region has a stable identifier, display name, parent country, renderable geometry, and documented coverage status.
2. **Given** a region dataset includes disputed, sensitive, or incomplete boundaries, **When** the data is prepared for release, **Then** the package documents the limitation and follows the existing map-data neutrality policy.
3. **Given** future contributors add region coverage, **When** they validate the package, **Then** they can determine whether new records meet the same data quality requirements as existing records.

### Edge Cases

- Region detail is requested for a country with no package coverage.
- Region detail is requested before region data is ready or after loading fails.
- Region records have missing names, duplicate identifiers, invalid parent-country relationships, or geometry that cannot be rendered.
- Region labels collide, do not fit, or become unreadable at the current zoom level.
- Country-level pins, labels, tooltips, and custom styling are present while region detail is active.
- Existing consumers install only the core country map and never add the optional region package.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide an optional region-detail package that is separate from the default country-level package.
- **FR-002**: The default country-level map behavior MUST remain unchanged for consumers who do not opt into region detail.
- **FR-003**: Consumers MUST be able to determine which countries have region coverage before attempting to display region detail.
- **FR-004**: Region records MUST include a stable region identifier, parent country, display name, and renderable regional boundary.
- **FR-005**: Region coverage MUST identify whether each supported country is complete, partial, experimental, or unavailable.
- **FR-006**: The map MUST display regional boundaries when region detail is enabled and region data is available for the focused country.
- **FR-007**: The map MUST fall back to the country-level view when region detail is enabled but no usable region data exists for the focused country.
- **FR-008**: The map MUST provide user-visible status or warning behavior when requested region detail is unavailable, incomplete, loading, or failed.
- **FR-009**: Region display MUST preserve country-level zoom controls, reset behavior, keyboard operation, live status behavior, tooltips, labels, and custom consumer interactions unless explicitly documented otherwise.
- **FR-010**: Region labels MUST use the same readability principles as country labels: they appear only when they fit, avoid collisions, and remain readable during zoom.
- **FR-011**: Consumer-supplied pins MUST remain anchored to their geographic positions when region detail is active, and MUST not prevent region rendering if they cannot be displayed clearly.
- **FR-012**: The optional region package MUST not be required for applications that only use country-level maps.
- **FR-013**: Documentation MUST explain how consumers add region detail, how fallback states work, what coverage is included, and how package boundaries affect installation.
- **FR-014**: Release notes MUST identify the new optional package, supported starter coverage, compatibility expectations, and any known coverage limitations.
- **FR-015**: The website example formerly named "Zoom" MUST be renamed "Zoom with regions" wherever the example title, navigation, route label, and documentation reference the region-enabled zoom flow.
- **FR-016**: The "Zoom with regions" example MUST use an XL canvas layout that gives the map more display area than the current zoom example.
- **FR-017**: The "Zoom with regions" example MUST include a control that toggles the capital city overlay on or off without changing the current zoom focus.
- **FR-018**: The "Zoom with regions" example MUST include a control that toggles region details on or off without changing the current zoom focus.
- **FR-019**: The "Zoom with regions" example MUST render with region details enabled and capital city overlay disabled by default.

### Constitution Requirements _(mandatory)_

- **CR-001**: Feature MUST preserve the project's MIT-compatible open-source distribution model and document any public API or package artifact changes.
- **CR-002**: Feature MUST identify whether map data, country/territory names, geopolitical boundaries, codes, disputed areas, or neutrality language are affected. If affected, requirements MUST reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **CR-003**: Feature MUST define testable behavior and quality validation needed to keep coverage above the project threshold and avoid hidden package, build, TypeScript, lint, test, dependency, or runtime warnings.
- **CR-004**: Feature MUST preserve documented SVG accessibility behavior and justify any new runtime dependency or bundle-size impact.
- **CR-005**: Feature MUST identify release, README generation, package export, semantic versioning, and consumer documentation impact when applicable.

### Key Entities

- **Region Package**: Optional distribution artifact containing region coverage metadata and region records.
- **Region Coverage Record**: Describes whether region data exists for a parent country and whether that coverage is complete, partial, experimental, or unavailable.
- **Region Record**: A sub-country geographic feature with a stable identifier, parent country, display name, renderable boundary, and optional label placement metadata.
- **Region Detail State**: The map's current detail availability for a focused country, including inactive, loading, ready, unavailable, and failed states.
- **Region Data Source**: Consumer-provided or package-provided source that supplies region coverage and records to the map.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Existing country-only map usage remains compatible, with 100% of current country-level regression scenarios passing without region data installed.
- **SC-002**: Consumers can identify supported starter region coverage in documentation or metadata in under 1 minute.
- **SC-003**: For each supported starter country, 100% of included region records have a parent country, stable identifier, display name, and renderable boundary.
- **SC-004**: When region detail is unavailable, users receive a stable fallback country view in 100% of tested unavailable, incomplete, and failed data scenarios.
- **SC-005**: Region detail preserves keyboard-operable zoom and reset behavior in 100% of accessibility regression scenarios.
- **SC-006**: Region package installation and first working region-detail example can be completed by a developer following the documentation in under 10 minutes.
- **SC-007**: The "Zoom with regions" example renders on an XL canvas with independent capital-city and region-detail controls in 100% of example smoke checks.

## Assumptions

- This feature is built on top of the completed country-level zoom foundation from feature `002-zoom-drilldown`.
- Region detail is opt-in and package-backed; country-level rendering remains the default experience.
- Starter region coverage may be limited, but it must be explicit and documented rather than implied to be global.
- The first release can support a small, reviewed set of countries as long as unsupported countries fall back cleanly.
- Region data changes are subject to the existing geopolitical neutrality policy and map data review process.
- No hosted map service is required for consumers to use the optional region detail package.
