# Tasks: Zoom Drill-Down

**Input**: Design documents from `/specs/002-zoom-drilldown/` **Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md)

**Tests**: Code-bearing changes MUST include tests unless the implementation is documentation-only, generated-only, or has no executable behavior. Coverage MUST remain above the project threshold.

**Organization**: Tasks are grouped by implementation phase and user story so Phase 1 can be completed and validated before any optional region package work begins.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no direct dependency on another same-phase task.
- **[Story]**: Maps to the user stories in [spec.md](./spec.md).
- Every task includes the primary file path(s) to edit or validate.

## Phase 1: Setup And Baseline Audit

**Purpose**: Confirm the current package boundaries and existing behavior before adding zoom.

- [ ] T001 Review current map rendering, projection, label, and accessibility entry points in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx), [lib/src/draw.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/draw.tsx), [lib/src/components/Region.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/Region.tsx), and [lib/src/components/TextLabel.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/TextLabel.tsx).
- [ ] T002 [P] Review existing public type exports and callback contracts in [lib/src/types.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/types.ts) and [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T003 [P] Review current docs/example surfaces that will need zoom documentation in [README.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/README.md), [lib/README.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/README.md), [docs/examples.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/examples.md), and [website/src/pages/examples](/Users/ehudamiri/Documents/projects/react-svg-worldmap/website/src/pages/examples).
- [ ] T004 Confirm validation commands and package scripts in [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json), [lib/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/package.json), and [website/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/website/package.json).

---

## Phase 2: Foundational Zoom Infrastructure

**Purpose**: Add shared Phase 1 primitives that block all zoom, label, and city-detail user stories.

- [ ] T005 [P] [US1] Add zoom option, zoom state, country label, and city metadata types in [lib/src/types.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/types.ts).
- [ ] T006 [P] [US1] Add default zoom configuration constants in [lib/src/constants.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/constants.ts).
- [ ] T007 [P] [US1] Add country geometry measurement helpers for projected bounds, visible area, and multi-part geometry in [lib/src/zoom/geometry.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/zoom/geometry.ts).
- [ ] T008 [P] [US1] Add zoom transform reducer/helpers for scale, translate, drag start, drag move, drag end, and reset in [lib/src/zoom/state.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/zoom/state.ts).
- [ ] T009 [P] [US1] Add unit tests for zoom transform helper boundaries and reset behavior in [lib/src/**tests**/zoom-state.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-state.test.ts).
- [ ] T010 [P] [US1] Add unit tests for country geometry measurement and non-contiguous geometry parts in [lib/src/**tests**/zoom-geometry.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-geometry.test.ts).

**Checkpoint**: Shared Phase 1 primitives are typed, tested, and ready for user-story implementation.

---

## Phase 3: User Story 1 - Preserve Current World Map Behavior (Priority: P1) MVP

**Goal**: Existing consumers see unchanged country-level behavior unless they opt into zoom.

**Independent Test**: Render the map with existing props only and confirm current country paths, callbacks, accessibility labels, tooltips, text labels, and package usage remain compatible.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add regression tests confirming omitted zoom props do not render zoom controls or default labels in [lib/src/**tests**/WorldMap.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/WorldMap.test.tsx).
- [ ] T012 [P] [US1] Add regression tests confirming existing style, tooltip, click, link, text label, sizing, frame, and dispute metadata callbacks still receive compatible context in [lib/src/**tests**/WorldMap.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/WorldMap.test.tsx).

### Implementation for User Story 1

- [ ] T013 [US1] Thread optional zoom props through the WorldMap component without changing default rendering in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T014 [US1] Preserve existing SVG structure, country path rendering, tooltip rendering, and custom text label rendering when zoom is omitted in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T015 [US1] Export new zoom-related public types without breaking existing exports in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx) and [lib/src/types.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/types.ts).

**Checkpoint**: The package remains backward-compatible and independently shippable without visible zoom behavior.

---

## Phase 4: User Story 2 - Zoom And Pan The Country Map (Priority: P2)

**Goal**: Consumers can opt into country-level zoom controls, continuous zoom, drag panning, and reset without region data.

**Independent Test**: Enable zoom, activate zoom in/out repeatedly, drag the map, reset the map, and confirm the country-level view remains stable.

### Tests for User Story 2

- [ ] T016 [P] [US2] Add component tests for rendering zoom in, zoom out, and reset controls when zoom is enabled in [lib/src/**tests**/zoom-controls.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-controls.test.tsx).
- [ ] T017 [P] [US2] Add component tests for repeated zoom in/out and reset state updates in [lib/src/**tests**/zoom-interaction.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-interaction.test.tsx).
- [ ] T018 [P] [US2] Add component tests for pointer drag panning and drag end cleanup in [lib/src/**tests**/zoom-drag.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-drag.test.tsx).

### Implementation for User Story 2

- [ ] T019 [US2] Add a ZoomControls component with accessible zoom in, zoom out, and reset buttons in [lib/src/components/ZoomControls.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/ZoomControls.tsx).
- [ ] T020 [US2] Apply zoom transforms to the country map content group when zoom is enabled in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T021 [US2] Wire continuous zoom in/out actions and reset behavior into WorldMap state in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx) and [lib/src/zoom/state.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/zoom/state.ts).
- [ ] T022 [US2] Add pointer drag-pan handlers for map focus changes in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T023 [US2] Add an `onZoomChange` callback invocation for scale and translation updates in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T024 [US2] Add accessible status text for zoom and reset changes in [lib/src/components/ZoomStatus.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/ZoomStatus.tsx) and [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).

**Checkpoint**: Phase 1 zooming works on the country-level map without region data.

---

## Phase 5: User Story 3 - Show Country Labels And City Details At Readable Zoom Levels (Priority: P3)

**Goal**: Country labels are enabled by default with zoom, avoid collisions, handle non-contiguous territory, and show capital/largest-city details only when space permits.

**Independent Test**: Enable zoom and labels, zoom into several countries, and confirm country names plus city details appear only when fit and collision rules allow them.

### Tests for User Story 3

- [ ] T025 [P] [US3] Add unit tests for label candidate generation, text bounds, area fit, and collision rejection in [lib/src/**tests**/label-placement.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/label-placement.test.ts).
- [ ] T026 [P] [US3] Add unit tests for non-contiguous country label placement using the United States or an equivalent multi-part fixture in [lib/src/**tests**/label-noncontiguous.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/label-noncontiguous.test.ts).
- [ ] T027 [P] [US3] Add tests for capital and largest-city metadata lookup and missing metadata fallback in [lib/src/**tests**/country-cities.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/country-cities.test.ts).
- [ ] T028 [P] [US3] Add component tests confirming labels and city details appear only at readable zoomed sizes in [lib/src/**tests**/zoom-labels.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/zoom-labels.test.tsx).

### Implementation for User Story 3

- [ ] T029 [US3] Add country city metadata records for capital city and largest city in [lib/src/countryCities.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/countryCities.ts).
- [ ] T030 [US3] Add label placement helpers for candidate generation, geometry-part fit, collision detection, and stable prioritization in [lib/src/labels/placement.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/labels/placement.ts).
- [ ] T031 [US3] Add country detail visibility thresholds for labels, capital city, and largest city in [lib/src/labels/detailVisibility.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/labels/detailVisibility.ts).
- [ ] T032 [US3] Render default country labels when zoom is enabled and `showCountryLabels` is not disabled in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx) and [lib/src/components/TextLabel.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/TextLabel.tsx).
- [ ] T033 [US3] Render capital and largest-city details only when visibility thresholds pass in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx) and [lib/src/components/TextLabel.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/TextLabel.tsx).
- [ ] T034 [US3] Ensure custom `textLabelFunction` behavior remains compatible alongside default zoom labels in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).

**Checkpoint**: Phase 1 is functionally complete: zooming, panning, labels, non-contiguous placement, and country city details work without region data.

---

## Phase 6: Phase 1 Documentation And Example

**Purpose**: Document the completed zoom-only release before starting optional region package work.

- [ ] T035 [P] [US2] Add a Phase 1 zoom in/out example page in [website/src/pages/examples/zoom.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/website/src/pages/examples/zoom.tsx).
- [ ] T036 [P] [US2] Add a reusable zoom example component in [website/src/components/ZoomExample.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/website/src/components/ZoomExample.tsx).
- [ ] T037 [US2] Document the zoom in/out example as the first example before sizing, plus zoom props, default country labels, drag panning, and reset behavior in [docs/examples.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/examples.md), [docs/api.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/api.md), and [website/docusaurus.config.js](/Users/ehudamiri/Documents/projects/react-svg-worldmap/website/docusaurus.config.js).
- [ ] T038 [US3] Document country city detail visibility rules and non-contiguous country label behavior in [docs/customization.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/customization.md).
- [ ] T039 [US1] Regenerate or update package README content for Phase 1 zoom in [README.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/README.md) and [lib/README.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/README.md).

**Phase 1 Release Gate**: Do not start Phase 7 until T001-T039 are complete and validation passes.

---

## Phase 7: User Story 4 - Optional Region Detail Package After Zoom Foundation (Priority: P4)

**Goal**: After Phase 1, add optional region detail without increasing the base package footprint or breaking country-level zoom.

**Independent Test**: Install/use the optional package, enable `detailLevel="regions"` with a provider, and confirm supported countries render region detail while unsupported/failing providers fall back to country-level zoom.

### Tests for User Story 4

- [ ] T040 [P] [US4] Add core provider contract and fallback tests for no provider, unsupported country, loading, ready, and failed states in [lib/src/**tests**/detail-provider.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/detail-provider.test.tsx).
- [ ] T041 [P] [US4] Add visible-region list accessibility tests in [lib/src/**tests**/visible-region-list.test.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/__tests__/visible-region-list.test.tsx).
- [ ] T042 [P] [US4] Add optional package data validation tests in [regions/src/**tests**/region-data.test.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/src/__tests__/region-data.test.ts).

### Implementation for User Story 4

- [ ] T043 [US4] Add Phase 2 detail provider and region record public types in [lib/src/types.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/types.ts).
- [ ] T044 [US4] Add provider state management and fallback handling that reuses Phase 1 zoom state in [lib/src/detail/providerState.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/detail/providerState.ts).
- [ ] T045 [US4] Render region detail only when provider data is ready and coverage exists in [lib/src/index.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/index.tsx).
- [ ] T046 [US4] Add visible-region list component synchronized with rendered region detail in [lib/src/components/VisibleRegionList.tsx](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/src/components/VisibleRegionList.tsx).
- [ ] T047 [US4] Create the optional regions workspace package manifest and build config in [regions/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/package.json), [regions/tsconfig.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/tsconfig.json), and [regions/tsup.config.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/tsup.config.ts).
- [ ] T048 [US4] Add normalized starter region data, coverage metadata, and neutrality notes in [regions/src/data](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/src/data) and [regions/src/coverage.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/src/coverage.ts).
- [ ] T049 [US4] Add a core-compatible region provider adapter in [regions/src/providers/createRegionsDetailProvider.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/src/providers/createRegionsDetailProvider.ts) and [regions/src/index.ts](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/src/index.ts).
- [ ] T050 [US4] Document Phase 2 region package installation, provider setup, fallback states, and starter coverage in [docs/examples.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/examples.md), [docs/api.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/api.md), and [README.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/README.md).

**Checkpoint**: Phase 2 region detail is optional, provider-backed, and does not affect Phase 1 zoom users.

---

## Phase 8: Polish, Validation, And Release Readiness

**Purpose**: Cross-cutting checks for quality, docs, package integrity, and map-data policy.

- [ ] T051 [P] Run map-data neutrality review for country city metadata and Phase 2 region names/boundaries against [docs/map-data-policy.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/map-data-policy.md), [docs/map-data-overrides.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/map-data-overrides.json), and [GEOPOLITICAL_POLICY.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/GEOPOLITICAL_POLICY.md).
- [ ] T052 [P] Verify package exports and package contents in [lib/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/package.json) and, after Phase 2, [regions/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/package.json).
- [ ] T053 Run `yarn lint` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json).
- [ ] T054 Run `yarn format-check` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json).
- [ ] T055 Run `yarn typecheck` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json).
- [ ] T056 Run `yarn spellcheck` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json).
- [ ] T057 Run `yarn test:coverage` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json) and confirm coverage remains above threshold.
- [ ] T058 Run `yarn build` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json).
- [ ] T059 Run `yarn generate:readme` from [package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/package.json) if README generation is still part of the release flow.
- [ ] T060 Run `npm pack --dry-run ./lib` from [lib/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/lib/package.json).
- [ ] T061 [US4] After Phase 2 only, run `yarn workspace @react-svg-worldmap/regions build` from [regions/package.json](/Users/ehudamiri/Documents/projects/react-svg-worldmap/regions/package.json).
- [ ] T062 Update release notes or changelog impact for Phase 1 and Phase 2 in [CHANGELOG.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/CHANGELOG.md) and [docs/RELEASING.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/docs/RELEASING.md).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational Zoom Infrastructure**: Depends on Phase 1.
- **Phase 3 US1 Backward Compatibility**: Depends on Phase 2.
- **Phase 4 US2 Zoom/Pan**: Depends on Phase 2 and should preserve Phase 3 behavior.
- **Phase 5 US3 Labels/City Details**: Depends on Phase 4 zoom transforms and Phase 2 geometry helpers.
- **Phase 6 Phase 1 Docs**: Depends on Phases 3-5.
- **Phase 7 US4 Optional Regions**: Depends on the Phase 1 Release Gate after T001-T039.
- **Phase 8 Polish/Validation**: Run after the selected release scope is complete. For a Phase 1-only release, skip T061 and defer Phase 2-specific validation.

### User Story Dependencies

- **US1 Preserve Current World Map Behavior**: Required before shipping any opt-in zoom behavior.
- **US2 Zoom And Pan The Country Map**: Requires foundational zoom helpers; independent of region data.
- **US3 Labels And City Details**: Requires US2 zoom state and geometry calculations.
- **US4 Optional Region Detail Package**: Must not begin until Phase 1 is complete and validated.

### Parallel Opportunities

- T002-T004 can run in parallel after T001 starts.
- T005-T010 can run in parallel because they create separate foundational files and tests.
- T016-T018 can run in parallel before implementing T019-T024.
- T025-T028 can run in parallel before implementing T029-T034.
- T035-T036 can run in parallel with T037-T039 after Phase 1 behavior is stable.
- T040-T042 can run in parallel after the Phase 1 Release Gate.
- T051-T052 can run in parallel with validation commands once implementation is complete.

## Implementation Strategy

### Phase 1 First

1. Complete T001-T010 to establish zoom infrastructure.
2. Complete T011-T015 to preserve default behavior.
3. Complete T016-T024 to ship opt-in zoom, continuous zoom, drag panning, reset, and announcements.
4. Complete T025-T034 to ship country labels, non-contiguous placement, and capital/largest-city details.
5. Complete T035-T039 and Phase 1 validation.
6. Stop and release/demo Phase 1 before starting optional regions.

### Phase 2 Later

1. Start T040-T050 only after Phase 1 is done.
2. Keep `@react-svg-worldmap/regions` optional and provider-backed.
3. Validate that Phase 2 does not change default country rendering or Phase 1 zoom behavior.
