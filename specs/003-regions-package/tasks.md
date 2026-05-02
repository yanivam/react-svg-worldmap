# Tasks: Regions Package

**Input**: Design documents from `/specs/003-regions-package/` **Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), [quickstart.md](./quickstart.md)

**Tests**: Code-bearing changes MUST include tests. Coverage MUST remain above the project threshold.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently. User Story 1 creates the optional package MVP; User Story 2 integrates ready/fallback region detail into the core map; User Story 3 completes region data quality, neutrality, and release validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Required only for user story phases.
- Every task includes exact file paths.

## Phase 1: Setup

**Purpose**: Confirm the current workspace state and prepare package boundaries for the optional regions package.

- [x] T001 Review existing workspace scripts, package names, build outputs, and README generation in `package.json`, `lib/package.json`, `lib/tsup.config.ts`, and `lib/scripts/generate-readme.mjs`.
- [x] T002 [P] Review current core map zoom, label, pin, and rendering surfaces in `lib/src/index.tsx`, `lib/src/types.ts`, `lib/src/labels/placement.ts`, `lib/src/pins/mapPins.ts`, and `lib/src/zoom/state.ts`.
- [x] T003 [P] Review current documentation and examples that will mention region detail in `docs/api.md`, `docs/examples.md`, `docs/customization.md`, `README.md`, `lib/README.md`, `website/src/pages/examples/zoom.tsx`, and `website/src/components/ZoomExample.tsx`.
- [x] T004 [P] Review map-data neutrality policy and overrides for region coverage implications in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, and `GEOPOLITICAL_POLICY.md`.

---

## Phase 2: Foundational

**Purpose**: Add shared public contracts and core/provider structure that block every user story.

- [x] T005 [P] Add region detail public types in `lib/src/types.ts` for `DetailLevel`, `RegionCoverageStatus`, `DetailLayerStatus`, `RegionCoverageRecord`, `RegionViewport`, `RegionFeatureRecord`, `RegionCollectionRecord`, `DetailProvider`, and `DetailProviderResult`.
- [x] T006 [P] Add a placeholder detail provider state module in `lib/src/detail/providerState.ts` with idle, unavailable, failed, and ready state helpers typed from `lib/src/types.ts`.
- [x] T007 [P] Export the new region detail types from `lib/src/index.tsx` while preserving existing country, zoom, pin, and dispute exports.
- [x] T008 [P] Add optional regions workspace entries and package skeleton in `regions/package.json`, `regions/tsconfig.json`, `regions/tsup.config.ts`, and `regions/src/index.ts`.
- [x] T009 Update root workspace configuration to include the optional regions package in `package.json` and package lock files.
- [x] T010 [P] Add baseline package README source or package documentation placeholder in `regions/README.md`.

**Checkpoint**: Core and optional package boundaries are typed and ready for story implementation.

---

## Phase 3: User Story 1 - Add Region Detail Package (Priority: P1) MVP

**Goal**: Consumers can add an optional region package, inspect starter coverage, and retrieve normalized region records without changing country-only map usage.

**Independent Test**: Install or reference the optional region package, verify coverage metadata and region records for supported countries, and confirm the core country map does not require the package.

### Tests for User Story 1

- [x] T011 [P] [US1] Add optional package export and provider contract tests in `regions/src/__tests__/regions-package.test.ts`.
- [x] T012 [P] [US1] Add region data validation tests for coverage records, unique region ids, parent country matching, non-empty labels, and renderable paths in `regions/src/__tests__/region-data.test.ts`.
- [x] T013 [P] [US1] Add core package compatibility tests proving country-only rendering works without importing the optional regions package in `lib/src/__tests__/WorldMap.test.tsx`.

### Implementation for User Story 1

- [x] T014 [US1] Add starter region coverage metadata in `regions/src/coverage.ts`.
- [x] T015 [US1] Add starter normalized region collections in `regions/src/data/starter.ts`.
- [x] T016 [US1] Implement coverage lookup helpers in `regions/src/coverage.ts`.
- [x] T017 [US1] Implement `createRegionsDetailProvider` in `regions/src/providers/createRegionsDetailProvider.ts`.
- [x] T018 [US1] Export package coverage, collections, helpers, and provider factory from `regions/src/index.ts`.
- [x] T019 [US1] Verify optional package build output and type declarations through `regions/package.json` and `regions/tsup.config.ts`.

**Checkpoint**: User Story 1 is independently functional: the optional package exposes reviewed starter coverage and a core-compatible provider while country-only usage remains unchanged.

---

## Phase 4: User Story 2 - Display Regions When Available (Priority: P2)

**Goal**: The core map can use a provided detail provider to display supported region boundaries, labels, fallback states, and status announcements while preserving country-level behavior when detail is unavailable.

**Independent Test**: Enable region detail with a supported provider, focus a covered country, and verify region boundaries and labels render; then test unavailable and failed provider states fall back to the country view with status.

### Tests for User Story 2

- [x] T020 [P] [US2] Add provider state unit tests for idle, loading, ready, unavailable, failed, and reset transitions in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T021 [P] [US2] Add component tests for rendering supported region boundaries and labels in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T022 [P] [US2] Add component tests for unavailable and failed region provider fallback behavior in `lib/src/__tests__/detail-provider.test.tsx`.
- [x] T023 [P] [US2] Add visible region list accessibility tests in `lib/src/__tests__/visible-region-list.test.tsx`.
- [x] T024 [P] [US2] Add regression tests proving zoom controls, reset, pins, tooltips, custom text labels, and country fallback behavior remain compatible in `lib/src/__tests__/WorldMap.test.tsx` and `lib/src/__tests__/zoom-labels.test.tsx`.

### Implementation for User Story 2

- [x] T025 [US2] Add `detailLevel`, `detailProvider`, and `onDetailStatusChange` props handling in `lib/src/index.tsx`.
- [x] T026 [US2] Implement provider loading and fallback state management in `lib/src/detail/providerState.ts`.
- [x] T027 [US2] Render region boundaries from ready provider collections in `lib/src/index.tsx` using existing SVG region rendering patterns.
- [x] T028 [US2] Add fit-aware region label candidate support in `lib/src/labels/placement.ts`.
- [x] T029 [US2] Render region labels with existing text label behavior in `lib/src/index.tsx` and `lib/src/components/TextLabel.tsx`.
- [x] T030 [US2] Keep consumer pins anchored and visible only when fit rules allow during region detail in `lib/src/index.tsx` and `lib/src/pins/mapPins.ts`.
- [x] T031 [US2] Implement visible region list rendering in `lib/src/components/VisibleRegionList.tsx`.
- [x] T032 [US2] Wire live region detail status announcements and `onDetailStatusChange` callbacks in `lib/src/index.tsx` and `lib/src/components/ZoomStatus.tsx`.
- [x] T033 [US2] Preserve country-level fallback for omitted providers, unsupported countries, loading failures, and reset in `lib/src/index.tsx`.

**Checkpoint**: User Story 2 is independently functional on top of any compatible provider, including safe fallback when region data is unavailable.

---

## Phase 5: User Story 3 - Handle Region Data Quality And Neutrality (Priority: P3)

**Goal**: Region data is reviewed, documented, and validated so maintainers can release and extend coverage responsibly.

**Independent Test**: Review starter coverage metadata, region records, names, boundaries, and neutrality notes; run validation to prove incomplete or sensitive coverage is not presented as complete.

### Tests for User Story 3

- [x] T034 [P] [US3] Add neutrality and coverage metadata validation tests in `regions/src/__tests__/region-data.test.ts`.
- [x] T035 [P] [US3] Add package contents and export smoke tests for the optional regions package in `regions/src/__tests__/regions-package.test.ts`.
- [x] T036 [P] [US3] Add documentation example validation or smoke coverage for region detail setup in `website/src/components/ZoomExample.tsx` and `website/src/pages/examples/zoom.tsx`.

### Implementation for User Story 3

- [x] T037 [US3] Add region coverage limitations and neutrality notes to `regions/src/coverage.ts`.
- [x] T038 [US3] Update map data policy references for starter region coverage in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, and `GEOPOLITICAL_POLICY.md` if any supported region requires case-specific policy handling.
- [x] T039 [US3] Document optional region package installation, provider setup, starter coverage, and fallback states in `docs/api.md`, `docs/examples.md`, and `docs/customization.md`.
- [x] T040 [US3] Add or update region detail examples in `website/src/components/ZoomExample.tsx` and `website/src/pages/examples/zoom.tsx`.
- [x] T041 [US3] Update README source content and regenerate package README output in `README.md`, `lib/README.md`, and `regions/README.md`.
- [x] T042 [US3] Update release notes and release impact for the optional package in `CHANGELOG.md` and `docs/RELEASING.md`.

**Checkpoint**: User Story 3 is independently verifiable through data validation, documented coverage, and release-ready package/documentation surfaces.

---

## Phase 6: Polish And Cross-Cutting Concerns

**Purpose**: Validate package outputs, quality gates, and release readiness across core and optional packages.

- [x] T043 [P] Verify package export surfaces and package contents in `lib/package.json` and `regions/package.json`.
- [x] T044 [P] Verify optional regions package does not become a runtime dependency of the core package in `lib/package.json`, `regions/package.json`, and generated package output.
- [x] T045 Run `yarn lint` from `package.json`.
- [x] T046 Run `yarn format-check` from `package.json`.
- [x] T047 Run `yarn typecheck` from `package.json`.
- [x] T048 Run `yarn spellcheck` from `package.json`.
- [x] T049 Run `yarn test:coverage` from `package.json` and confirm coverage remains above the project threshold.
- [x] T050 Run `yarn build` from `package.json`.
- [x] T051 Run `yarn generate:readme` from `package.json` and confirm README files are synchronized.
- [x] T052 Run `npm pack --dry-run ./lib` and verify core package contents.
- [x] T053 Run `npm pack --dry-run ./regions` and verify optional regions package contents.
- [x] T054 Run quickstart validation from `specs/003-regions-package/quickstart.md`.

---

## Phase 7: Clarification Follow-Up - Zoom With Regions Example

**Purpose**: Apply the 2026-05-02 clarification for the website zoom example without reopening the broader regions package scope.

- [x] T055 [P] [US2] Rename visible zoom example references to "Zoom with regions" in `website/docusaurus.config.js`, `website/src/pages/examples/zoom.tsx`, `docs/api.md`, and `docs/examples.md`.
- [x] T056 [US2] Add independent capital-city and region-detail controls to `website/src/components/ZoomExample.tsx`.
- [x] T057 [US2] Use an XL canvas and default region details on with capital city overlay off in `website/src/components/ZoomExample.tsx`.
- [x] T058 [P] [US2] Add compact example controls styling in `website/src/components/ZoomExample.module.css`.
- [x] T059 Run focused validation for the zoom example with `yarn typecheck` and relevant source inspection.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; delivers the MVP optional package.
- **Phase 4 US2**: Depends on Phase 2 and can use a test provider, but full optional-package demo depends on US1.
- **Phase 5 US3**: Depends on US1 data surfaces and US2 behavior surfaces.
- **Phase 6 Polish**: Depends on all desired user stories being complete.
- **Phase 7 Clarification Follow-Up**: Depends on the completed US2/US3 website example surfaces and can be implemented independently of package data changes.

### User Story Dependencies

- **US1 Add Region Detail Package**: Starts after foundation; no dependency on core rendering beyond shared types.
- **US2 Display Regions When Available**: Starts after foundation; can be tested with inline providers, then integrated with US1 provider.
- **US3 Data Quality And Neutrality**: Depends on starter data and release surfaces from US1 and US2.

### Parallel Opportunities

- T002-T004 can run in parallel.
- T005-T008 and T010 can run in parallel after setup review.
- T011-T013 can run in parallel before T014-T019.
- T020-T024 can run in parallel before T025-T033.
- T034-T036 can run in parallel before T037-T042.
- T043-T044 can run in parallel with validation commands after implementation.
- T055 and T058 can run in parallel before final validation.

## Parallel Example: User Story 1

```text
Task: "Add optional package export and provider contract tests in regions/src/__tests__/regions-package.test.ts"
Task: "Add region data validation tests for coverage records, unique region ids, parent country matching, non-empty labels, and renderable paths in regions/src/__tests__/region-data.test.ts"
Task: "Add core package compatibility tests proving country-only rendering works without importing the optional regions package in lib/src/__tests__/WorldMap.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Add provider state unit tests for idle, loading, ready, unavailable, failed, and reset transitions in lib/src/__tests__/detail-provider.test.tsx"
Task: "Add visible region list accessibility tests in lib/src/__tests__/visible-region-list.test.tsx"
Task: "Add regression tests proving zoom controls, reset, pins, tooltips, custom text labels, and country fallback behavior remain compatible in lib/src/__tests__/WorldMap.test.tsx and lib/src/__tests__/zoom-labels.test.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 to deliver the optional regions package and provider helper.
3. Stop and validate package coverage metadata, starter region records, and core country-only compatibility.

### Incremental Delivery

1. Add core provider/fallback rendering from User Story 2 after the optional package is usable.
2. Add region list, labels, pins, and status integration without changing default country-only behavior.
3. Complete data quality, neutrality, documentation, examples, and release notes in User Story 3.
4. Run full validation and package smoke checks.

### Parallel Team Strategy

1. One developer owns optional package data and provider files under `regions/`.
2. One developer owns core detail provider state and rendering files under `lib/src/`.
3. One developer owns docs, website examples, neutrality review, and release artifacts.

## Notes

- Tests should be written before implementation for code-bearing tasks.
- Do not make the core package depend on the optional regions package at runtime.
- Treat region names and boundaries as map-data changes requiring review.
- Keep unsupported countries on a stable country-level fallback path.
