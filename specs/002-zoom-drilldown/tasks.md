# Tasks: Zoom Drill-Down

**Input**: Design documents from `/specs/002-zoom-drilldown/` **Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), [quickstart.md](./quickstart.md)

**Tests**: Code-bearing changes MUST include tests. Coverage MUST remain above the project threshold.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently. Phase 1 country-level zoom work is completed before optional Phase 2 region detail work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Required only for user story phases.
- Every task includes exact file paths.

## Phase 1: Setup

**Purpose**: Confirm existing project structure, scripts, and docs surfaces before feature work.

- [x] T001 Review package scripts and validation gates in package.json, lib/package.json, and website/package.json.
- [x] T002 [P] Review current WorldMap rendering, SVG grouping, and tooltip flow in lib/src/index.tsx and lib/src/draw.tsx.
- [x] T003 [P] Review existing Region, TextLabel, PinMarker, ZoomControls, and ZoomStatus component surfaces in lib/src/components/Region.tsx, lib/src/components/TextLabel.tsx, lib/src/components/PinMarker.tsx, lib/src/components/ZoomControls.tsx, and lib/src/components/ZoomStatus.tsx.
- [x] T004 [P] Review docs and website example surfaces in README.md, lib/README.md, docs/api.md, docs/examples.md, docs/customization.md, website/src/pages/examples/zoom.tsx, and website/src/components/ZoomExample.tsx.

---

## Phase 2: Foundational

**Purpose**: Establish shared zoom, geometry, label, pin, and rendering primitives that block user-story implementation.

- [x] T005 [P] Define or verify Phase 1 zoom, pin, label, and zoom-state public types in lib/src/types.ts.
- [x] T006 [P] Define or verify default zoom configuration and country border defaults in lib/src/constants.ts.
- [x] T007 [P] Implement or verify zoom transform helpers for scale, translate, zoom-around-point, pan, and reset in lib/src/zoom/state.ts.
- [x] T008 [P] Implement or verify projected geometry helpers for country bounds, visible area, and multi-part geometry in lib/src/zoom/geometry.ts.
- [x] T009 [P] Implement or verify label placement helpers for fit, collision, prioritization, and zoom-aware label sizing in lib/src/labels/placement.ts.
- [x] T010 [P] Implement or verify consumer pin projection and validation helpers in lib/src/pins/mapPins.ts.
- [x] T011 [P] Add or update unit tests for zoom transform boundaries, repeated zoom, panning, and reset in lib/src/**tests**/zoom-state.test.ts.
- [x] T012 [P] Add or update unit tests for geometry helpers and non-contiguous geometry handling in lib/src/**tests**/zoom-geometry.test.ts.

**Checkpoint**: Shared primitives are typed, tested, and ready for user-story implementation.

---

## Phase 3: User Story 1 - Preserve Current World Map Behavior (Priority: P1) MVP

**Goal**: Existing consumers see unchanged country-level rendering when zoom and detail-level options are omitted.

**Independent Test**: Render the map with existing props only and confirm country-level paths, callbacks, accessibility labels, tooltips, text labels, sizing, frame, and package imports remain compatible.

### Tests for User Story 1

- [x] T013 [P] [US1] Add regression tests that omitted zoom props do not render zoom controls, default zoom labels, pins, or unavailable-detail warnings in lib/src/**tests**/WorldMap.test.tsx.
- [x] T014 [P] [US1] Add regression tests for existing style, tooltip, click, link, text label, sizing, frame, and accessibility behavior in lib/src/**tests**/WorldMap.test.tsx.
- [x] T015 [P] [US1] Add public export compatibility assertions for existing and new type exports in lib/src/**tests**/components.test.tsx.

### Implementation for User Story 1

- [x] T016 [US1] Thread optional zoom props through WorldMap without changing default rendering in lib/src/index.tsx.
- [x] T017 [US1] Preserve existing country path, tooltip, custom text label, frame, href, and click rendering when zoom is omitted in lib/src/index.tsx.
- [x] T018 [US1] Export zoom-related public types while preserving existing exports in lib/src/index.tsx and lib/src/types.ts.

**Checkpoint**: User Story 1 is independently functional and preserves backward compatibility.

---

## Phase 4: User Story 2 - Zoom And Pan The Country Map (Priority: P2)

**Goal**: Consumers can opt into explicit country-level zoom controls, continuous zoom, drag panning, reset, live announcements, and constant screen-space country borders without region data.

**Independent Test**: Enable zoom, activate zoom in/out repeatedly, drag the map, reset the map, and confirm the country-level view remains stable with country border strokes staying constant on screen.

### Tests for User Story 2

- [x] T019 [P] [US2] Add component tests for rendering keyboard-operable zoom in, zoom out, and reset controls when zoom is enabled in lib/src/**tests**/zoom-controls.test.tsx.
- [x] T020 [P] [US2] Add component tests for repeated zoom in/out, reset state updates, and onZoomChange calls in lib/src/**tests**/zoom-interaction.test.tsx.
- [x] T021 [P] [US2] Add component tests for pointer drag panning and drag cleanup in lib/src/**tests**/zoom-drag.test.tsx.
- [x] T022 [P] [US2] Add component tests proving country border paths use non-scaling stroke behavior or equivalent inverse-scale stroke handling during repeated zoom in lib/src/**tests**/zoom-controls.test.tsx.
- [x] T023 [P] [US2] Add component tests for live zoom and reset announcements in lib/src/**tests**/zoom-controls.test.tsx.

### Implementation for User Story 2

- [x] T024 [US2] Implement accessible zoom in, zoom out, and reset controls in lib/src/components/ZoomControls.tsx.
- [x] T025 [US2] Apply opt-in zoom transforms to the country map content group in lib/src/index.tsx.
- [x] T026 [US2] Wire continuous zoom in/out actions, reset behavior, and keyboard shortcuts into WorldMap state in lib/src/index.tsx and lib/src/zoom/state.ts.
- [x] T027 [US2] Wire pointer drag-pan handlers and drag cleanup into WorldMap in lib/src/index.tsx.
- [x] T028 [US2] Invoke onZoomChange for scale and translation updates in lib/src/index.tsx.
- [x] T029 [US2] Keep country border strokes at constant screen-space thickness during zoom by applying vector-effect non-scaling-stroke or equivalent inverse-scale stroke handling in lib/src/components/Region.tsx and lib/src/index.tsx.
- [x] T030 [US2] Implement accessible zoom and reset status announcements in lib/src/components/ZoomStatus.tsx and lib/src/index.tsx.

**Checkpoint**: User Story 2 is independently functional without region data, including the fixed zoom-border behavior.

---

## Phase 5: User Story 3 - Show Country Labels And Consumer Pins At Readable Zoom Levels (Priority: P3)

**Goal**: Country labels are enabled by default with zoom, avoid collisions, handle non-contiguous territory, and show consumer-supplied pins only when readable.

**Independent Test**: Enable zoom and labels, provide longitude/latitude pins with captions, zoom into multiple countries, and confirm labels and pins appear only when fit and collision rules allow them.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add unit tests for label candidate generation, text bounds, area fit, collision rejection, and priority ordering in lib/src/**tests**/label-placement.test.ts.
- [ ] T032 [P] [US3] Add unit tests for non-contiguous country label placement using the United States or an equivalent multi-part fixture in lib/src/**tests**/zoom-labels.test.tsx.
- [ ] T033 [P] [US3] Add unit tests for consumer pin projection, invalid coordinate handling, caption handling, and missing pin fallback in lib/src/**tests**/map-pins.test.ts.
- [ ] T034 [P] [US3] Add component tests for zoom-dependent label and pin visibility thresholds in lib/src/**tests**/zoom-labels.test.tsx.

### Implementation for User Story 3

- [ ] T035 [US3] Render default country labels when zoom is enabled and showCountryLabels is not disabled in lib/src/index.tsx and lib/src/components/TextLabel.tsx.
- [ ] T036 [US3] Implement fit-aware and collision-aware country label placement, including non-contiguous country handling, in lib/src/labels/placement.ts and lib/src/zoom/geometry.ts.
- [ ] T037 [US3] Render consumer-supplied pin markers and captions through zoom-dependent fit/collision gating in lib/src/index.tsx, lib/src/components/PinMarker.tsx, and lib/src/pins/mapPins.ts.
- [ ] T038 [US3] Preserve custom textLabelFunction behavior alongside default zoom labels in lib/src/index.tsx.

**Checkpoint**: User Story 3 is independently functional on top of opt-in country zoom.

---

## Phase 6: Phase 1 Documentation And Example

**Purpose**: Document country-level zoom, constant border behavior, labels, and consumer pins before optional region work begins.

- [ ] T039 [P] Add or update the Phase 1 zoom example page in website/src/pages/examples/zoom.tsx.
- [ ] T040 [P] Add or update a reusable zoom example component with consumer-supplied sample pins in website/src/components/ZoomExample.tsx and website/src/data/countryCapitalPins.ts.
- [x] T041 Document zoom props, continuous zoom, drag panning, reset, keyboard controls, announcements, and constant border thickness in docs/api.md and docs/examples.md.
- [ ] T042 Document country label placement, non-contiguous country behavior, consumer pin visibility rules, and example-only capital pin data in docs/customization.md and docs/examples.md.
- [ ] T043 Update README source content and regenerate package README output in README.md and lib/README.md.

**Phase 1 Release Gate**: Do not start Phase 7 until T001-T043 are complete and validation passes.

---

## Phase 7: User Story 4 - Add Optional Region Detail Package After Zoom Foundation (Priority: P4)

**Goal**: After Phase 1, add optional provider-backed region detail without increasing the base package footprint or breaking country-level zoom.

**Independent Test**: Enable region detail with a provider and confirm supported countries render normalized regions while missing providers, unsupported coverage, loading, and failures fall back cleanly.

### Tests for User Story 4

- [ ] T044 [P] [US4] Add core detail provider contract and fallback tests for no provider, unsupported country, loading, ready, and failed states in lib/src/**tests**/detail-provider.test.tsx.
- [ ] T045 [P] [US4] Add visible-region list accessibility tests in lib/src/**tests**/visible-region-list.test.tsx.
- [ ] T046 [P] [US4] Add optional package data validation tests in regions/src/**tests**/region-data.test.ts.

### Implementation for User Story 4

- [ ] T047 [US4] Add Phase 2 detailLevel, detailProvider, region record, region collection, and provider result public types in lib/src/types.ts.
- [ ] T048 [US4] Implement provider state management and country-level fallback behavior in lib/src/detail/providerState.ts.
- [ ] T049 [US4] Render region detail only when provider data is ready and coverage exists in lib/src/index.tsx.
- [ ] T050 [US4] Add visible-region list rendering synchronized with displayed region detail in lib/src/components/VisibleRegionList.tsx.
- [ ] T051 [US4] Create optional regions workspace package configuration in regions/package.json, regions/tsconfig.json, and regions/tsup.config.ts.
- [ ] T052 [US4] Add normalized starter region data, coverage metadata, and neutrality notes in regions/src/data and regions/src/coverage.ts.
- [ ] T053 [US4] Add core-compatible region provider adapter exports in regions/src/providers/createRegionsDetailProvider.ts and regions/src/index.ts.
- [ ] T054 [US4] Document optional region package installation, provider setup, fallback states, and starter coverage in docs/api.md, docs/examples.md, and README.md.

**Checkpoint**: User Story 4 is optional, provider-backed, and does not alter default country-level behavior.

---

## Phase 8: Polish And Cross-Cutting Concerns

**Purpose**: Validate quality gates, docs, package artifacts, and neutrality requirements.

- [ ] T055 [P] Run map-data neutrality review for Phase 2 region names/boundaries and example-only sample pin data in docs/map-data-policy.md, docs/map-data-overrides.json, and GEOPOLITICAL_POLICY.md.
- [ ] T056 [P] Verify package exports and package contents in lib/package.json and, after Phase 2, regions/package.json.
- [ ] T057 Run yarn lint from package.json.
- [ ] T058 Run yarn format-check from package.json.
- [ ] T059 Run yarn typecheck from package.json.
- [ ] T060 Run yarn spellcheck from package.json.
- [ ] T061 Run yarn test:coverage from package.json and confirm coverage remains above the project threshold.
- [ ] T062 Run yarn build from package.json.
- [ ] T063 Run yarn generate:readme from package.json and confirm README.md and lib/README.md are synchronized.
- [ ] T064 Run npm pack --dry-run ./lib and verify package contents against lib/package.json.
- [ ] T065 After Phase 2 only, run yarn workspace @react-svg-worldmap/regions build from regions/package.json.
- [ ] T066 Update release notes or changelog impact for Phase 1 and Phase 2 in CHANGELOG.md and docs/RELEASING.md.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2.
- **Phase 4 US2**: Depends on Phase 2 and must preserve US1 behavior.
- **Phase 5 US3**: Depends on US2 zoom transforms and Phase 2 geometry helpers.
- **Phase 6 Phase 1 Docs**: Depends on US1-US3 behavior.
- **Phase 7 US4**: Depends on the Phase 1 Release Gate after T001-T043.
- **Phase 8 Polish**: Runs after the selected release scope is complete.

### User Story Dependencies

- **US1 Preserve Current World Map Behavior**: No user-story dependency after foundation.
- **US2 Zoom And Pan The Country Map**: No region data dependency; must keep US1 default behavior intact.
- **US3 Labels And Consumer Pins**: Depends on US2 zoom state and Phase 2 geometry helpers.
- **US4 Optional Region Detail Package**: Deferred until Phase 1 is complete.

### Parallel Opportunities

- T002-T004 can run in parallel.
- T005-T012 can run in parallel where file ownership does not overlap.
- T013-T015 can run in parallel before T016-T018.
- T019-T023 can run in parallel before T024-T030.
- T031-T034 can run in parallel before T035-T038.
- T039-T040 can run in parallel with T041-T043 after Phase 1 behavior is stable.
- T044-T046 can run in parallel after the Phase 1 Release Gate.
- T055-T056 can run in parallel with validation commands once implementation is complete.

## Parallel Example: User Story 2

```text
Task: "Add component tests for rendering keyboard-operable zoom in, zoom out, and reset controls when zoom is enabled in lib/src/__tests__/zoom-controls.test.tsx"
Task: "Add component tests for repeated zoom in/out, reset state updates, and onZoomChange calls in lib/src/__tests__/zoom-interaction.test.tsx"
Task: "Add component tests proving country border paths use non-scaling stroke behavior or equivalent inverse-scale stroke handling during repeated zoom in lib/src/__tests__/zoom-controls.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add unit tests for label candidate generation, text bounds, area fit, collision rejection, and priority ordering in lib/src/__tests__/label-placement.test.ts"
Task: "Add unit tests for consumer pin projection, invalid coordinate handling, caption handling, and missing pin fallback in lib/src/__tests__/map-pins.test.ts"
Task: "Implement fit-aware and collision-aware country label placement, including non-contiguous country handling, in lib/src/labels/placement.ts and lib/src/zoom/geometry.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 and validate default behavior.
3. Stop and verify the MVP independently before adding zoom behavior.

### Phase 1 Increment

1. Add User Story 2 for opt-in zoom, pan, reset, announcements, and constant screen-space borders.
2. Add User Story 3 for labels and consumer pins.
3. Complete Phase 1 docs and run validation.
4. Release or demo Phase 1 before starting optional regions.

### Phase 2 Later

1. Start User Story 4 only after the Phase 1 Release Gate.
2. Keep region data optional and provider-backed.
3. Re-run default country-level and Phase 1 zoom tests after region work.

## Notes

- Tasks marked [P] must not edit the same files in parallel without coordination.
- User story phases include tests before implementation tasks.
- Phase 2 region tasks are intentionally deferred until the country-level zoom foundation is complete.
- The zoom-border bug is covered by T022 and T029.
