# Feature Specification: Optional Regions Data Package

**Feature Branch**: `004-regions-data-package`  
**Created**: 2026-05-02  
**Status**: Draft

## Clarifications

### Session 2026-05-02

- Q: Should sizing examples show the visible text list of regions beneath the map? → A: No; sizing examples must not render the below-map region list.
- Q: Should region coverage be limited to United States starter regions? → A: No; coverage model must be international and support any country with official first-level regions.
- Q: Which countries must be broken down into regions for this feature? → A: Americas: United States, Canada, Mexico, Brazil, Argentina, Venezuela; Europe: Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia; Asia: India, Pakistan, United Arab Emirates, Malaysia, Iraq; Africa: Nigeria, Ethiopia, South Africa, Sudan; Oceania: Australia, Micronesia.

### Session 2026-05-03

- Q: How should the project use Google Maps-style land/ocean clarity as guidance? → A: Document the general visual principles and improve default land-vs-ocean contrast while staying lightweight, SVG-based, and themeable rather than attempting to clone Google Maps.
- Q: Which map-detail disclosure model should guide country and region rendering? → A: Use a hybrid B/C model: precomputed geometry tiers with optional lazy loading for heavier detailed tiers.
- Q: Who should own geometry tier selection and lazy loading in this implementation? → A: Core package owns automatic tier selection and package-local lazy loading; external providers and custom maps are deferred future enhancements.
- Q: What threshold policy should decide when geometry tiers become visible? → A: Fixed zoom thresholds: reduced country below `2x`, detailed country at `2x`, regions at `4x`.
- Q: What performance guardrails should validate gradual disclosure? → A: Record package/tier sizes and test that detailed tiers are not parsed before their zoom thresholds.

### Session 2026-05-04

- Q: How should double-click zoom choose its zoom origin? → A: Double-click zooms in around the clicked point.
- Q: What zoom step should double-click use? → A: Use the same zoom factor as the `+` zoom button.
- Q: Should the redesigned zoom controls include reset? → A: Superseded by the 2026-05-08 clarification; zoom controls now include a home-icon reset control.
- Q: Should the map expose or render a visible below-map region list feature? → A: No; remove the visible region list and `showRegionList` functionality entirely.
- Q: How should AWS region pins handle locations that AWS does not publish at city precision? → A: Include all AWS Regions from the official AWS Regions documentation; use the most accurate published or inferable location for each pin, preferring city-level locations, then state/region capitals with "(location not published)", then country capitals with "(location not published)" when only country-level geography is inferable.
- Q: Should rendering use an explicit layer stack to separate ocean, countries, and regions? → A: Use explicit SVG layer order: ocean/background layer first, country land layer above it, region overlay layer above countries, then labels, pins, and interaction targets.

### Session 2026-05-08

- Q: How should zoom controls address too-small click steps and returning to the full-world view? → A: Make each zoom in/out click use twice the previous zoom-control step, and add a third Reset zoom button using a home icon where available with accessible label and tooltip "Reset zoom".

### Session 2026-05-09

- Q: Which countries' region overlays should load when region detail is enabled? → A: Load and render only covered countries that are currently visible in the viewport at `4x+`, with country-level chunks so non-visible countries are not parsed.
- Q: What package-size target should apply while fixing viewport-driven regions and geometry cleanup? → A: Reduce package size where practical through chunking and geometry cleanup, but do not add a numeric package-size gate for this fix.
- Q: How should clipping rectangles and out-of-country geometry artifacts be handled? → A: Add a generator validation and cleanup rule for all target countries that removes non-region clipping rectangles and out-of-country artifact subpaths before publishing.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add Official Region Boundaries (Priority: P1)

A map consumer installs an optional regions data package and enables official first-level local government regions as an overlay on top of the existing country-level map. The overlay shows region boundaries and names for countries that have region data, while countries without detailed data continue to render normally.

**Why this priority**: This is the core value of the feature: region boundaries and names must be available without forcing every core package consumer to ship the extra data.

**Independent Test**: Can be fully tested by enabling the optional regions layer for a country with region coverage and verifying that country borders, dotted internal region borders, and region names appear together without changing the default country-only map.

**Acceptance Scenarios**:

1. **Given** a map with optional region data enabled for any target covered country, **When** the country is zoomed enough for region detail to be useful, **Then** all expected first-level regions for that country are shown as a dotted-border overlay with readable region names where labels fit.
2. **Given** a map with optional region data enabled for countries using different first-level terms such as states, provinces, cantons, departments, emirates, or territories, **When** the region layer renders, **Then** all regions use the same generic region API while preserving each local display name and kind.
3. **Given** a map with optional region data enabled for a country with no region coverage, **When** the country is displayed or zoomed, **Then** the country-level map remains usable and no placeholder or broken region layer is shown.
4. **Given** a map is zoomed to `4x` or above with multiple covered countries in the viewport, **When** region detail is enabled, **Then** each visible covered country renders its own region overlay while covered countries outside the viewport are not loaded or parsed.

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

A developer viewing the project examples can see the optional regions package and global AWS Region pins in action instead of placeholder implementation data. The zoom and sizing examples demonstrate how region data appears as users zoom in, how AWS Region pins can be toggled globally, and how the optional package affects map detail.

**Why this priority**: Examples are the primary discovery path for consumers and must reflect the real integration pattern, not temporary placeholder data.

**Independent Test**: Can be tested by opening the affected examples, enabling region display, and verifying that the examples use the optional regions data package for visible region boundaries and names.

**Acceptance Scenarios**:

1. **Given** the zoom-with-regions example is open, **When** region detail is enabled and a covered country is selected, **Then** the example displays regions from the optional package instead of placeholder regions.
2. **Given** the sizing example is open, **When** region detail is enabled at a size and zoom where regions are visible, **Then** the example shows the real optional region layer without crowding the country map and without rendering any below-map list of region names.
3. **Given** the optional regions package includes the target coverage list, **When** a covered country has official first-level regions such as states, provinces, territories, cantons, departments, emirates, or equivalent local government subdivisions, **Then** the same region overlay and label behavior applies internationally rather than only to the United States.
4. **Given** the zoom-with-regions example is open, **When** the AWS locations button is enabled, **Then** pins for all AWS Regions listed in the official AWS Regions documentation appear across the world with each pin showing the AWS region code, AWS display name, best-known city, state or equivalent administrative area when known, and country.
5. **Given** AWS does not publish a precise city for a region, **When** the AWS locations button is enabled, **Then** the example uses the best inferable state/region capital or country capital as the pin location and marks the display text with "(location not published)".

### Edge Cases

- Countries may have one official first-level region, many regions, or no available region coverage.
- Double-click zoom must preserve spatial intent by zooming around the clicked map point rather than always zooming from the map center.
- Zoom controls must let users return to the initial full-world scale in one click.
- Region naming conventions differ by country, such as states, provinces, territories, cantons, departments, emirates, or other official local government terms.
- Very small regions, islands, enclaves, and dense metropolitan subdivisions may not have enough visible area for labels at some zoom levels.
- Generated region geometry may contain clipping rectangles, full-canvas rings, or out-of-country artifact subpaths from source conversion; these artifacts must be removed before publishing for every target country.
- Region borders must not be mistaken for international borders or authoritative legal boundary determinations.
- Future non-target region data may be incomplete, but target countries in this feature must publish complete coverage with visible coverage metadata rather than silent assumptions.
- Region data should not break country-level tooltips, labels, values, pins, dispute metadata, or zoom behavior.
- Region overlays must follow the visible viewport, so panning from one covered country to another at `4x+` loads and renders the newly visible covered country without keeping region detail limited to the first country in the data array.
- Region detail must not add a below-map list of region names; region discovery should happen through the map layer, labels, tooltips, coverage metadata, and documentation.
- Land and ocean visual treatment should improve map readability without implying satellite, terrain, or legal basemap accuracy.
- Country and land geometry must render as closed shapes so the default sea/background color does not bleed into land or cause all layers to appear as one color.
- Rendering order must prevent sea/background fills, country fills, region overlays, labels, pins, and interaction targets from painting over each other incorrectly.
- Countries with antimeridian crossings, large multipolygons, islands, or exclaves, including Russia and the United States, must not create hover or hit-test areas that swallow unrelated countries or report Russia while hovering another country.
- Country geometry for Russia, United States, Mexico, Nigeria, and Brazil must render in the expected visible locations and proportions at initial world view and through zoom/pan interactions.
- AWS Region pin data may have different precision levels; city-published pins must use the published city, state-only pins must use the state or equivalent administrative capital and label "(location not published)", and country-only pins must use the country capital and label "(location not published)".

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
- **FR-015**: The sizing example MUST demonstrate the optional regions data package when region detail is enabled and the map size and zoom make regions visible, and MUST NOT render a below-map list of region names.
- **FR-016**: Documentation MUST explain how consumers add the optional regions package, what "region" means, how coverage is represented, how dotted borders differ from country borders, and when region labels appear.
- **FR-017**: Region data changes MUST include a reviewable source and coverage record so maintainers can extend or correct country coverage over time.
- **FR-018**: The optional regions package MUST not increase the default installed or loaded size for consumers who use only the core country-level map.
- **FR-019**: The region layer MUST degrade gracefully when region geometry is unavailable, malformed, or not visible at the current zoom level.
- **FR-020**: Region boundary data MUST be documented as thematic map data and MUST NOT be presented as legal, diplomatic, cadastral, navigational, or authoritative boundary data.
- **FR-021**: Documentation MUST explain that clear commercial basemaps commonly separate land and ocean through water/land color contrast, coastline emphasis, label hierarchy, and tile styling, while this project remains a lightweight SVG thematic map.
- **FR-022**: The default map presentation MUST use `#A0D7EB` as the default sea/background color and `#F4F2F2` as the default land/no-data country color, while preserving themeable overrides and avoiding a hosted tile service, raster basemap, or Google Maps visual clone requirement.
- **FR-023**: The country-level geometry MUST be represented and rendered as closed land/country shapes so the sea/background layer remains visually separate from land fills.
- **FR-024**: The map MUST use gradual data disclosure through a hybrid precomputed-tier and optional lazy-loading model: zoom below `2x` uses reduced country-level geometry, zoom at or above `2x` uses more detailed country-level geometry, and zoom at or above `4x` may show region/state overlays when region detail is selected and labels or boundaries are readable.
- **FR-025**: The detailed country and optional region tiers MUST avoid increasing initial render memory or parse cost for users who only view the initial country-level map.
- **FR-026**: The core package MUST own automatic country geometry tier selection and package-local lazy loading for detailed country geometry so consumers do not need to implement a custom loader for the default experience.
- **FR-027**: The current implementation MUST keep external geometry providers and custom map data providers out of scope, while documenting them as future extension points that should not block the built-in tiered rendering behavior.
- **FR-028**: Validation MUST record package size and per-tier geometry size impact, and automated tests MUST prove that detailed country geometry is not parsed before `2x` zoom and region geometry is not parsed before `4x` zoom when selected.
- **FR-029**: When zoom is enabled, double-clicking the map MUST zoom in around the clicked point as an alternate zoom-in input using the same configured zoom factor as the `+` zoom button; the zoom in/out control step MUST be twice the previous zoom-control step while preserving configured minimum and maximum zoom clamps.
- **FR-030**: Zoom controls MUST be visually refined as map-overlay controls placed at the bottom right of the map, using clear plus, minus, and Reset zoom buttons inspired by common web map controls while remaining accessible and theme-compatible. The Reset zoom button MUST return to the initial full-world scale and position in one click, use a home icon where the project icon set provides one, expose accessible label and tooltip text "Reset zoom", and fall back to the text label "Reset" when no suitable home icon is available.
- **FR-031**: The public map API MUST remove the `showRegionList` prop and MUST NOT render the visible below-map region list component for region detail.
- **FR-032**: Every target coverage country listed in FR-011 MUST be marked as `complete` coverage for this feature; target countries MUST NOT be labeled `experimental`, `partial`, or equivalent non-complete statuses in package metadata, examples, validation output, or documentation.
- **FR-033**: The optional regions package MUST include MIT license metadata and an MIT license file in the package artifact.
- **FR-034**: The zoom-with-regions example MUST remove the generic `../data/CountryData` usage and replace it with explicit example controls for optional regions, capital cities, and AWS locations.
- **FR-035**: The zoom-with-regions example MUST include an AWS locations button that toggles pins for all AWS Regions listed by the official AWS Regions documentation at `https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html`.
- **FR-036**: Each AWS location pin MUST include the AWS region code, AWS display name, best-known city, state/province/equivalent administrative area when known, country, latitude/longitude, location precision, and whether the displayed pin location was published or inferred.
- **FR-037**: AWS location precision MUST prefer published or directly inferable city locations; when only a state/province/equivalent area is known, the pin MUST use that area's capital city and append "(location not published)" to the location label; when only country-level geography is known, the pin MUST use the country capital and append "(location not published)" to the location label.
- **FR-038**: AWS location pins MUST cover the full worldwide AWS Regions list from the official documentation rather than focusing on one country.
- **FR-039**: Country hover, tooltip, and hit-test behavior MUST align with rendered country shapes so hovering United States, Mexico, Nigeria, Brazil, or other countries does not incorrectly report Russia.
- **FR-040**: The country geometry pipeline and renderer MUST correct visible shape problems for Russia, United States, Mexico, Nigeria, and Brazil while preserving closed land/country shapes and gradual geometry tier behavior.
- **FR-041**: The renderer MUST use an explicit SVG layer stack in this order: ocean/background layer, country land/fill and country border layer, optional dotted region overlay layer, label layer, pin layer, and interaction/accessible target layer. Later layers MUST NOT cause the ocean/background color to paint over land or cause region overlays to replace country fills and borders.
- **FR-042**: When region detail is enabled at `4x` or above, the renderer MUST identify all covered countries currently visible in the viewport and load/render region overlays for those visible countries only; region selection MUST NOT be limited to the first supported country in the `data` array or coverage catalog.
- **FR-043**: The optional regions package MUST expose region geometry in country-level loadable chunks so non-visible covered countries are not parsed during viewport-driven region rendering.
- **FR-044**: Region package size reduction MUST be pursued through country-level chunking, removal of invalid or redundant geometry, and existing size reporting, but this fix MUST NOT introduce a hard numeric package-size failure threshold.
- **FR-045**: The region data generation pipeline MUST remove non-region clipping rectangles, full-canvas rings, and out-of-country artifact subpaths for all target countries before publishing generated region records.
- **FR-046**: Package validation MUST fail when any target-country region path contains artifact-like geometry that would draw outside the intended country or inflate the package without contributing visible region boundaries.

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
- **Country Region Chunk**: A loadable country-scoped region data unit containing one covered country's region records, designed so non-visible countries' region geometry can remain unparsed.
- **Artifact Subpath**: A generated path segment such as a clipping rectangle, full-canvas ring, or out-of-country shape that is not part of the intended first-level region boundary and must not be published.
- **Region Label**: A visible region name that follows country-name readability and collision behavior.
- **Region Overlay**: The rendered layer that displays dotted internal borders and optional labels above the country-level map.
- **Map Rendering Layer Stack**: The ordered SVG rendering structure that separates the ocean/background, country land, region overlays, labels, pins, and interaction targets so each visual concern paints in a predictable order.
- **Example Region Scenario**: A documented example state showing how optional region data appears in zoom and sizing workflows.
- **AWS Location Pin**: Example data point for an AWS Region, including region code, AWS display name, best-known display location, administrative area where known, country, coordinates, precision level, and a published-vs-inferred marker.
- **Country Hit Target Geometry**: The geometry used for hover, tooltip, and interaction lookup, which must correspond to the rendered country shape even for multipolygon and antimeridian-crossing countries.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Consumers who do not add the optional regions package continue to render existing country-level maps with no region package dependency.
- **SC-002**: The documented setup path lets consumers enable region overlays for covered countries through no more than four required consumer steps: install the optional package, import the provider/data helper, pass the region provider or data into the map, and enable region detail in the documented example pattern.
- **SC-003**: The optional package provides first-level region coverage for all 23 target countries, with expected first-level regions listed and renderable for each covered country.
- **SC-004**: Region label tests cover representative large-country, dense-region, and island or multipolygon target-country fixtures, and every fixture label either renders without colliding with another visible label or is intentionally hidden by the shared label visibility rules.
- **SC-005**: Region overlay rendering preserves country-level interactions in all documented examples, including tooltips, labels, pins, zoom controls, and country values.
- **SC-006**: The zoom-with-regions and sizing examples no longer use placeholder region data and visibly demonstrate the optional package without rendering a below-map region list.
- **SC-007**: Documentation identifies coverage status, data limitations, dotted border meaning, and non-authoritative boundary language before release.
- **SC-008**: The core country-level package size does not increase for consumers who do not opt into region data.
- **SC-009**: Validation confirms covered-country region records have names, country associations, stable identifiers, and renderable boundaries.
- **SC-010**: Documentation and examples make the land-vs-ocean readability approach clear, and the default SVG map remains themeable without adding runtime map-tile dependencies.
- **SC-011**: Initial world-map rendering uses the reduced country geometry tier by default, and tests verify that detailed country geometry is not rendered below `2x` zoom and selected region overlays are not rendered below `4x` zoom.
- **SC-012**: Package validation records the size and loading impact of each geometry tier, with no detailed country or region tier parsed during initial country-only render tests.
- **SC-013**: Default consumers can use gradual country-detail disclosure without passing a geometry loader prop or installing a third-party map provider.
- **SC-014**: Automated performance guard tests fail if the initial render parses detailed country geometry or selected region geometry before the configured zoom thresholds.
- **SC-015**: Double-click zoom tests verify that zooming uses the clicked point as the zoom origin and updates the same zoom state as the zoom-in control, and zoom-control tests verify each plus/minus click uses the larger clarified step while preserving min/max clamps.
- **SC-016**: Visual/control tests verify that zoom controls render at the map bottom right with accessible plus, minus, and Reset zoom controls, that the Reset zoom control restores the initial full-world scale and position in one click, and that controls do not obscure map content or labels.
- **SC-017**: API and render tests verify that the visible region list component and `showRegionList` prop are removed and that region detail never prints a below-map list of region names.
- **SC-018**: Package validation confirms all 23 target countries are reported as `complete` and no target country is reported as `experimental`, `partial`, or equivalent non-complete coverage.
- **SC-019**: Package validation confirms the optional regions package publishes MIT license metadata and includes an MIT license file.
- **SC-020**: Example tests verify that zoom-with-regions no longer imports `../data/CountryData`, includes an AWS locations toggle, and renders one AWS pin for every AWS Region listed in the official AWS Regions documentation snapshot used by the package.
- **SC-021**: AWS location data validation verifies every pin has a region code, AWS display name, country, coordinates, precision level, and "(location not published)" text whenever a state-capital or country-capital fallback is used.
- **SC-022**: Hover and rendering regression tests verify that Russia, United States, Mexico, Nigeria, and Brazil render in the correct visible locations and that hover/tooltip lookup reports the visible country rather than Russia for unrelated country areas.
- **SC-023**: Render structure tests verify the SVG layer order is ocean/background first, country land second, optional regions third, labels and pins above map geometry, and interaction targets aligned with visible country shapes.
- **SC-024**: Viewport-driven region tests verify that Canada and the United States can render region overlays independently in the same zoom session, that panning changes the visible loaded region countries, and that non-visible target-country chunks are not parsed before entering the viewport at `4x+`.
- **SC-025**: Package validation reports the packed regions package size after chunking and geometry cleanup, and confirms non-visible country chunks are not parsed during initial country-only render or viewport-driven region render outside those countries.
- **SC-026**: Region data validation confirms Canada and every other target country publish no clipping rectangles, full-canvas rings, or out-of-country artifact subpaths in region paths.

## Assumptions

- "Region" refers to first-level official local government subdivisions within a country, even when local terminology differs.
- Target coverage includes United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia, using the same international coverage model rather than any United States-specific data shape.
- The optional package may contain partial coverage for future non-target countries only; every target country in this feature must be complete and must not be presented as experimental.
- Region labels should reuse country-label behavior conceptually so users experience consistent readability rules across country and region names.
- Region data is thematic visualization data and does not claim legal, cadastral, navigational, diplomatic, or authoritative status.
- Existing country-level rendering remains the default experience and must continue to work without region data.
- Google Maps is used only as visual-design inspiration for land/ocean clarity principles; the implementation should not depend on Google Maps services or attempt pixel-level parity.
- Gradual disclosure should use local package data and browser/runtime capabilities rather than remote map-tile services.
- External geometry providers and custom maps are expected to be designed later after built-in tiered rendering is stable.
- AWS Region example data should use the official AWS Regions documentation for the region list and region display names, then use the best available public/inferable location precision for map pins with explicit "(location not published)" labeling for capital-city fallbacks.
