# Tasks: Smooth Zoom Performance

**Input**: Design documents from `/specs/005-smooth-zoom-performance/` **Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Code-bearing changes MUST include tests because the constitution and plan require measurable behavior, coverage above threshold, and performance regression protection.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the branch context and baseline files before implementation.

- [x] T001 Confirm the active branch, feature pointer, and clean working assumptions using `git status --short --branch` and `.specify/feature.json`
- [x] T002 [P] Review current zoom rendering flow in `lib/src/index.tsx`, `lib/src/zoom/state.ts`, and `lib/src/zoom/geometry.ts`
- [x] T003 [P] Review current zoom behavior tests in `lib/src/__tests__/zoom-controls.test.tsx`, `lib/src/__tests__/zoom-interaction.test.tsx`, `lib/src/__tests__/zoom-state.test.ts`, and `lib/src/__tests__/zoom-labels.test.tsx`
- [x] T004 [P] Review current geometry/detail tier behavior in `lib/src/map-data/geometry-tiers.ts`, `lib/src/__tests__/geometry-tiers.test.ts`, and `regions/src/providers/createRegionsDetailProvider.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared measurement and state primitives that every user story depends on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create reusable zoom performance scenario helpers in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T006 Add failing baseline tests for click-to-visible-feedback, click-to-visible-completion, and rapid repeated clicks in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T007 [P] Add test fixtures for representative full-world, detailed-label, pin, and optional-region states in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T008 [P] Add state-level assertions for latest-request-wins zoom behavior in `lib/src/__tests__/zoom-state.test.ts`
- [x] T009 Define internal zoom phase/state types for requested, immediate-feedback, secondary-detail-settling, and complete states in `lib/src/zoom/state.ts`
- [x] T010 Run focused baseline tests for `lib/src/__tests__/zoom-performance.test.tsx` and `lib/src/__tests__/zoom-state.test.ts` with `yarn workspace react-svg-worldmap test zoom-performance.test.tsx zoom-state.test.ts`

**Checkpoint**: Foundation ready - performance tests exist, expected failures are known, and user story implementation can begin.

---

## Phase 3: User Story 1 - Zoom Feels Immediate (Priority: P1) MVP

**Goal**: Zoom-control clicks produce visible feedback within 250 ms in typical representative cases and complete visible updates within 500 ms.

**Independent Test**: Repeatedly click zoom in/out in the representative full-world and detailed scenarios and verify click-to-visible-feedback, click-to-visible-completion, and final zoom state.

### Tests for User Story 1

- [x] T011 [P] [US1] Add zoom-in immediate-feedback expectations for full-world view in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T012 [P] [US1] Add zoom-out immediate-feedback expectations for detailed view in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T013 [P] [US1] Add repeated-click final-state expectations in `lib/src/__tests__/zoom-controls.test.tsx`

### Implementation for User Story 1

- [x] T014 [US1] Split immediate zoom request state from expensive rendered-detail state in `lib/src/zoom/state.ts`
- [x] T015 [US1] Apply immediate transform feedback before secondary detail recomputation in `lib/src/index.tsx`
- [x] T016 [US1] Preserve zoom-control semantics and reset behavior while using the new zoom phases in `lib/src/components/ZoomControls.tsx`
- [x] T017 [US1] Ensure rapid repeated zoom clicks keep the latest requested target in `lib/src/zoom/state.ts`
- [x] T018 [US1] Update zoom interaction tests for immediate-feedback and final-state behavior in `lib/src/__tests__/zoom-interaction.test.tsx`
- [x] T019 [US1] Run focused US1 validation for `lib/src/__tests__/zoom-performance.test.tsx`, `lib/src/__tests__/zoom-controls.test.tsx`, `lib/src/__tests__/zoom-interaction.test.tsx`, and `lib/src/__tests__/zoom-state.test.ts`

**Checkpoint**: User Story 1 is independently functional and measurable as the MVP.

---

## Phase 4: User Story 2 - Progressive Detail Does Not Block Navigation (Priority: P2)

**Goal**: Labels, detailed country shapes, region overlays, and pins do not block the first visible zoom response.

**Independent Test**: Zoom across detail thresholds with labels, pins, and optional region detail available; verify core movement stays within target timing and final detail is correct.

### Tests for User Story 2

- [x] T020 [P] [US2] Add detailed-geometry threshold performance expectations in `lib/src/__tests__/geometry-tiers.test.ts`
- [x] T021 [P] [US2] Add label and pin progressive-detail expectations in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T022 [P] [US2] Add optional region progressive-detail expectations in `lib/src/__tests__/detail-provider.test.tsx`
- [x] T023 [P] [US2] Add accessibility and hover identity regression coverage for deferred detail in `lib/src/__tests__/country-hit-targets.test.tsx`

### Implementation for User Story 2

- [x] T024 [US2] Memoize or reuse unchanged projected country geometry across zoom updates in `lib/src/index.tsx`
- [x] T025 [US2] Keep reduced and detailed geometry tier selection from blocking immediate feedback in `lib/src/map-data/geometry-tiers.ts`
- [x] T026 [US2] Defer label placement recomputation until after immediate zoom feedback in `lib/src/labels/placement.ts`
- [x] T027 [US2] Defer pin projection updates until after immediate zoom feedback in `lib/src/pins/mapPins.ts`
- [x] T028 [US2] Defer optional region overlay work without changing provider behavior in `lib/src/index.tsx`
- [x] T029 [US2] Preserve final rendered layer order and interaction target identity after deferred detail settles in `lib/src/index.tsx`
- [x] T030 [US2] Run focused US2 validation for `lib/src/__tests__/zoom-performance.test.tsx`, `lib/src/__tests__/geometry-tiers.test.ts`, `lib/src/__tests__/detail-provider.test.tsx`, `lib/src/__tests__/zoom-labels.test.tsx`, and `lib/src/__tests__/country-hit-targets.test.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently, and secondary detail no longer delays the first visible zoom response.

---

## Phase 5: User Story 3 - Performance Is Measured And Regressions Are Caught (Priority: P3)

**Goal**: Maintainers can run repeatable zoom responsiveness checks and see clear pass/fail results for the 250 ms and 500 ms targets.

**Independent Test**: Run the documented performance scenario and confirm the report includes scenario name, sample count, typical feedback timing, maximum completion timing, and pass/fail status.

### Tests for User Story 3

- [x] T031 [P] [US3] Add pass/fail report shape assertions in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T032 [P] [US3] Add regression failure message assertions for missed timing targets in `lib/src/__tests__/zoom-performance.test.tsx`

### Implementation for User Story 3

- [x] T033 [US3] Add a reusable zoom responsiveness report helper in `lib/src/__tests__/zoom-performance.test.tsx`
- [x] T034 [US3] Document focused performance validation commands in `specs/005-smooth-zoom-performance/quickstart.md`
- [x] T035 [US3] Document representative scenario limits and escalation criteria in `docs/examples.md`
- [x] T036 [US3] Update public API/performance notes in `docs/api.md` and `docs/customization.md`
- [x] T037 [US3] Regenerate package README content with `yarn generate:readme` and verify `README.md` and `lib/README.md`
- [x] T038 [US3] Run focused US3 validation for `lib/src/__tests__/zoom-performance.test.tsx` and `website/package.json`

**Checkpoint**: All user stories are independently functional and documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature and handle release/documentation hygiene.

- [x] T039 [P] Run `yarn workspace react-svg-worldmap test` from `lib/package.json` for full package unit coverage
- [x] T040 [P] Run `yarn workspace @react-svg-worldmap/regions test` from `regions/package.json` to confirm optional region package behavior remains intact
- [x] T041 [P] Run `yarn typecheck` from `package.json` for website and package type integration
- [x] T042 Run `yarn lint` from `package.json` and fix any warnings in touched files
- [x] T043 Run `yarn format-check` from `package.json` and format touched files if needed
- [x] T044 Run `yarn spellcheck` from `package.json` and add only legitimate project/domain words to `project-words.txt` or `.cspell.json`
- [x] T045 Run `yarn test:coverage` from `package.json` and confirm line, function, branch, and statement coverage stay above 80%
- [x] T046 Run `yarn build` from `package.json` to verify package, regions, and website builds
- [x] T047 Run `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib` and verify `lib/package.json` package contents remain expected
- [x] T048 Update `CHANGELOG.md` with user-visible zoom performance and validation notes
- [x] T049 Run a geopolitical neutrality review and confirm no map data, country names, territory names, boundaries, codes, disputed areas, or policy overrides changed in `docs/map-data-policy.md` and `docs/map-data-overrides.json`
- [x] T050 Update `specs/005-smooth-zoom-performance/tasks.md` task checkboxes as implementation proceeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow US1 for clean integration with immediate zoom phases.
- **User Story 3 (Phase 5)**: Depends on Foundational and can begin after the performance helper shape exists; final documentation should wait for US1/US2 results.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 - Zoom Feels Immediate**: Can start after Foundational; no dependency on US2 or US3.
- **US2 - Progressive Detail Does Not Block Navigation**: Can start after Foundational, but should integrate after US1 state phases are in place.
- **US3 - Performance Is Measured And Regressions Are Caught**: Can start after Foundational; documentation tasks depend on final US1/US2 behavior.

### Within Each User Story

- Write or update tests first and confirm they fail for the intended behavior before implementation.
- State/model helpers before renderer integration.
- Renderer integration before documentation.
- Focused validation before marking a story complete.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel during setup.
- T007 and T008 can run in parallel after T005/T006 define the measurement shape.
- US1 test tasks T011, T012, and T013 can run in parallel.
- US2 test tasks T020, T021, T022, and T023 can run in parallel.
- US3 test tasks T031 and T032 can run in parallel.
- Polish validations T039, T040, and T041 can run in parallel once implementation is complete.

---

## Parallel Example: User Story 1

```bash
Task: "T011 [US1] Add zoom-in immediate-feedback expectations for full-world view in lib/src/__tests__/zoom-performance.test.tsx"
Task: "T012 [US1] Add zoom-out immediate-feedback expectations for detailed view in lib/src/__tests__/zoom-performance.test.tsx"
Task: "T013 [US1] Add repeated-click final-state expectations in lib/src/__tests__/zoom-controls.test.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T020 [US2] Add detailed-geometry threshold performance expectations in lib/src/__tests__/geometry-tiers.test.ts"
Task: "T021 [US2] Add label and pin progressive-detail expectations in lib/src/__tests__/zoom-performance.test.tsx"
Task: "T022 [US2] Add optional region progressive-detail expectations in lib/src/__tests__/detail-provider.test.tsx"
Task: "T023 [US2] Add accessibility and hover identity regression coverage for deferred detail in lib/src/__tests__/country-hit-targets.test.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "T031 [US3] Add pass/fail report shape assertions in lib/src/__tests__/zoom-performance.test.tsx"
Task: "T032 [US3] Add regression failure message assertions for missed timing targets in lib/src/__tests__/zoom-performance.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate US1 with the focused command in T019.
5. Demo zoom-control clicks showing immediate feedback and correct final state.

### Incremental Delivery

1. Foundation ready: performance harness and zoom phase model exist.
2. US1: immediate zoom response and rapid-click correctness.
3. US2: progressive detail staging for geometry, labels, pins, and regions.
4. US3: durable reporting, docs, and regression checks.
5. Polish: full repo validation, packaging, changelog, and neutrality review.

### Escalation Strategy

1. Do not implement a separate canvas/WebGL renderer or tile-like data architecture during US1 or US2.
2. If T019 and T030 still miss 250 ms typical or 500 ms maximum after progressive SVG optimization and perceptual motion, document measured failures in `specs/005-smooth-zoom-performance/research.md`.
3. Create a follow-up clarification or plan update before adding a high-performance renderer or tile-like architecture.

## Notes

- [P] tasks use different files or can be safely executed before implementation convergence.
- [US1], [US2], and [US3] labels map directly to spec user stories.
- Each story has an independent validation command.
- Commit after each completed phase or logical group.
- Keep the SVG renderer, public API, accessibility behavior, and package dependency profile stable unless benchmark-driven escalation is explicitly approved.
