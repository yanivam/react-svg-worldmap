# Feature Specification: Optional Regions Data Package

**Feature Branch**: `004-regions-data-package`  
**Created**: 2026-05-02  
**Status**: Draft

## Clarifications

### Session 2026-05-02

- Q: Should sizing examples show the visible text list of regions beneath the map? → A: No; sizing examples must not render the below-map region list.
- Q: Should region coverage be limited to United States starter regions? → A: No; coverage model must be international and support any country with official first-level regions.
- Q: Which countries must be broken down into regions for this feature? → A: Americas: United States, Canada, Mexico, Brazil, Argentina, Venezuela; Europe: Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia; Asia: India, Pakistan, United Arab Emirates, Malaysia, Iraq; Africa: Nigeria, Ethiopia, South Africa, Sudan; Oceania: Australia, Micronesia.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add Official Region Boundaries (Priority: P1)

A map consumer installs an optional regions data package and enables official first-level local government regions as an overlay on top of the existing country-level map. The overlay shows region boundaries and names for countries that have region data, while countries without detailed data continue to render normally.

**Why this priority**: This is the core value of the feature: region boundaries and names must be available without forcing every core package consumer to ship the extra data.

**Independent Test**: Can be fully tested by enabling the optional regions layer for a country with region coverage and verifying that country borders, dotted internal region borders, and region names appear together without changing the default country-only map.

**Acceptance Scenarios**:

1. **Given** a map with optional region data enabled for any target covered country, **When** the country is zoomed enough for region detail to be useful, **Then** all expected first-level regions for that country are shown as a dotted-border overlay with readable region names where labels fit.
2. **Given** a map with optional region data enabled for countries using different first-level terms such as states, provinces, cantons, departments, emirates, or territories, **When** the region layer renders, **Then** all regions use the same generic region API while preserving each local display name and kind.
3. **Given** a map with optional region data enabled for a country with no region coverage, **When** the country is displayed or zoomed, **Then** the country-level map remains usable and no placeholder or broken region layer is shown.

---

### User Story 2 - Keep Region Detail Optional And Layered (Priority: P2)

A package consumer who only needs country-level maps keeps using the core map without pulling in region boundary data. A consumer who needs regions can add the optional data package and display regions as an additional layer without replacing country-level boundaries, labels, pins, or values.

**Why this priority**: The core package must stay lightweight and backward compatible, while region detail should be available to consumers who choose the larger data surface.

**Independent Test**: Can be tested by comparing default country-only usage with optional-region usage and verifying that the default map has no region data dependency while the optional setup adds the region overlay.

**Acceptance Scenarios**:

1. **Given** a consumer renders the map without the optional regions package, **When** the map loads, **Then** the country-level map behaves as before and no region data is required.
2. **Given** a consumer enables the optional regions package, **When** country-level data and region-level data overlap, **Then** country fills and country borders remain visible while internal region borders are drawn as dotted lines.
3. **Given** a country has exactly one official region in the optional data, **When** the region layer is enabled, **Then** the country can still report that single region without creating misleading internal subdivision lines.

---

### User Story 3 - Show Region Names At Appropriate Zoom (Priority: P3)

A map viewer zooms into a country and sees region names only when they can be presented clearly. Region labels follow the same visibility and collision expectations as country names so the map does not become cluttered.

**Why this priority**: Region names are useful only when they are legible and do not overwhelm the map. The feature should improve drill-down readability rather than add noise.

**Independent Test**: Can be tested by zooming between country-level and region-level views and verifying that region labels appear only when the zoom level and available space make them readable.

**Acceptance Scenarios**:

1. **Given** the map is zoomed out to a world or continent view, **When** the region layer is enabled, **Then** region names are hidden and the country-level map remains readable.
2. **Given** the map is zoomed into a country with region coverage, **When** regions have enough visible area for labels, **Then** region names are placed using the same label visibility rules as country names.
3. **Given** multiple small neighboring regions cannot all fit readable labels, **When** the label placement rules are applied, **Then** labels that would collide or become unreadable are omitted before they obscure the map.

---

### User Story 4 - Update Examples To Use Real Region Data (Priority: P4)

A developer viewing the project examples can see the optional regions package in action instead of a placeholder implementation. The zoom and sizing examples demonstrate how region data appears as users zoom in and how the optional package affects map detail.

**Why this priority**: Examples are the primary discovery path for consumers and must reflect the real integration pattern, not temporary placeholder data.

**Independent Test**: Can be tested by opening the affected examples, enabling region display, and verifying that the examples use the optional regions data package for visible region boundaries and names.

**Acceptance Scenarios**:

1. **Given** the zoom-with-regions example is open, **When** region detail is enabled and a covered country is selected, **Then** the example displays regions from the optional package instead of placeholder regions.
2. **Given** the sizing example is open, **When** region detail is enabled at a size and zoom where regions are visible, **Then** the example shows the real optional region layer without crowding the country map and without printing the below-map region list.
3. **Given** the optional regions package includes the target coverage list, **When** a covered country has official first-level regions such as states, provinces, territories, cantons, departments, emirates, or equivalent local government subdivisions, **Then** the same region overlay and label behavior applies internationally rather than only to the United States.

### Edge Cases

- Countries may have one official first-level region, many regions, or no available region coverage.
- Region naming conventions differ by country, such as states, provinces, territories, cantons, departments, emirates, or other official local government terms.
- Very small regions, islands, enclaves, and dense metropolitan subdivisions may not have enough visible area for labels at some zoom levels.
- Region borders must not be mistaken for international borders or authoritative legal boundary determinations.
- Optional region data may be incomplete in early coverage releases; consumers need visible coverage metadata rather than silent assumptions.
- Region data should not break country-level tooltips, labels, values, pins, dispute metadata, or zoom behavior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide an optional package artifact that delivers region boundary data separately from the core country-level package.
- **FR-002**: The optional package MUST represent regions as official first-level local government subdivisions within a country, using a generic "region" term while preserving each region's local display name.
- **FR-003**: The optional package MUST support countries with zero, one, or many regions without requiring special-case consumer behavior.
- **FR-004**: Region records MUST include at minimum a country association, stable region identifier, display name, boundary geometry, and coverage status.
- **FR-005**: Region boundaries MUST render as an overlay on top of the country-level map without replacing country boundaries or country-level values.
- **FR-006**: Internal region borders MUST be visually distinct from country borders by using dotted line styling by default.
- **FR-007**: Region names MUST use the same visibility, fit, and collision expectations as country names.
- **FR-008**: Region names MUST become visible only when zoom level and available rendered area make them readable.
- **FR-009**: The default country-level map experience MUST remain usable without installing or loading the optional regions package.
- **FR-010**: The system MUST expose coverage information so consumers can determine which countries have region data, which have partial region data, and which have no region data.
- **FR-011**: The optional package MUST include first-level region coverage for the exact target country list: United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia.
- **FR-012**: The system MUST handle countries with a single region by exposing the region record while avoiding misleading internal dotted lines when no internal boundary exists.
- **FR-013**: The region overlay MUST preserve existing country interactions including tooltips, labels, pins, values, dispute metadata, zoom controls, and accessible map behavior.
- **FR-014**: The zoom-with-regions example MUST use the optional regions data package rather than placeholder region data.
- **FR-015**: The sizing example MUST demonstrate the optional regions data package when region detail is enabled and the map size and zoom make regions visible, and MUST NOT render the visible text list of regions below the map.
- **FR-016**: Documentation MUST explain how consumers add the optional regions package, what "region" means, how coverage is represented, how dotted borders differ from country borders, and when region labels appear.
- **FR-017**: Region data changes MUST include a reviewable source and coverage record so maintainers can extend or correct country coverage over time.
- **FR-018**: The optional regions package MUST not increase the default installed or loaded size for consumers who use only the core country-level map.
- **FR-019**: The region layer MUST degrade gracefully when region geometry is unavailable, malformed, or not visible at the current zoom level.
- **FR-020**: Region boundary data MUST be documented as thematic map data and MUST NOT be presented as legal, diplomatic, cadastral, navigational, or authoritative boundary data.

### Constitution Requirements _(mandatory)_

- **CR-001**: Feature MUST preserve the project's MIT-compatible open-source distribution model and document any public API or package artifact changes.
- **CR-002**: Feature MUST identify whether map data, country/territory names, geopolitical boundaries, codes, disputed areas, or neutrality language are affected. If affected, requirements MUST reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **CR-003**: Feature MUST define testable behavior and quality validation needed to keep coverage above the project threshold and avoid hidden package, build, TypeScript, lint, test, dependency, or runtime warnings.
- **CR-004**: Feature MUST preserve documented SVG accessibility behavior and justify any new runtime dependency or bundle-size impact.
- **CR-005**: Feature MUST identify release, README generation, package export, semantic versioning, and consumer documentation impact when applicable.

### Key Entities _(include if feature involves data)_

- **Region Package**: Optional distributable artifact that contains region data and any consumer-facing helpers needed to use that data with the core map.
- **Country Region Coverage**: A country-level coverage record indicating whether region data is complete, partial, unavailable, or intentionally represented as a single region.
- **Coverage Catalog**: The package-level index of covered countries, including the required target country list across the Americas, Europe, Asia, Africa, and Oceania.
- **Target Coverage Country**: One of the 23 countries required for first-level region breakdown in this feature.
- **Region Record**: A single official first-level local government subdivision within a country, including stable identity, display name, country association, geometry, and coverage notes.
- **Region Boundary Geometry**: The shape data needed to draw a region overlay and determine label placement.
- **Region Label**: A visible region name that follows country-name readability and collision behavior.
- **Region Overlay**: The rendered layer that displays dotted internal borders and optional labels above the country-level map.
- **Example Region Scenario**: A documented example state showing how optional region data appears in zoom and sizing workflows.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Consumers who do not add the optional regions package continue to render existing country-level maps with no region package dependency.
- **SC-002**: Consumers can enable region overlays for covered countries in under 10 minutes using the documented setup path.
- **SC-003**: The optional package provides first-level region coverage for all 23 target countries, with expected first-level regions listed and renderable for each covered country.
- **SC-004**: At least 95% of region labels in covered-country zoom scenarios are either readable or intentionally hidden by the shared label visibility rules.
- **SC-005**: Region overlay rendering preserves country-level interactions in all documented examples, including tooltips, labels, pins, zoom controls, and country values.
- **SC-006**: The zoom-with-regions and sizing examples no longer use placeholder region data and visibly demonstrate the optional package, while sizing examples omit the below-map region list.
- **SC-007**: Documentation identifies coverage status, data limitations, dotted border meaning, and non-authoritative boundary language before release.
- **SC-008**: The core country-level package size does not increase for consumers who do not opt into region data.
- **SC-009**: Validation confirms covered-country region records have names, country associations, stable identifiers, and renderable boundaries.

## Assumptions

- "Region" refers to first-level official local government subdivisions within a country, even when local terminology differs.
- Target coverage includes United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia, using the same international coverage model rather than any United States-specific data shape.
- The optional package may contain partial coverage as long as the coverage status is explicit and documented.
- Region labels should reuse country-label behavior conceptually so users experience consistent readability rules across country and region names.
- Region data is thematic visualization data and does not claim legal, cadastral, navigational, diplomatic, or authoritative status.
- Existing country-level rendering remains the default experience and must continue to work without region data.
