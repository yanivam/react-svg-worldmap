# Tasks: Shared Core Map Assets

**Input**: Design documents from `/specs/006-shared-map-assets/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/public-api.md, quickstart.md

**Tests**: Code-bearing changes must include tests. Package artifact changes must include pack inspection and import/require smoke validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks
- **[Story]**: User story label for story phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish baselines and release-surface inspection helpers before changing package output.

- [x] T001 Record current core package packed size, unpacked size, file count, largest files, and `sourceMappingURL` status in specs/006-shared-map-assets/release-readiness.md
- [x] T002 [P] Record current zoom responsiveness and detailed-geometry loading observations from the existing test suite in specs/006-shared-map-assets/release-readiness.md
- [x] T003 [P] Add a package artifact inspection script for core file list, large files, duplicate topology payload hints, and source-map references in lib/scripts/inspect-package-artifacts.mjs
- [x] T004 Add a root script entry for running the core artifact inspection helper in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared asset strategy and smoke-test harness that all stories depend on.

**Critical**: No user story work should begin until this phase is complete.

- [x] T005 Define the chosen package-internal country topology asset format, published paths, and ESM/CJS loading strategy in specs/006-shared-map-assets/release-readiness.md
- [x] T006 Add shared asset generation or copy support for reduced and detailed country topology assets in lib/scripts/build-shared-map-assets.mjs
- [x] T007 Wire the shared asset build step into the core package build flow in lib/package.json
- [x] T008 Update the core package files allowlist so shared country topology assets are published from lib/package.json
- [x] T009 [P] Extend ESM smoke coverage to assert default import, named export, and country asset availability in lib/scripts/smoke-esm.mjs
- [x] T010 [P] Extend CommonJS smoke coverage to assert require compatibility and country asset availability in lib/scripts/smoke-cjs.cjs
- [x] T011 [P] Add package inspection expectations for size budgets, shared asset presence, and missing source-map references in lib/scripts/inspect-package-artifacts.mjs
- [x] T012 Run the setup and foundational checks and record pass/fail status in specs/006-shared-map-assets/release-readiness.md

**Checkpoint**: Shared asset format, package metadata, and smoke harness are ready.

---

## Phase 3: User Story 1 - Smaller Core Package Without New Required Packages (Priority: P1) MVP

**Goal**: Country-level maps still work from the core package alone while large topology payloads are no longer duplicated unnecessarily across public ESM and CJS entry bundles.

**Independent Test**: Build and pack `./lib`, confirm country topology assets are inside `react-svg-worldmap`, confirm core packed size is `<= 1.2 MB`, unpacked size is `<= 7.875 MB`, and confirm country-only rendering plus import/require smoke tests pass.

### Tests for User Story 1

- [x] T013 [P] [US1] Add package-only country rendering coverage that does not depend on `@react-svg-worldmap/regions` in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T014 [P] [US1] Add geometry tier tests for reduced and detailed shared asset loading, parse guards, and diagnosable failure behavior in `lib/src/__tests__/geometry-tiers.test.ts`
- [x] T015 [P] [US1] Add package artifact tests or script assertions for non-duplicated country topology payloads in lib/scripts/inspect-package-artifacts.mjs

### Implementation for User Story 1

- [x] T016 [US1] Refactor reduced country topology loading to read from the shared package-internal asset path in lib/src/map-data/geometry-tiers.ts
- [x] T017 [US1] Refactor detailed country topology lazy loading to read from the shared package-internal asset path in lib/src/map-data/geometry-tiers.ts
- [x] T018 [US1] Remove direct public-entry bundle imports of large topology payloads while preserving metadata and types in lib/src/countries-reduced.topo.ts
- [x] T019 [US1] Remove direct public-entry bundle imports of large topology payloads while preserving metadata and types in lib/src/countries-detailed.topo.ts
- [x] T020 [US1] Update TypeScript declarations or ambient module declarations for the shared topology assets in lib/src/types.ts
- [x] T021 [US1] Ensure built ESM and CJS outputs resolve the same shared asset files without new public import requirements in lib/tsup.config.ts
- [x] T022 [US1] Validate country-only rendering, import/require smoke checks, and core package size budgets, then update specs/006-shared-map-assets/release-readiness.md

**Checkpoint**: User Story 1 is independently functional and shippable as the MVP increment if size and compatibility gates pass.

---

## Phase 4: User Story 2 - Clear Published Source Map Policy (Priority: P2)

**Goal**: Published JavaScript does not reference missing source maps, and the package has an explicit source-map release policy.

**Independent Test**: Build and pack `./lib`, inspect packed JavaScript files, and confirm either all referenced `.map` files are published intentionally or no published JavaScript references absent `.map` files.

### Tests for User Story 2

- [x] T023 [P] [US2] Add source-map policy assertions to the artifact inspection script in lib/scripts/inspect-package-artifacts.mjs
- [x] T024 [P] [US2] Add build-output source-map inspection coverage for `dist/index.js` and `dist/index.cjs` in lib/scripts/smoke-esm.mjs

### Implementation for User Story 2

- [x] T025 [US2] Update tsup or post-build configuration so published core JavaScript does not reference unpublished source maps in lib/tsup.config.ts
- [x] T026 [US2] Replace or remove obsolete source-map inlining behavior according to the selected release policy in lib/scripts/inline-sourcemaps.cjs
- [x] T027 [US2] Update the core build script to enforce the source-map policy during every package build in lib/package.json
- [x] T028 [US2] Document the source-map policy and debugging tradeoff in docs/RELEASING.md
- [x] T029 [US2] Validate packed JavaScript source-map references and update specs/006-shared-map-assets/release-readiness.md

**Checkpoint**: User Stories 1 and 2 both work independently and published core artifacts are source-map warning free.

---

## Phase 5: User Story 3 - Risk And Performance Understanding Before Shipping (Priority: P3)

**Goal**: Maintainers can decide whether the artifact-layout change is shippable based on package size, compatibility, performance, and risk evidence.

**Independent Test**: Review the release-readiness report and confirm it records before/after package sizes, compatibility results, rendering behavior, performance observations, risks, mitigations, and semantic-version recommendation.

### Tests for User Story 3

- [x] T030 [P] [US3] Add or update zoom responsiveness checks for shared detailed-geometry loading in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T031 [P] [US3] Add optional region rendering regression coverage after shared core asset loading in `lib/src/__tests__/Region.test.tsx`
- [x] T032 [P] [US3] Add website example build expectations for the release-shape package import in website/src/pages/examples/zoom.tsx

### Implementation for User Story 3

- [x] T033 [US3] Run focused validation commands from specs/006-shared-map-assets/quickstart.md and record results in specs/006-shared-map-assets/release-readiness.md
- [x] T034 [US3] Run full pre-release validation commands from specs/006-shared-map-assets/quickstart.md and record results in specs/006-shared-map-assets/release-readiness.md
- [x] T035 [US3] Document consumer module compatibility, map asset loading, source-map/debugging, startup, zoom, and package-manager risks in specs/006-shared-map-assets/release-readiness.md
- [x] T036 [US3] Update consumer-facing package-size and compatibility notes in docs/api.md
- [x] T037 [US3] Update example or migration documentation for country data remaining in core and regions remaining optional in docs/examples.md
- [x] T038 [US3] Add semantic-version and release-note recommendation for this artifact change in specs/006-shared-map-assets/release-readiness.md

**Checkpoint**: All user stories are independently functional and release readiness is documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, generated docs, and quality gates across all user stories.

- [x] T039 [P] Regenerate package README content after documentation changes in lib/README.md
- [x] T040 [P] Run formatting and apply any required formatting fixes in specs/006-shared-map-assets/tasks.md
- [x] T041 Verify no package, build, lint, typecheck, dependency, Browserslist, source-map, or runtime warnings are hidden by updating specs/006-shared-map-assets/release-readiness.md
- [x] T042 Run a geopolitical neutrality review confirming no map geometry, names, codes, disputed areas, or boundaries changed in specs/006-shared-map-assets/release-readiness.md
- [x] T043 Run final package dry-runs for core and regions and record packed/unpacked sizes in specs/006-shared-map-assets/release-readiness.md
- [x] T044 Run final git diff review for public API, package contents, docs, and generated files in specs/006-shared-map-assets/release-readiness.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion and provides the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion; can run after or alongside User Story 1, but final source-map validation should use the package shape from User Story 1.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 for complete release-readiness evidence.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories after Foundational; delivers the package-size and backward-compatibility MVP.
- **User Story 2 (P2)**: Can start after Foundational, but final validation should run after User Story 1 changes are built.
- **User Story 3 (P3)**: Requires User Stories 1 and 2 to provide final compatibility, source-map, size, and performance evidence.

### Within Each User Story

- Tests and inspection assertions should be added before implementation changes.
- Shared asset generation and package metadata must be complete before loader refactors.
- Loader refactors must be complete before package size validation.
- Source-map policy enforcement must be complete before consumer warning validation.
- Release-readiness documentation must be updated after each validation pass.

## Parallel Opportunities

- T002 and T003 can run in parallel with T001.
- T009, T010, and T011 can run in parallel after T005.
- T013, T014, and T015 can run in parallel before User Story 1 implementation.
- T023 and T024 can run in parallel before User Story 2 implementation.
- T030, T031, and T032 can run in parallel before User Story 3 validation.
- T039 and T040 can run in parallel during final polish.

## Parallel Example: User Story 1

```bash
Task: "T013 [P] [US1] Add package-only country rendering coverage that does not depend on @react-svg-worldmap/regions in lib/src/__tests__/WorldMap.test.tsx"
Task: "T014 [P] [US1] Add geometry tier tests for reduced and detailed shared asset loading, parse guards, and diagnosable failure behavior in lib/src/__tests__/geometry-tiers.test.ts"
Task: "T015 [P] [US1] Add package artifact tests or script assertions for non-duplicated country topology payloads in lib/scripts/inspect-package-artifacts.mjs"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [P] [US2] Add source-map policy assertions to the artifact inspection script in lib/scripts/inspect-package-artifacts.mjs"
Task: "T024 [P] [US2] Add build-output source-map inspection coverage for dist/index.js and dist/index.cjs in lib/scripts/smoke-esm.mjs"
```

## Parallel Example: User Story 3

```bash
Task: "T030 [P] [US3] Add or update zoom responsiveness checks for shared detailed-geometry loading in lib/src/__tests__/zoom-performance.test.tsx"
Task: "T031 [P] [US3] Add optional region rendering regression coverage after shared core asset loading in lib/src/__tests__/Region.test.tsx"
Task: "T032 [P] [US3] Add website example build expectations for the release-shape package import in website/src/pages/examples/zoom.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1.
3. Stop and validate core-only rendering, import/require smoke tests, and package size budgets.
4. Decide whether the shared asset strategy is viable before source-map and release-readiness polish.

### Incremental Delivery

1. User Story 1 reduces package duplication while preserving core-only country maps.
2. User Story 2 makes published source-map behavior warning-free.
3. User Story 3 documents shippability, performance, risks, and release impact.
4. Polish runs full quality gates and generated documentation checks.

### Multiple Developer Strategy

After Foundational completion:

- Developer A can implement User Story 1 loader and package-size work.
- Developer B can implement User Story 2 source-map policy enforcement.
- Developer C can prepare User Story 3 performance, website, and release-readiness validation.

## Notes

- Avoid creating a new country-map package.
- Keep `@react-svg-worldmap/regions` optional.
- Do not change map geometry content unless the change is reviewed against `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- Every release-readiness claim should include the command or inspection that produced it.
