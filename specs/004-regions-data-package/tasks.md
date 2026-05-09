# Tasks: Optional Regions Data Package

**Input**: Design documents from `/specs/004-regions-data-package/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/public-api.md, quickstart.md

**Tests**: Code-bearing changes MUST include tests. Rendering-layer, geometry, hover, package, and example behavior all require automated validation.

**Organization**: Tasks are grouped by setup, blocking foundations, then user stories in priority order so each story remains independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks
- **[Story]**: Which user story the task belongs to
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Re-read the current implementation state and protect existing dirty work before changing code.

- [x] T001 Review current git status and identify pre-existing dirty files in `/Users/ehudamiri/Documents/projects/react-svg-worldmap`
- [x] T002 [P] Review the updated rendering-layer plan in `specs/004-regions-data-package/plan.md`
- [x] T003 [P] Review the rendering-layer API contract in `specs/004-regions-data-package/contracts/public-api.md`
- [x] T004 [P] Review the layer-stack data model in `specs/004-regions-data-package/data-model.md`
- [x] T005 [P] Review current renderer structure in `lib/src/index.tsx`, `lib/src/components/Region.tsx`, and `lib/src/components/PinMarker.tsx`
- [x] T006 Run baseline focused tests with `yarn workspace react-svg-worldmap test WorldMap.test.tsx country-hit-targets.test.tsx geometry-tiers.test.ts zoom-drag.test.tsx zoom-interaction.test.tsx zoom-controls.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the rendering-layer contract and regression tests that block all story implementation.

**Critical**: No user story work should begin until the SVG layer order and hit-target expectations are testable.

- [x] T007 [P] Add SVG layer-order structure tests for ocean, countries, regions, labels, pins, and interaction targets in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T008 [P] Add country identity and hit-target alignment tests for United States, Mexico, Nigeria, Brazil, and Russia in `lib/src/__tests__/country-hit-targets.test.tsx`
- [x] T009 [P] Add default sea/background and no-data land color assertions tied to rendered layer structure in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T010 [P] Add zoom-tier regression coverage that verifies layer order is stable for reduced and detailed country tiers in `lib/src/__tests__/geometry-tiers.test.ts`
- [x] T011 Define stable layer identifiers and rendering order helpers in `lib/src/types.ts`
- [x] T012 Implement explicit SVG group order for ocean/background, countries, regions, labels, pins, and interaction targets in `lib/src/index.tsx`
- [x] T013 Ensure country visual paths expose stable country code and country name attributes in `lib/src/components/Region.tsx`
- [x] T014 Ensure interaction paths derive identity from the same country records as visible country paths in `lib/src/index.tsx`
- [x] T015 Ensure pin rendering remains above labels/map geometry without affecting country hit targets in `lib/src/components/PinMarker.tsx`
- [x] T016 Run foundational validation with `yarn workspace react-svg-worldmap test WorldMap.test.tsx country-hit-targets.test.tsx geometry-tiers.test.ts`

**Checkpoint**: Rendering layer structure is explicit, testable, and ready for region-story work.

---

## Phase 3: User Story 1 - Add Official Region Boundaries (Priority: P1) MVP

**Goal**: The optional package provides complete first-level region boundaries for all target countries and renders them as dotted overlays above country land.

**Independent Test**: Enable the optional regions layer for a target country and verify complete coverage metadata plus dotted region paths above country paths without replacing country fills.

### Tests for User Story 1

- [x] T017 [P] [US1] Add target-country completeness tests for all 23 countries in `regions/src/__tests__/coverage-completeness.test.ts`
- [x] T018 [P] [US1] Add region record shape, non-empty path, and expected-count tests in `regions/src/__tests__/regions-package.test.ts`
- [x] T019 [P] [US1] Add provider integration tests for complete target coverage and unavailable fallback behavior in `lib/src/__tests__/detail-provider.test.tsx`
- [x] T020 [P] [US1] Add dotted region overlay layer assertions in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T021 [P] [US1] Add MIT license artifact tests for the optional regions package in `regions/src/__tests__/regions-package.test.ts`

### Implementation for User Story 1

- [x] T022 [US1] Update target coverage metadata so every FR-011 country is `complete` in `regions/src/data/starter.ts`
- [x] T023 [US1] Update generated-data validation so target countries cannot emit `partial` or `experimental` statuses in `regions/scripts/generate-starter-regions.mjs`
- [x] T024 [US1] Ensure `createRegionsDetailProvider` exposes complete target coverage and graceful unavailable behavior in `regions/src/providers/createRegionsDetailProvider.ts`
- [x] T025 [US1] Ensure region overlay paths render in the `regions` SVG layer with dotted styling in `lib/src/index.tsx`
- [x] T026 [US1] Add or update MIT license file for the optional regions package in `regions/LICENSE`
- [x] T027 [US1] Ensure the regions package publishes the license file and license metadata in `regions/package.json`
- [x] T028 [US1] Update optional package documentation for complete target coverage and non-authoritative data in `regions/README.md`
- [x] T029 [US1] Run User Story 1 validation with `yarn workspace @react-svg-worldmap/regions test` and `yarn workspace react-svg-worldmap test detail-provider.test.tsx WorldMap.test.tsx`

**Checkpoint**: User Story 1 is independently testable and provides complete optional region data.

---

## Phase 4: User Story 2 - Keep Region Detail Optional And Layered (Priority: P2)

**Goal**: Country-only consumers keep the lightweight core package while optional regions layer above countries without breaking rendering, hover, tooltips, labels, pins, or values.

**Independent Test**: Render maps with and without the optional regions package and verify core-only rendering has no region dependency while optional rendering keeps country fills/borders below dotted region overlays.

### Tests for User Story 2

- [x] T030 [P] [US2] Add parse-guard tests proving optional region data is not loaded by country-only rendering in `lib/src/__tests__/geometry-tiers.test.ts`
- [x] T031 [P] [US2] Add country render and hover regression tests for Russia, United States, Mexico, Nigeria, and Brazil in `lib/src/__tests__/country-hit-targets.test.tsx`
- [x] T032 [P] [US2] Add closed-shape and sea/land bleed regression tests in `lib/src/__tests__/map-data-generation.test.ts`
- [x] T033 [P] [US2] Add API removal tests for `showRegionList` and below-map region output in `lib/src/__tests__/WorldMap.test.tsx`

### Implementation for User Story 2

- [x] T034 [US2] Align projected viewport, content bounds, and map transforms for all layers in `lib/src/zoom/geometry.ts`
- [x] T035 [US2] Update core rendering to use shared transforms for countries, regions, labels, pins, and interaction targets in `lib/src/index.tsx`
- [x] T036 [US2] Fix country hover, tooltip, and click lookup to use rendered country identity and geometry in `lib/src/index.tsx`
- [x] T037 [US2] Correct antimeridian and multipolygon handling for Russia and United States geometry tiers in `lib/src/map-data/`
- [x] T038 [US2] Preserve detailed country tier lazy loading and reduced-tier fallback in `lib/src/index.tsx`
- [x] T039 [US2] Apply default sea `#A0D7EB` and land/no-data `#F4F2F2` colors while preserving theme overrides in `lib/src/index.tsx`
- [x] T040 [US2] Remove the `showRegionList` public prop and visible region list render path from `lib/src/index.tsx`
- [x] T041 [US2] Remove stale visible region list component and tests from `lib/src/components/VisibleRegionList.tsx` and `lib/src/__tests__/visible-region-list.test.tsx`
- [x] T042 [US2] Update TypeScript declarations for removed region list API in `website/src/react-svg-worldmap.d.ts`
- [x] T043 [US2] Run User Story 2 validation with `yarn workspace react-svg-worldmap test geometry-tiers.test.ts country-hit-targets.test.tsx WorldMap.test.tsx map-data-generation.test.ts`

**Checkpoint**: User Story 2 is independently testable and keeps optional regions layered and non-core.

---

## Phase 5: User Story 3 - Show Region Names At Appropriate Zoom (Priority: P3)

**Goal**: Region geometry and labels disclose only when zoom and visible area make them useful and readable.

**Independent Test**: Zoom from world view into a covered country and verify reduced country, detailed country, and region overlay thresholds, plus label fit/collision behavior.

### Tests for User Story 3

- [x] T044 [P] [US3] Add zoom threshold tests for reduced country, detailed country, and region overlay visibility in `lib/src/__tests__/geometry-tiers.test.ts`
- [x] T045 [P] [US3] Add region label fit and collision tests in `lib/src/__tests__/zoom-labels.test.tsx`
- [x] T046 [P] [US3] Add zoom-state clamp tests for initial, doubled button step, double-click, keyboard, reset, and drag paths in `lib/src/__tests__/zoom-state.test.ts`
- [x] T047 [P] [US3] Add drag-pan blank-space regression tests in `lib/src/__tests__/zoom-drag.test.tsx`

### Implementation for User Story 3

- [x] T048 [US3] Enforce reduced country geometry below `2x` and detailed geometry at or above `2x` in `lib/src/index.tsx`
- [x] T049 [US3] Enforce selected region overlay eligibility at or above `4x` in `lib/src/index.tsx`
- [x] T050 [US3] Reuse country label fit and collision behavior for region labels in `lib/src/index.tsx`
- [x] T051 [US3] Update zoom clamp helpers for initial state, doubled control steps, reset, double-click, keyboard zoom, and drag pan in `lib/src/zoom/state.ts`
- [x] T052 [US3] Ensure double-click zoom uses clicked point and the updated configured zoom-in control factor in `lib/src/index.tsx`
- [x] T053 [US3] Keep zoom controls as bottom-right plus/minus/reset overlay with a home-icon Reset zoom control in `lib/src/components/ZoomControls.tsx`
- [x] T054 [US3] Run User Story 3 validation with `yarn workspace react-svg-worldmap test zoom-labels.test.tsx zoom-state.test.ts zoom-drag.test.tsx zoom-interaction.test.tsx zoom-controls.test.tsx geometry-tiers.test.ts`

**Checkpoint**: User Story 3 is independently testable through zoom and label behavior.

---

## Phase 6: User Story 4 - Update Examples To Use Real Region Data (Priority: P4)

**Goal**: Website examples demonstrate real optional regions, XL zoom canvas, capital-city and AWS Region toggles, and no placeholder `CountryData` in the zoom-with-regions example.

**Independent Test**: Open the zoom and sizing examples, enable region/AWS/capital overlays, and verify real optional regions and worldwide AWS pins render without placeholder data or printed region lists.

### Tests for User Story 4

- [x] T055 [P] [US4] Add AWS location pin data assertions in `regions/src/__tests__/regions-package.test.ts`
- [x] T056 [P] [US4] Add example import regression tests to ensure `../data/CountryData` is absent from `website/src/components/ZoomExample.tsx` in `regions/src/__tests__/regions-package.test.ts`
- [x] T057 [P] [US4] Add example tests for no below-map region headings in `regions/src/__tests__/regions-package.test.ts`
- [x] T058 [P] [US4] Add website type coverage for AWS pin data and optional regions imports in `website/src/react-svg-worldmap.d.ts`

### Implementation for User Story 4

- [x] T059 [US4] Add static AWS Region location pin dataset with precision metadata in `website/src/data/awsRegionLocations.ts`
- [x] T060 [US4] Update zoom-with-regions to use `size="xl"`, optional regions provider, and no `../data/CountryData` import in `website/src/components/ZoomExample.tsx`
- [x] T061 [US4] Add AWS locations toggle and pin rendering in `website/src/components/ZoomExample.tsx`
- [x] T062 [US4] Add or preserve capital cities toggle independently from AWS and region-detail toggles in `website/src/components/ZoomExample.tsx`
- [x] T063 [US4] Update XL sizing example to use optional regions package without initial cropped zoom in `website/src/components/sizing/XL.tsx`
- [x] T064 [US4] Update XXL sizing example to use optional regions package without initial cropped zoom in `website/src/components/sizing/XXL.tsx`
- [x] T065 [US4] Ensure examples never render headings such as `India regions` or coverage lists below the map in `website/src/components/ZoomExample.tsx`
- [x] T066 [US4] Update website docs for zoom, sizing, AWS locations, and complete target coverage in `docs/examples.md`
- [x] T067 [US4] Run User Story 4 validation with `yarn workspace @react-svg-worldmap/regions test` and `yarn workspace website typecheck`

**Checkpoint**: User Story 4 is independently testable through the website examples.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, release validation, package measurements, and final quality gates.

- [x] T068 [P] Update public API documentation for explicit SVG layer order, removed `showRegionList`, geometry tiers, and AWS example behavior in `docs/api.md`
- [x] T069 [P] Update customization documentation for land/ocean colors, layer order, and themeability in `docs/customization.md`
- [x] T070 [P] Update map-data policy documentation for thematic non-authoritative rendering, complete target regions, and AWS pin precision notes in `docs/map-data-policy.md`
- [x] T071 [P] Update root package README for optional regions, layer order, and example behavior in `README.md`
- [x] T072 Regenerate generated package README with `yarn generate:readme` and verify `lib/README.md`
- [x] T073 Update changelog or release notes for rendering-layer contract, coverage completeness, MIT license, AWS pins, geometry fixes, and API removal in `CHANGELOG.md`
- [x] T074 Record reduced country, detailed country, optional regions, core pack, and regions pack sizes in `docs/map-data-policy.md` and `docs/RELEASING.md`
- [x] T075 Review `docs/map-data-overrides.json` for target-country region and geometry changes, updating it when a case-specific policy decision is needed or documenting in `docs/map-data-policy.md` that no override changes are required
- [x] T076 Verify `docs/examples.md`, `docs/api.md`, and `regions/README.md` document the no-more-than-four-step setup path for enabling optional region overlays
- [x] T077 Add deterministic region label fixture coverage for representative large-country, dense-region, and island or multipolygon target countries in `lib/src/__tests__/zoom-labels.test.tsx`
- [x] T078 Add malformed region geometry fallback coverage for provider/render behavior in `lib/src/__tests__/detail-provider.test.tsx` or `lib/src/__tests__/WorldMap.test.tsx`
- [x] T079 Run full core package tests with `yarn workspace react-svg-worldmap test`
- [x] T080 Run full optional regions package tests with `yarn workspace @react-svg-worldmap/regions test`
- [x] T081 Run type checking with `yarn typecheck`
- [x] T082 Run linting with `yarn lint`
- [x] T083 Run formatting validation with `yarn format-check`
- [x] T084 Run spelling validation with `yarn spellcheck`
- [x] T085 Run coverage validation with `yarn test:coverage`
- [x] T086 Run full build with `yarn build`
- [x] T087 Run core package dry-run with `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`
- [x] T088 Run regions package dry-run with `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions`
- [x] T089 Confirm final git diff contains only intended changes for this feature in `/Users/ehudamiri/Documents/projects/react-svg-worldmap`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; MVP optional region data and overlay rendering.
- **US2 (Phase 4)**: Depends on Foundational; validates optional layering and core-only behavior.
- **US3 (Phase 5)**: Depends on Foundational and uses US2 viewport/zoom foundations when available.
- **US4 (Phase 6)**: Depends on US1 provider/data and US2/US3 map behavior for realistic examples.
- **Polish (Phase 7)**: Depends on completed implementation scope.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; provides complete optional region data.
- **User Story 2 (P2)**: Starts after Foundational; may run beside US1 but final overlay validation benefits from US1 data.
- **User Story 3 (P3)**: Starts after Foundational; final validation benefits from US2 zoom and viewport fixes.
- **User Story 4 (P4)**: Starts after US1 data/provider and core rendering behavior are stable.

### Parallel Opportunities

- Setup review tasks T002-T005 can run in parallel.
- Foundational tests T007-T010 can run in parallel before implementation.
- US1 tests T017-T021 can run in parallel.
- US2 tests T030-T033 can run in parallel.
- US3 tests T044-T047 can run in parallel.
- US4 tests T055-T058 can run in parallel.
- Polish docs tasks T068-T071 can run in parallel after behavior stabilizes.

---

## Parallel Examples

### User Story 1

```bash
Task: "T017 [P] [US1] Add target-country completeness tests for all 23 countries in regions/src/__tests__/coverage-completeness.test.ts"
Task: "T020 [P] [US1] Add dotted region overlay layer assertions in lib/src/__tests__/WorldMap.test.tsx"
Task: "T021 [P] [US1] Add MIT license artifact tests for the optional regions package in regions/src/__tests__/regions-package.test.ts"
```

### User Story 2

```bash
Task: "T030 [P] [US2] Add parse-guard tests proving optional region data is not loaded by country-only rendering in lib/src/__tests__/geometry-tiers.test.ts"
Task: "T031 [P] [US2] Add country render and hover regression tests for Russia, United States, Mexico, Nigeria, and Brazil in lib/src/__tests__/country-hit-targets.test.tsx"
Task: "T032 [P] [US2] Add closed-shape and sea/land bleed regression tests in lib/src/__tests__/map-data-generation.test.ts"
```

### User Story 3

```bash
Task: "T044 [P] [US3] Add zoom threshold tests for reduced country, detailed country, and region overlay visibility in lib/src/__tests__/geometry-tiers.test.ts"
Task: "T045 [P] [US3] Add region label fit and collision tests in lib/src/__tests__/zoom-labels.test.tsx"
Task: "T047 [P] [US3] Add drag-pan blank-space regression tests in lib/src/__tests__/zoom-drag.test.tsx"
```

### User Story 4

```bash
Task: "T055 [P] [US4] Add AWS location pin data assertions in regions/src/__tests__/regions-package.test.ts"
Task: "T056 [P] [US4] Add example import regression tests to ensure ../data/CountryData is absent from website/src/components/ZoomExample.tsx in regions/src/__tests__/regions-package.test.ts"
Task: "T059 [US4] Add static AWS Region location pin dataset with precision metadata in website/src/data/awsRegionLocations.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 / User Story 1.
3. Validate complete target-country region data and dotted region overlay rendering independently.

### Incremental Delivery

1. Foundation: make SVG layer order and hit targets explicit and tested.
2. US1: complete optional region data and package license.
3. US2: repair optional layering, country rendering, and hover hit targets.
4. US3: finish gradual disclosure, labels, zoom, and pan bounds.
5. US4: update website examples with real regions and AWS locations.
6. Polish: docs, package measurements, and full gates.

### Validation Order

1. Focused story tests at each checkpoint.
2. `yarn workspace react-svg-worldmap test`
3. `yarn workspace @react-svg-worldmap/regions test`
4. `yarn typecheck`
5. `yarn lint`
6. `yarn format-check`
7. `yarn spellcheck`
8. `yarn test:coverage`
9. `yarn build`
10. npm pack dry-runs for `./lib` and `./regions`
