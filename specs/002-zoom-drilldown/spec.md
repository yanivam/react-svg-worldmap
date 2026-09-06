# Feature Specification: Zoom Drill-Down

**Feature Branch**: `002-zoom-drilldown`  
**Created**: 2026-04-28  
**Status**: Draft

## Clarifications

### Session 2026-04-28

- Q: What source should seed this specification? -> A: Migrate the zoom drill-down design and planning content from branch `codex/zoom-drilldown-spec` into a new `002` Spec Kit feature based on the current `001` branch.
- Q: What implementation sequence should 002 follow? -> A: Phase 1 builds country-level zooming, panning, labels, and consumer-supplied pin rendering without introducing region-level detail or bundled city metadata. Phase 2 introduces the optional region package only after Phase 1 is complete.

### Session 2026-05-01

- Q: How should country border thickness behave while zooming? -> A: Borders keep a constant screen-space thickness at all zoom levels.

### Session 2026-05-02

- Q: How should country label text size behave while zooming? -> A: Use automatic clamped zoom-aware label sizing by default, with consumer overrides in `ZoomOptions`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Preserve Current World Map Behavior (Priority: P1)

As an existing package consumer, I need the world map to keep rendering at the country level by default so upgrading the package does not force me into drill-down behavior or additional data packages.

**Why this priority**: Backward compatibility protects existing users and keeps the package's default identity as a lightweight world map.

**Independent Test**: Can be tested by rendering the map with existing props only and confirming country-level behavior, callbacks, accessibility labels, and package usage remain compatible.

**Acceptance Scenarios**:

1. **Given** a consumer renders the map without detail-level options, **When** the map loads, **Then** it renders the existing country-level world map.
2. **Given** a consumer uses existing style, tooltip, click, link, and label callbacks, **When** they upgrade, **Then** those callbacks continue to work without requiring drill-down data.
3. **Given** no optional regions data is installed, **When** the default map renders, **Then** no warning or unavailable-detail state is shown.

---

### User Story 2 - Zoom And Pan The Country Map (Priority: P2)

As an application user exploring a thematic map, I need opt-in zoom controls and drag panning so I can focus parts of the country-level world map without requiring regional data.

**Why this priority**: Zooming and panning are the foundation for all later drill-down behavior and can deliver immediate value without expanding map data scope.

**Independent Test**: Can be tested by enabling zoom, using zoom in/out controls repeatedly, dragging the map to change focus, and confirming the country-level map remains stable without a region provider.

**Acceptance Scenarios**:

1. **Given** zooming is enabled, **When** the user activates zoom in or zoom out repeatedly, **Then** the map scales continuously without artificial step limits and remains usable.
2. **Given** zooming is enabled, **When** the user drags the map, **Then** the map focus changes by panning the current country-level view.
3. **Given** the user activates reset, **When** the map has been zoomed or panned, **Then** it returns to the default world view.
4. **Given** zooming is enabled, **When** the user zooms in or out repeatedly, **Then** country border strokes keep a constant screen-space thickness instead of growing with the zoom scale.

---

### User Story 3 - Show Country Labels And Consumer Pins At Readable Zoom Levels (Priority: P3)

As a map reader, I need country labels and consumer-supplied pins with captions to appear only when they fit the visible geography so labels add context without clutter.

**Why this priority**: Labels and optional pins are the primary payoff from zooming, but poor placement would make the map less usable.

**Independent Test**: Can be tested by enabling zoom and labels, supplying pins, zooming into countries of different sizes and shapes, and confirming labels/pins appear only when they fit and do not overlap.

**Acceptance Scenarios**:

1. **Given** zooming is enabled, **When** the map renders, **Then** country labels are enabled by default and filtered by fit/collision rules.
2. **Given** a country has non-contiguous territory such as the United States, **When** labels are evaluated, **Then** the algorithm chooses a stable readable placement without treating distant territory as one continuous label box.
3. **Given** a consumer supplies pins with longitude/latitude and captions, **When** the zoomed area is large enough, **Then** the map may show the pin marker and caption; otherwise they remain hidden.
4. **Given** zooming is enabled, **When** the user zooms in repeatedly, **Then** country label text grows within configured minimum and maximum screen-space bounds instead of remaining disproportionately small or becoming oversized.

---

### User Story 4 - Add Optional Region Detail Package After Zoom Foundation (Priority: P4)

As a package consumer, I need an optional region data package after the zoom foundation is complete so applications can later opt into state/province detail without increasing the base package footprint.

**Why this priority**: Region detail is valuable but should not block the safer country-level zoom release.

**Independent Test**: Can be tested after Phase 1 by installing the optional package, enabling region detail with a provider, and confirming supported countries can load region boundaries while unsupported/failing providers fall back cleanly.

**Acceptance Scenarios**:

1. **Given** Phase 1 is complete, **When** a consumer installs the optional region package and enables region detail, **Then** supported countries can render normalized regions.
2. **Given** region detail is requested without a provider or coverage, **When** the map renders or focuses a country, **Then** it falls back to country-level zoom behavior and communicates the unavailable state.
3. **Given** the provider fails, **When** the failure is returned, **Then** the component recovers to a stable country-level or previous-scope state.

### Edge Cases

- Region detail is requested for a country that has no provider coverage.
- Region detail provider exists but is still loading when the user selects a country.
- Region detail provider returns malformed or empty region data.
- Country or region labels collide, overflow the focused viewport, or become unreadable after zoom.
- Country label geometry spans non-contiguous territory and would produce a misleading centroid or bounding box.
- Consumer-supplied pins would fit at one zoom level but collide after panning or zooming.
- User activates back, reset, zoom in, or zoom out repeatedly at the boundary state.
- User has reduced-motion preferences enabled.
- Consumer supplies custom labels, style callbacks, tooltip callbacks, or click handlers while drill-down is enabled.
- Optional regions package is not installed.
- Region detail is enabled in server-rendered or test environments where layout measurements may be limited.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The map MUST default to country-level rendering when no detail-level option is provided.
- **FR-002**: Consumers MUST be able to opt into Phase 1 zooming without installing region-level data.
- **FR-003**: Phase 1 zooming MUST support explicit zoom in, zoom out, reset, and drag-pan interactions on the country-level map.
- **FR-004**: The feature MUST fall back to country-level rendering when region detail is requested without an available provider.
- **FR-005**: The map MUST allow continuous zooming without a fixed finite step list while preserving stable reset behavior.
- **FR-006**: The map MUST allow users to return from any zoomed or panned country-level view to the default world view.
- **FR-007**: The feature MUST include explicit controls for zoom in, zoom out, and reset.
- **FR-008**: Zoom controls MUST be operable by keyboard without relying on pointer gestures.
- **FR-009**: The component MUST provide status announcements when zoom scope, reset, or detail availability changes.
- **FR-010**: Phase 2 MUST provide a visible-region list when region detail is displayed.
- **FR-011**: Country labels MUST be enabled by default when zooming is enabled; region labels MUST remain Phase 2 behavior.
- **FR-012**: Default labels MUST use fit-aware and collision-aware placement so labels remain readable.
- **FR-013**: Phase 1 MUST NOT bundle capital city metadata in the core package.
- **FR-014**: The core package MUST support consumer-supplied pins positioned by longitude/latitude with captions, and MUST apply fit/collision gating so pins remain readable at the current zoom.
- **FR-015**: The Phase 1 zoom example MAY include sample capital pins or sample capital data outside the core package to demonstrate consumer-supplied pins.
- **FR-016**: The feature MUST avoid requiring remote network access or hosted map services for the first region drill-down iteration.
- **FR-017**: The base package MUST remain usable without installing the optional regions data package.
- **FR-018**: Phase 2 optional regions data package MUST expose normalized region data and a provider adapter compatible with the core package.
- **FR-019**: The feature MUST include a Phase 1 zoom in/out documentation example as the first examples entry before the sizing demo, and Phase 2 MUST add a region drill-down example when available.
- **FR-020**: Existing country-level style, tooltip, click, link, text label, sizing, frame, and accessibility behavior MUST remain compatible.
- **FR-021**: Country border strokes MUST keep a constant screen-space thickness at all zoom levels so zooming does not make borders visually thicker or obscure country shapes.
- **FR-022**: Country labels MUST use automatic clamped zoom-aware screen-space sizing by default, and `ZoomOptions` MUST allow consumers to override the label size range or zoom-size curve without affecting default non-zoom rendering.

### Constitution Requirements _(mandatory)_

- **CR-001**: Feature MUST preserve the project's MIT-compatible open-source distribution model and document any public API or package artifact changes.
- **CR-002**: Feature MUST identify whether map data, country/territory names, geopolitical boundaries, codes, disputed areas, or neutrality language are affected. If affected, requirements MUST reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **CR-003**: Feature MUST define testable behavior and quality validation needed to keep coverage above the project threshold and avoid hidden package, build, TypeScript, lint, test, dependency, or runtime warnings.
- **CR-004**: Feature MUST preserve documented SVG accessibility behavior and justify any new runtime dependency or bundle-size impact.
- **CR-005**: Feature MUST identify release, README generation, package export, semantic versioning, and consumer documentation impact when applicable.

### Key Entities _(include if feature involves data)_

- **Zoom State**: The current scale, translation, reset state, and pointer/keyboard interaction state for the country-level map.
- **Country Label Candidate**: A label candidate derived from country geometry, visible area, priority, and fit/collision metrics.
- **Country Label Size Rule**: The default and consumer-configured minimum, maximum, and zoom-aware sizing behavior for country label text at the current zoom.
- **Consumer Pin**: A consumer-supplied longitude/latitude marker with a caption, rendered as zoom-dependent context rather than bundled core metadata.
- **Detail Level**: The consumer-selected rendering depth, initially country-level zoom and later optional region-level detail.
- **Detail Provider**: A consumer or package-supplied source that reports region coverage and loads normalized region detail for a country.
- **Detail Provider Result**: The provider response describing status, layer, scope, optional region collection, and optional warning or failure information.
- **Region Collection**: A normalized country-scoped set of region records plus coverage metadata.
- **Region Record**: A state, province, or comparable sub-country feature with stable id, parent country code, human-readable labels, geometry, and optional viewport or ordering metadata.
- **Drill-Down State**: The current map scope, selected country, detail availability, zoom level, and transition state.
- **Visible Region List**: A non-SVG list synchronized with the currently focused region layer.
- **Label Placement**: The rules that determine which country or region labels are visible at the current scope without unacceptable collision.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Existing country-level map examples render without code changes when detail-level options are omitted.
- **SC-002**: With zooming enabled, a user can zoom in, zoom out, drag-pan, and reset the country-level map using explicit controls and pointer interactions.
- **SC-003**: Country labels appear by default when zooming is enabled and avoid visible overlap in the featured zoom example.
- **SC-004**: Consumer-supplied pins and captions appear only when the zoomed area can fit them without unacceptable overlap.
- **SC-005**: The base package remains usable without installing the optional regions package.
- **SC-006**: The feature passes package tests, type checking, linting, formatting, build, package smoke validation, and coverage above the project threshold.
- **SC-007**: Documentation lets a consumer understand how to enable Phase 1 zooming in under 10 minutes and explains that optional region detail is Phase 2.
- **SC-008**: In the Phase 1 zoom example, repeated zoom-in actions do not increase the rendered screen-space thickness of country border strokes.
- **SC-009**: In the Phase 1 zoom example, repeated zoom-in actions increase country label screen-space size within the configured bounds, and labels still pass fit/collision gating.

## Assumptions

- Phase 1 supports country-level zooming, panning, country labels, and consumer-supplied pins only.
- Any sample capital pins used by the zoom example live in documentation or example data outside the core package.
- Phase 2 introduces optional country-to-region drill-down after Phase 1 is complete.
- Region detail is optional and provider-backed rather than always bundled into the base package.
- The first region data package may provide starter coverage rather than complete global sub-country coverage.
- Country and region labels are prioritized for readability and may omit lower-priority labels when space is constrained.
- The feature is inspired by common map-platform interaction patterns, but it remains a lightweight SVG thematic visualization package rather than a hosted map platform.
- Changes may affect package exports, README generation, docs examples, website examples, and semantic versioning.
