# Tasks: Regions Package

**Input**: Design documents from `/specs/003-regions-package/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), [quickstart.md](./quickstart.md)

**Tests**: Code-bearing changes MUST include tests. Coverage MUST remain above the project threshold.

**Organization**: Tasks are grouped by dependency and user story. The core country topology regeneration and quality-budgeted optimization are foundational because every story depends on compatible country-only rendering. User Story 1 creates the optional package MVP; User Story 2 integrates ready/fallback region detail and the "Zoom with regions" example; User Story 3 completes data quality, neutrality, topology optimization evidence, and release validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Required only for user story phases.
- Every task includes exact file paths.

## Phase 1: Setup

**Purpose**: Confirm workspace, map-data, package, and documentation surfaces before changing generated geometry, optimization settings, or public contracts.

- [x] T001 Review existing workspace scripts, package names, build outputs, and README generation in `package.json`, `lib/package.json`, `regions/package.json`, `lib/tsup.config.ts`, and `lib/scripts/generate-readme.mjs`.
- [x] T002 [P] Review topology generation, bundled topology, and current package-size baseline in `lib/scripts/migrate-to-topo.ts`, `lib/src/countries.topo.ts`, and `docs/map-data-policy.md`.
- [x] T003 [P] Review core map zoom, label, pin, detail-provider, and rendering surfaces in `lib/src/index.tsx`, `lib/src/types.ts`, `lib/src/labels/placement.ts`, `lib/src/pins/mapPins.ts`, `lib/src/detail/providerState.ts`, and `lib/src/zoom/state.ts`.
- [x] T004 [P] Review region package data/provider surfaces in `regions/src/index.ts`, `regions/src/coverage.ts`, `regions/src/data/starter.ts`, and `regions/src/providers/createRegionsDetailProvider.ts`.
- [x] T005 [P] Review documentation and examples that mention region detail or map-data optimization in `docs/api.md`, `docs/examples.md`, `docs/customization.md`, `README.md`, `lib/README.md`, `website/src/pages/examples/zoom.tsx`, and `website/src/components/ZoomExample.tsx`.
- [x] T006 [P] Review map-data neutrality policy and overrides for optimized country topology and region coverage implications in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, and `GEOPOLITICAL_POLICY.md`.

---

## Phase 2: Foundational - Country Topology, Optimization Budget, And Shared Contracts

**Purpose**: Restore higher-detail country geometry, reduce package size with quality-budgeted optimization, and keep shared contracts ready for all user stories.

- [x] T007 [P] Add or update map-data generation validation tests for country count, ISO/name preservation, retained 6-decimal precision, coordinate detail delta, and renderable paths in `lib/src/__tests__/map-data-generation.test.ts`.
- [x] T008 [P] Add quality-budget fixture tests covering small islands, complex coastlines, borders, small countries, package-size reduction, and no material degradation in `lib/src/__tests__/map-data-generation.test.ts`.
- [x] T009 [P] Add package-size smoke assertions or helper coverage for optimized topology artifacts in `lib/src/__tests__/map-data-generation.test.ts`.
- [x] T010 [P] Verify or update region detail public types in `lib/src/types.ts` for `DetailLevel`, `RegionCoverageStatus`, `DetailLayerStatus`, `RegionCoverageRecord`, `RegionViewport`, `RegionFeatureRecord`, `RegionCollectionRecord`, `DetailProvider`, and `DetailProviderResult`.
- [x] T011 [P] Verify or update detail provider state helpers in `lib/src/detail/providerState.ts` for idle, unavailable, failed, loading, and ready states typed from `lib/src/types.ts`.
- [x] T012 [P] Verify or update exports for region detail types from `lib/src/index.tsx` while preserving existing country, zoom, pin, and dispute exports.
- [x] T013 Update `lib/scripts/migrate-to-topo.ts` to preserve the current source path, retain at least 6 decimal places, emit validation output, and support a high-detail baseline topology artifact.
- [x] T014 Add quality-budgeted simplification or quantization controls to `lib/scripts/migrate-to-topo.ts` with documented optimization settings and a disabled-by-default safe path.
- [x] T015 Add fixture comparison logic to `lib/scripts/migrate-to-topo.ts` for small-island, coastline, border, and small-country geometry checks against the high-detail baseline.
- [x] T016 Regenerate the high-detail baseline and optimized core country topology in `lib/src/countries.topo.ts` using `lib/scripts/migrate-to-topo.ts`.
- [x] T017 Verify optimized topology keeps current country-only rendering compatible in `lib/src/__tests__/WorldMap.test.tsx`.
- [x] T018 Record topology source input, precision settings, compression steps, optimization settings, quality-budget fixtures, validation output, and package-size impact in `docs/map-data-policy.md`.
- [x] T019 Update map-data override metadata for optimized country topology in `docs/map-data-overrides.json`.
- [x] T020 [P] Verify optional regions workspace entries and package skeleton in `regions/package.json`, `regions/tsconfig.json`, `regions/tsup.config.ts`, `regions/vitest.config.ts`, and `regions/src/index.ts`.
- [x] T021 [P] Verify root workspace configuration includes the optional regions package in `package.json`, `package-lock.json`, and `yarn.lock`.
- [x] T022 [P] Verify baseline optional package documentation in `regions/README.md`.

**Checkpoint**: Country topology is regenerated, optimized, package-size impact is measured, quality fixtures pass, and core plus optional package boundaries are typed and ready for story implementation.

---

## Phase 3: User Story 1 - Add Region Detail Package (Priority: P1) MVP

**Goal**: Consumers can add an optional region package, inspect starter coverage, and retrieve normalized region records without changing country-only map usage.

**Independent Test**: Install or reference the optional region package, verify coverage metadata and region records for supported countries, and confirm the core country map does not require the package.

### Tests for User Story 1

- [x] T023 [P] [US1] Add or update optional package export and provider contract tests in `regions/src/__tests__/regions-package.test.ts`.
- [x] T024 [P] [US1] Add or update region data validation tests for coverage records, unique region ids, parent country matching, non-empty labels, and renderable paths in `regions/src/__tests__/region-data.test.ts`.
- [x] T025 [P] [US1] Add or update core package compatibility tests proving country-only rendering works without importing the optional regions package in `lib/src/__tests__/WorldMap.test.tsx`.

### Implementation for User Story 1

- [x] T026 [US1] Add or update starter region coverage metadata in `regions/src/coverage.ts`.
- [x] T027 [US1] Add or update starter normalized region collections in `regions/src/data/starter.ts`.
- [x] T028 [US1] Implement or verify coverage lookup helpers in `regions/src/coverage.ts`.
- [x] T029 [US1] Implement or verify `createRegionsDetailProvider` in `regions/src/providers/createRegionsDetailProvider.ts`.
- [x] T030 [US1] Export package coverage, collections, helpers, and provider factory from `regions/src/index.ts`.
- [x] T031 [US1] Verify optional package build output and type declarations through `regions/package.json` and `regions/tsup.config.ts`.

**Checkpoint**: User Story 1 is independently functional: the optional package exposes reviewed starter coverage and a core-compatible provider while country-only usage remains unchanged.

---

## Phase 4: User Story 2 - Display Regions When Available (Priority: P2)

**Goal**: The core map can use a provided detail provider to display supported region boundaries, labels, fallback states, status announcements, and the renamed "Zoom with regions" example while preserving country-level behavior when detail is unavailable.

**Independent Test**: Enable region detail with a supported provider, focus a covered country, and verify region boundaries and labels render; then test unavailable and failed provider states fall back to the country view with status.

### Tests for User Story 2

- [x] T032 [P] [US2] Add or update provider state unit tests for idle, loading, ready, unavailable, failed, and reset transitions in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T033 [P] [US2] Add or update component tests for rendering supported region boundaries and labels in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T034 [P] [US2] Add or update component tests for unavailable and failed region provider fallback behavior in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T035 [P] [US2] Add or update visible region list accessibility tests in `lib/src/__tests__/visible-region-list.test.tsx`.
- [x] T036 [P] [US2] Add or update regression tests proving zoom controls, reset, pins, tooltips, custom text labels, optimized country topology, and country fallback behavior remain compatible in `lib/src/__tests__/WorldMap.test.tsx` and `lib/src/__tests__/zoom-labels.test.tsx`.

### Implementation for User Story 2

- [x] T037 [US2] Add or verify `detailLevel`, `detailProvider`, and `onDetailStatusChange` props handling in `lib/src/index.tsx`.
- [x] T038 [US2] Implement or verify provider loading and fallback state management in `lib/src/detail/providerState.ts`.
- [x] T039 [US2] Render or verify region boundaries from ready provider collections in `lib/src/index.tsx` using existing SVG region rendering patterns.
- [x] T040 [US2] Add or verify fit-aware region label candidate support in `lib/src/labels/placement.ts`.
- [x] T041 [US2] Render or verify region labels with existing text label behavior in `lib/src/index.tsx` and `lib/src/components/TextLabel.tsx`.
- [x] T042 [US2] Keep consumer pins anchored and visible only when fit rules allow during region detail in `lib/src/index.tsx` and `lib/src/pins/mapPins.ts`.
- [x] T043 [US2] Implement or verify visible region list rendering in `lib/src/components/VisibleRegionList.tsx`.
- [x] T044 [US2] Wire or verify live region detail status announcements and `onDetailStatusChange` callbacks in `lib/src/index.tsx` and `lib/src/components/ZoomStatus.tsx`.
- [x] T045 [US2] Preserve country-level fallback for omitted providers, unsupported countries, loading failures, disabled region details, optimized topology rendering, and reset in `lib/src/index.tsx`.
- [x] T046 [US2] Rename visible zoom example references to "Zoom with regions" in `website/docusaurus.config.js`, `website/src/pages/examples/zoom.tsx`, `docs/api.md`, and `docs/examples.md`.
- [x] T047 [US2] Add or verify independent capital-city and region-detail controls in `website/src/components/ZoomExample.tsx`.
- [x] T048 [US2] Use or verify an XL canvas and default region details on with capital city overlay off in `website/src/components/ZoomExample.tsx`.
- [x] T049 [US2] Add or verify compact example controls styling in `website/src/components/ZoomExample.module.css`.

**Checkpoint**: User Story 2 is independently functional on top of any compatible provider, including safe fallback when region data is unavailable and a working "Zoom with regions" example.

---

## Phase 5: User Story 3 - Handle Region Data Quality, Neutrality, And Optimization Evidence (Priority: P3)

**Goal**: Region data and optimized country topology are reviewed, documented, and validated so maintainers can release and extend coverage responsibly while keeping package size under control.

**Independent Test**: Review country topology validation output, quality-budget fixture results, package-size delta, starter coverage metadata, region records, names, boundaries, and neutrality notes; run validation to prove incomplete or sensitive coverage is not presented as complete and optimized topology does not materially degrade visible map quality.

### Tests for User Story 3

- [x] T050 [P] [US3] Add or update neutrality and coverage metadata validation tests in `regions/src/__tests__/region-data.test.ts`.
- [x] T051 [P] [US3] Add or update package contents and export smoke tests for the optional regions package in `regions/src/__tests__/regions-package.test.ts`.
- [x] T052 [P] [US3] Add or update documentation example validation or smoke coverage for region detail setup in `website/src/components/ZoomExample.tsx` and `website/src/pages/examples/zoom.tsx`.
- [x] T053 [P] [US3] Add or update topology optimization evidence tests for fixture results and package-size delta in `lib/src/__tests__/map-data-generation.test.ts`.

### Implementation for User Story 3

- [x] T054 [US3] Add or update region coverage limitations and neutrality notes in `regions/src/coverage.ts`.
- [x] T055 [US3] Update map data policy references for optimized country topology and starter region coverage in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, and `GEOPOLITICAL_POLICY.md`.
- [x] T056 [US3] Document optional region package installation, provider setup, starter coverage, fallback states, country topology regeneration, and quality-budgeted optimization in `docs/api.md`, `docs/examples.md`, and `docs/customization.md`.
- [x] T057 [US3] Add or update region detail examples in `website/src/components/ZoomExample.tsx` and `website/src/pages/examples/zoom.tsx`.
- [x] T058 [US3] Update README source content and regenerate package README output in `README.md`, `lib/README.md`, and `regions/README.md`.
- [x] T059 [US3] Update release notes and release impact for the optional package, optimized country topology, quality-budget fixtures, and package-size delta in `CHANGELOG.md` and `docs/RELEASING.md`.

**Checkpoint**: User Story 3 is independently verifiable through topology validation, quality-budget fixture evidence, package-size measurements, data validation, documented coverage, and release-ready package/documentation surfaces.

---

## Phase 6: Polish And Cross-Cutting Concerns

**Purpose**: Validate optimized topology, package outputs, quality gates, and release readiness across core and optional packages.

- [x] T060 [P] Verify package export surfaces and package contents in `lib/package.json` and `regions/package.json`.
- [x] T061 [P] Verify optional regions package does not become a runtime dependency of the core package in `lib/package.json`, `regions/package.json`, and generated package output.
- [x] T062 Run `yarn workspace react-svg-worldmap test map-data-generation.test.ts` from `package.json`.
- [x] T063 Run `yarn workspace react-svg-worldmap test detail-provider.test.tsx visible-region-list.test.tsx` from `package.json`.
- [x] T064 Run `yarn workspace @react-svg-worldmap/regions test` from `regions/package.json`.
- [x] T065 Run `yarn lint` from `package.json`.
- [x] T066 Run `yarn format-check` from `package.json`.
- [x] T067 Run `yarn typecheck` from `package.json`.
- [x] T068 Run `yarn spellcheck` from `package.json`.
- [x] T069 Run `yarn test:coverage` from `package.json` and confirm coverage remains above the project threshold.
- [x] T070 Run `yarn build` from `package.json`.
- [x] T071 Run `yarn generate:readme` from `package.json` and confirm README files are synchronized.
- [x] T072 Run `npm pack --dry-run ./lib` and verify optimized core package contents and size impact.
- [x] T073 Run `npm pack --dry-run ./regions` and verify optional regions package contents.
- [x] T074 Run quickstart validation from `specs/003-regions-package/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; delivers the MVP optional package.
- **Phase 4 US2**: Depends on Phase 2 and can use a test provider, but full optional-package demo depends on US1.
- **Phase 5 US3**: Depends on regenerated/optimized topology, starter data, and behavior surfaces from US1 and US2.
- **Phase 6 Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Add Region Detail Package**: Starts after foundation; no dependency on core region rendering beyond shared types.
- **US2 Display Regions When Available**: Starts after foundation; can be tested with inline providers, then integrated with US1 provider.
- **US3 Data Quality, Neutrality, And Optimization Evidence**: Depends on optimized topology, starter data, and release surfaces from US1 and US2.

### Parallel Opportunities

- T002-T006 can run in parallel.
- T007-T012 and T020-T022 can run in parallel after setup review.
- T023-T025 can run in parallel before T026-T031.
- T032-T036 can run in parallel before T037-T049.
- T050-T053 can run in parallel before T054-T059.
- T060-T061 can run in parallel with documentation review after implementation.

## Parallel Example: Foundational

```text
Task: "Add or update map-data generation validation tests for country count, ISO/name preservation, retained 6-decimal precision, coordinate detail delta, and renderable paths in lib/src/__tests__/map-data-generation.test.ts"
Task: "Add quality-budget fixture tests covering small islands, complex coastlines, borders, small countries, package-size reduction, and no material degradation in lib/src/__tests__/map-data-generation.test.ts"
Task: "Verify or update region detail public types in lib/src/types.ts"
Task: "Verify optional regions workspace entries and package skeleton in regions/package.json, regions/tsconfig.json, regions/tsup.config.ts, regions/vitest.config.ts, and regions/src/index.ts"
```

## Parallel Example: User Story 1

```text
Task: "Add or update optional package export and provider contract tests in regions/src/__tests__/regions-package.test.ts"
Task: "Add or update region data validation tests for coverage records, unique region ids, parent country matching, non-empty labels, and renderable paths in regions/src/__tests__/region-data.test.ts"
Task: "Add or update core package compatibility tests proving country-only rendering works without importing the optional regions package in lib/src/__tests__/WorldMap.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Add or update provider state unit tests for idle, loading, ready, unavailable, failed, and reset transitions in lib/src/__tests__/detail-provider.test.tsx"
Task: "Add or update visible region list accessibility tests in lib/src/__tests__/visible-region-list.test.tsx"
Task: "Add or update regression tests proving zoom controls, reset, pins, tooltips, custom text labels, optimized country topology, and country fallback behavior remain compatible in lib/src/__tests__/WorldMap.test.tsx and lib/src/__tests__/zoom-labels.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add or update topology optimization evidence tests for fixture results and package-size delta in lib/src/__tests__/map-data-generation.test.ts"
Task: "Add or update package contents and export smoke tests for the optional regions package in regions/src/__tests__/regions-package.test.ts"
Task: "Add or update documentation example validation or smoke coverage for region detail setup in website/src/components/ZoomExample.tsx and website/src/pages/examples/zoom.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2 so the higher-detail optimized country topology and shared contracts are validated.
2. Complete User Story 1 to deliver the optional regions package and provider helper.
3. Stop and validate package coverage metadata, starter region records, optimized core topology, and core country-only compatibility.

### Incremental Delivery

1. Regenerate and quality-budget optimize country topology before adding or changing region detail behavior.
2. Add or verify the optional region package from User Story 1.
3. Add or verify core provider/fallback rendering from User Story 2.
4. Add region list, labels, pins, status integration, and the "Zoom with regions" example without changing default country-only behavior.
5. Complete data quality, neutrality, optimization evidence, documentation, examples, and release notes in User Story 3.
6. Run full validation and package smoke checks.

### Parallel Team Strategy

1. One developer owns topology generation, quality-budget fixtures, optimization, and docs under `lib/scripts/`, `lib/src/countries.topo.ts`, `lib/src/__tests__/map-data-generation.test.ts`, and `docs/`.
2. One developer owns optional package data and provider files under `regions/`.
3. One developer owns core detail provider state and rendering files under `lib/src/`.
4. One developer owns website examples, generated READMEs, neutrality review, package-size measurement, and release artifacts.

## Notes

- Tests should be written before implementation for code-bearing tasks.
- Do not make the core package depend on the optional regions package at runtime.
- Treat optimized country geometry, region names, and region boundaries as map-data changes requiring review.
- Keep unsupported countries on a stable country-level fallback path.
- Record package-size impact, but do not trade away the 6-decimal coordinate precision or quality-budget fixture requirements for size alone.
