# Tasks: Optional Regions Data Package

**Input**: Design documents from `/specs/004-regions-data-package/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/public-api.md, quickstart.md

**Tests**: Code-bearing changes MUST include tests unless the implementation is documentation-only or generated-only. Coverage MUST remain above the project threshold.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks
- **[Story]**: User story label for story phases only
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inspect current package surfaces, examples, and validation entry points before changing behavior.

- [x] T001 Inspect active feature artifacts in `specs/004-regions-data-package/spec.md`, `specs/004-regions-data-package/plan.md`, `specs/004-regions-data-package/data-model.md`, `specs/004-regions-data-package/contracts/public-api.md`, and `specs/004-regions-data-package/quickstart.md`
- [x] T002 Inspect current optional regions exports and package configuration in `regions/src/index.ts`, `regions/src/coverage.ts`, `regions/src/data/starter.ts`, `regions/src/providers/createRegionsDetailProvider.ts`, and `regions/package.json`
- [x] T003 [P] Inspect current core detail rendering and region contracts in `lib/src/index.tsx`, `lib/src/types.ts`, `lib/src/labels/placement.ts`, and `lib/src/components/VisibleRegionList.tsx`
- [x] T004 [P] Inspect current region tests in `regions/src/__tests__/region-data.test.ts`, `regions/src/__tests__/regions-package.test.ts`, `lib/src/__tests__/WorldMap.test.tsx`, `lib/src/__tests__/detail-provider.test.tsx`, and `lib/src/__tests__/zoom-labels.test.tsx`
- [x] T005 [P] Inspect current website examples in `website/src/components/ZoomExample.tsx`, `website/src/components/sizing/XL.tsx`, `website/src/components/sizing/XXL.tsx`, and `website/src/react-svg-worldmap.d.ts`
- [x] T006 [P] Inspect map data and documentation surfaces in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, `docs/api.md`, `docs/examples.md`, `docs/customization.md`, `regions/README.md`, `README.md`, and `lib/README.md`
- [x] T007 Confirm baseline validation commands from `specs/004-regions-data-package/quickstart.md` or record existing failures in `specs/004-regions-data-package/tasks.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared contracts, target-country catalog, and generation/validation infrastructure required by every user story.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [x] T008 [P] Add shared target-country and coverage metadata contract tests in `regions/src/__tests__/region-data.test.ts`
- [x] T009 [P] Add optional package export contract tests for `targetRegionCountries`, `regionCoverage`, `getRegionCoverage`, and `createRegionsDetailProvider` in `regions/src/__tests__/regions-package.test.ts`
- [x] T010 [P] Add core type contract tests or compile coverage for `sourceUrl`, target-country coverage fields, and region kind metadata in `lib/src/__tests__/detail-provider.test.tsx`
- [x] T011 [P] Add website type coverage for optional regions imports and target-country coverage usage in `website/src/react-svg-worldmap.d.ts`
- [x] T012 Extend region and coverage public types with `sourceUrl`, target-country catalog support, and coverage metadata in `lib/src/types.ts`
- [x] T013 Export updated region coverage and label-related types from `lib/src/index.tsx`
- [x] T014 Add `targetRegionCountries` catalog and helper exports in `regions/src/coverage.ts`
- [x] T015 Update `regions/src/index.ts` to export target-country catalog, coverage helpers, region collections, and provider helpers
- [x] T016 Add or refine generated data validation utilities for target-country counts, source summaries, source URLs, and empty paths in `regions/src/__tests__/region-data.test.ts`
- [x] T017 Create or update repeatable source-to-SVG generation workflow for all target countries in `regions/scripts/generate-starter-regions.mjs`
- [x] T018 Update `regions/package.json` scripts and package files for region generation and optional package publishing in `regions/package.json`
- [x] T019 Run foundational checks with `yarn workspace @react-svg-worldmap/regions test` and `yarn workspace react-svg-worldmap test detail-provider.test.tsx`

**Checkpoint**: Contracts, exports, and generation/validation scaffolding are ready for story work.

---

## Phase 3: User Story 1 - Add Official Region Boundaries (Priority: P1) MVP

**Goal**: The optional package provides first-level region boundaries and names for the exact 23 target countries while unsupported countries fall back cleanly.

**Independent Test**: Enable the optional regions layer for representative target countries and verify coverage metadata, dotted internal boundaries, local names/kinds, and graceful unavailable behavior.

### Tests for User Story 1

- [x] T020 [P] [US1] Add target-country catalog count and grouping tests for Americas, Europe, Asia, Africa, and Oceania in `regions/src/__tests__/region-data.test.ts`
- [x] T021 [P] [US1] Add generated region record tests for required fields, source metadata, expected counts, and non-empty paths in `regions/src/__tests__/region-data.test.ts`
- [x] T022 [P] [US1] Add provider tests for ready, partial, experimental, unavailable, and unsupported country results in `regions/src/__tests__/regions-package.test.ts`
- [x] T023 [P] [US1] Add core render tests for dotted region overlays and non-authoritative SVG titles in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T024 [P] [US1] Add single-region and no-internal-boundary tests in `lib/src/__tests__/detail-provider.test.tsx`

### Implementation for User Story 1

- [x] T025 [US1] Generate first-level region collections for United States, Canada, Mexico, Brazil, Argentina, and Venezuela in `regions/src/data/starter.ts`
- [x] T026 [US1] Generate first-level region collections for Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, and Russia in `regions/src/data/starter.ts`
- [x] T027 [US1] Generate first-level region collections for India, Pakistan, United Arab Emirates, Malaysia, and Iraq in `regions/src/data/starter.ts`
- [x] T028 [US1] Generate first-level region collections for Nigeria, Ethiopia, South Africa, and Sudan in `regions/src/data/starter.ts`
- [x] T029 [US1] Generate first-level region collections for Australia and Micronesia in `regions/src/data/starter.ts`
- [x] T030 [US1] Add source summaries, source URLs or references, expected region counts, coverage statuses, and review notes for all 23 target countries in `regions/src/coverage.ts`
- [x] T031 [US1] Update `createRegionsDetailProvider` to return ready, partial, experimental, unavailable, and failed results with coverage metadata in `regions/src/providers/createRegionsDetailProvider.ts`
- [x] T032 [US1] Update core region overlay rendering to use transparent fills, dotted internal borders, `data-region-id`, `data-country-code`, `data-region-kind`, and non-authoritative titles in `lib/src/index.tsx`
- [x] T033 [US1] Ensure single-region collections expose metadata without drawing misleading internal dotted boundaries in `lib/src/index.tsx`
- [x] T034 [US1] Update visible region status and accessible fallback behavior for target-country coverage in `lib/src/components/VisibleRegionList.tsx`
- [x] T035 [US1] Run `yarn workspace @react-svg-worldmap/regions test` and `yarn workspace react-svg-worldmap test WorldMap.test.tsx detail-provider.test.tsx`

**Checkpoint**: User Story 1 is functional and testable as the MVP.

---

## Phase 4: User Story 2 - Keep Region Detail Optional And Layered (Priority: P2)

**Goal**: Country-only consumers do not load region data, while opt-in consumers can layer target-country region data without replacing country behavior.

**Independent Test**: Render without the optional package and verify country-only behavior, then render with the optional provider and verify country fills, borders, tooltips, pins, values, zoom controls, and region overlays coexist.

### Tests for User Story 2

- [x] T036 [P] [US2] Add core country-only fallback tests with no detail provider in `lib/src/__tests__/detail-provider.test.tsx`
- [x] T037 [P] [US2] Add dependency boundary tests proving `react-svg-worldmap` does not import `@react-svg-worldmap/regions` in `regions/src/__tests__/regions-package.test.ts`
- [x] T038 [P] [US2] Add layered overlay tests for preserved country paths, fills, titles, tooltips, pins, values, and zoom controls in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T039 [P] [US2] Add package dry-run expectation notes for optional data isolation in `specs/004-regions-data-package/quickstart.md`

### Implementation for User Story 2

- [x] T040 [US2] Update `detailLevel="countries"` handling so it clears region state without loading optional detail data in `lib/src/index.tsx`
- [x] T041 [US2] Update region layer ordering so overlays render above country fills while preserving country interactions in `lib/src/index.tsx`
- [x] T042 [US2] Verify optional package remains a workspace dependency only where needed and not in core package dependencies in `lib/package.json`, `regions/package.json`, and `website/package.json`
- [x] T043 [US2] Update public API docs for optional layering and country-only usage in `docs/api.md`
- [x] T044 [US2] Run `yarn workspace react-svg-worldmap test detail-provider.test.tsx WorldMap.test.tsx` and `yarn workspace @react-svg-worldmap/regions test`

**Checkpoint**: User Stories 1 and 2 work independently without increasing default core-region coupling.

---

## Phase 5: User Story 3 - Show Region Names At Appropriate Zoom (Priority: P3)

**Goal**: Region labels appear only when zoom level, visible region area, and collision rules make them readable.

**Independent Test**: Zoom between world-level and target-country views and verify region labels hide when zoomed out, appear when readable, and omit colliding or too-small labels.

### Tests for User Story 3

- [x] T045 [P] [US3] Add region label candidate fit, priority, and collision tests in `lib/src/__tests__/zoom-labels.test.tsx`
- [x] T046 [P] [US3] Add zoomed-out and zoomed-in region label render tests for target-country coverage in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T047 [P] [US3] Add accessible fallback tests when dense target-country labels are hidden in `lib/src/__tests__/visible-region-list.test.tsx`

### Implementation for User Story 3

- [x] T048 [US3] Extend shared label placement helpers for region bounds, centroids, fit checks, and collisions in `lib/src/labels/placement.ts`
- [x] T049 [US3] Update region label derivation to use zoom scale, visible area, bounds, and placement results in `lib/src/index.tsx`
- [x] T050 [US3] Ensure region labels and country labels do not overlap in tested zoom scenarios in `lib/src/index.tsx`
- [x] T051 [US3] Keep `VisibleRegionList` as the accessible fallback when map labels are hidden in `lib/src/components/VisibleRegionList.tsx`
- [x] T052 [US3] Run `yarn workspace react-svg-worldmap test zoom-labels.test.tsx visible-region-list.test.tsx WorldMap.test.tsx`

**Checkpoint**: Region names are readable, zoom-aware, and independently validated.

---

## Phase 6: User Story 4 - Update Examples To Use Real Region Data (Priority: P4)

**Goal**: The zoom-with-regions and sizing examples demonstrate the optional package, and sizing examples do not print the visible below-map region list.

**Independent Test**: Open or build the website examples and verify they use the optional package, show real target-country region data where useful, and omit the below-map region list from sizing examples.

### Tests for User Story 4

- [x] T053 [P] [US4] Add optional region package import expectations for website examples in `regions/src/__tests__/regions-package.test.ts`
- [x] T054 [P] [US4] Add sizing example type coverage for optional regions imports and no visible region list behavior in `website/src/react-svg-worldmap.d.ts`
- [x] T055 [P] [US4] Add rendered example tests or source assertions that `XL.tsx` and `XXL.tsx` do not render the below-map region list in `regions/src/__tests__/regions-package.test.ts`

### Implementation for User Story 4

- [x] T056 [US4] Replace inline placeholder detail provider with `createRegionsDetailProvider` in `website/src/components/ZoomExample.tsx`
- [x] T057 [US4] Update zoom-with-regions example controls and copy for target-country optional package coverage in `website/src/components/ZoomExample.tsx`
- [x] T058 [P] [US4] Update XL sizing example to demonstrate optional region detail without rendering the visible region list in `website/src/components/sizing/XL.tsx`
- [x] T059 [P] [US4] Update XXL sizing example to demonstrate optional region detail without rendering the visible region list in `website/src/components/sizing/XXL.tsx`
- [x] T060 [US4] Update website package dependency and local module declarations for `@react-svg-worldmap/regions` in `website/package.json` and `website/src/react-svg-worldmap.d.ts`
- [x] T061 [US4] Update examples documentation for target-country region coverage and no sizing list behavior in `docs/examples.md`
- [x] T062 [US4] Run `yarn workspace website typecheck` and `yarn build:website`

**Checkpoint**: Website examples use the optional regions package and no sizing example prints the visible below-map region list.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, contributor guidance, neutrality review, packaging, and full validation.

- [x] T063 [P] Update optional package usage, target-country coverage, coverage statuses, and non-authoritative language in `regions/README.md`
- [x] T064 [P] Update package-facing region detail documentation in `README.md`
- [x] T065 [P] Update API and customization documentation in `docs/api.md` and `docs/customization.md`
- [x] T066 [P] Update map-data policy and coverage register for 23 target countries in `docs/map-data-policy.md` and `docs/map-data-overrides.json`
- [x] T067 Add contributor guidance for region data sources, generation, neutrality review, validation, and package-size checks in `CONTRIBUTING.md`
- [x] T068 Link contributor guidance from package and project docs in `README.md`, `regions/README.md`, and `docs/RELEASING.md`
- [x] T069 Update changelog and release notes for target-country regions package impact in `CHANGELOG.md` and `docs/RELEASING.md`
- [x] T070 Run `yarn generate:readme` and verify `lib/README.md` is synchronized with `README.md`
- [x] T071 Run `yarn workspace react-svg-worldmap test` for `lib/src/`
- [x] T072 Run `yarn workspace @react-svg-worldmap/regions test` for `regions/src/`
- [x] T073 Run `yarn typecheck` for workspace TypeScript validation
- [x] T074 Run `yarn lint` for `lib/src/`, `regions/src/`, and `website/src/`
- [x] T075 Run `yarn format-check` for repository Markdown, TypeScript, and JSON files
- [x] T076 Run `yarn spellcheck` for repository documentation and source text
- [x] T077 Run `yarn test:coverage` and confirm coverage remains above 80%
- [x] T078 Run `yarn build` for `lib/`, `regions/`, and `website/`
- [x] T079 Run `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib` and record that core package size is not increased by optional region data in `docs/RELEASING.md`
- [x] T080 Run `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions` and record optional package contents and size in `docs/RELEASING.md`
- [x] T081 Review final diff for placeholder region data, US-only assumptions, target-country coverage, non-authoritative language, package exports, generated README synchronization, and `CONTRIBUTING.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP for target-country region coverage.
- **User Story 2 (Phase 4)**: Depends on Foundational and should validate with US1 data when available.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from US1 data for realistic labels.
- **User Story 4 (Phase 6)**: Depends on optional package exports and at least one usable target-country collection from US1.
- **Polish (Phase 7)**: Depends on desired story completion.

### User Story Dependencies

- **US1 Add Official Region Boundaries**: No dependency on other stories after Foundation; recommended MVP.
- **US2 Keep Region Detail Optional And Layered**: Can start after Foundation, but final validation should use US1 target-country data.
- **US3 Show Region Names At Appropriate Zoom**: Can start after Foundation, but final validation should use US1 target-country data.
- **US4 Update Examples To Use Real Region Data**: Depends on stable optional package provider exports and representative US1 target-country data.

### Within Each User Story

- Tests should be written first and fail before implementation for code-bearing behavior.
- Public types and provider contracts before package exports.
- Source review and generation workflow before generated data refresh.
- Generated data before render/example integration.
- Core rendering before website examples.
- Documentation and package dry-runs after implementation.

## Parallel Opportunities

- Setup inspections T003, T004, T005, and T006 can run in parallel.
- Foundational tests T008, T009, T010, and T011 can run in parallel.
- US1 tests T020, T021, T022, T023, and T024 can run in parallel.
- US1 data generation tasks T025, T026, T027, T028, and T029 can run in parallel after T017.
- US2 tests T036, T037, T038, and T039 can run in parallel.
- US3 tests T045, T046, and T047 can run in parallel.
- US4 tests T053, T054, and T055 can run in parallel.
- US4 sizing updates T058 and T059 can run in parallel after T056 stabilizes the provider pattern.
- Documentation tasks T063, T064, T065, and T066 can run in parallel after story behavior is stable.

## Parallel Example: User Story 1

```text
Task: "T020 [P] [US1] Add target-country catalog count and grouping tests for Americas, Europe, Asia, Africa, and Oceania in regions/src/__tests__/region-data.test.ts"
Task: "T021 [P] [US1] Add generated region record tests for required fields, source metadata, expected counts, and non-empty paths in regions/src/__tests__/region-data.test.ts"
Task: "T022 [P] [US1] Add provider tests for ready, partial, experimental, unavailable, and unsupported country results in regions/src/__tests__/regions-package.test.ts"
Task: "T023 [P] [US1] Add core render tests for dotted region overlays and non-authoritative SVG titles in lib/src/__tests__/WorldMap.test.tsx"
Task: "T024 [P] [US1] Add single-region and no-internal-boundary tests in lib/src/__tests__/detail-provider.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T036 [P] [US2] Add core country-only fallback tests with no detail provider in lib/src/__tests__/detail-provider.test.tsx"
Task: "T037 [P] [US2] Add dependency boundary tests proving react-svg-worldmap does not import @react-svg-worldmap/regions in regions/src/__tests__/regions-package.test.ts"
Task: "T038 [P] [US2] Add layered overlay tests for preserved country paths, fills, titles, tooltips, pins, values, and zoom controls in lib/src/__tests__/WorldMap.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T045 [P] [US3] Add region label candidate fit, priority, and collision tests in lib/src/__tests__/zoom-labels.test.tsx"
Task: "T046 [P] [US3] Add zoomed-out and zoomed-in region label render tests for target-country coverage in lib/src/__tests__/WorldMap.test.tsx"
Task: "T047 [P] [US3] Add accessible fallback tests when dense target-country labels are hidden in lib/src/__tests__/visible-region-list.test.tsx"
```

## Parallel Example: User Story 4

```text
Task: "T053 [P] [US4] Add optional region package import expectations for website examples in regions/src/__tests__/regions-package.test.ts"
Task: "T054 [P] [US4] Add sizing example type coverage for optional regions imports and no visible region list behavior in website/src/react-svg-worldmap.d.ts"
Task: "T055 [P] [US4] Add rendered example tests or source assertions that XL.tsx and XXL.tsx do not render the below-map region list in regions/src/__tests__/regions-package.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational contracts and generation scaffolding.
3. Complete Phase 3 User Story 1.
4. Stop and validate US1 independently with `yarn workspace @react-svg-worldmap/regions test` and `yarn workspace react-svg-worldmap test WorldMap.test.tsx detail-provider.test.tsx`.
5. Demo target-country region overlays without requiring example changes.

### Incremental Delivery

1. Add US1 target-country data, coverage metadata, and provider behavior.
2. Add US2 optional layering guarantees and country-only fallback validation.
3. Add US3 zoom-aware region label placement.
4. Add US4 examples using the real optional package and remove the sizing region list.
5. Complete docs, contributor guidance, neutrality review, packaging, and full validation.

### Parallel Team Strategy

After Phase 2, separate contributors can work on US1 data generation by continent, US2 core layering tests, US3 label placement tests, and US4 website example changes, provided they coordinate shared files in `lib/src/index.tsx`, `regions/src/data/starter.ts`, and `regions/src/coverage.ts`.
