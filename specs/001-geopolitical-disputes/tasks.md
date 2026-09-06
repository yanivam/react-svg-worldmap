# Tasks: Neutral Geopolitical Disputes

**Input**: Design documents from `specs/001-geopolitical-disputes/` **Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), [quickstart.md](./quickstart.md)

**Tests**: Required for code-bearing changes. Coverage must remain above the project threshold.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks
- **[Story]**: User story label for story-specific phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the package and documentation surfaces for the Tier 1 dispute work.

- [x] T001 Review existing map policy and override conventions in `docs/map-data-policy.md` and `docs/map-data-overrides.json`
- [x] T002 Review current package render context and export surface in `lib/src/types.ts` and `lib/src/index.tsx`
- [x] T003 [P] Review README generation behavior in `lib/scripts/generate-readme.mjs`
- [x] T004 [P] Review current package tests in `lib/src/__tests__/WorldMap.test.tsx` and `lib/src/__tests__/Region.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared types and metadata foundation needed by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Define dispute-related public types in `lib/src/types.ts`
- [x] T006 Create Tier 1 dispute metadata module skeleton in `lib/src/disputes.ts`
- [x] T007 Export dispute types and metadata placeholders from `lib/src/index.tsx`
- [x] T008 [P] Add metadata completeness tests for the six required Tier 1 dispute ids in `lib/src/__tests__/disputes.test.ts`
- [x] T009 [P] Add public export type tests or assertions for dispute exports in `lib/src/__tests__/disputes.test.ts`

**Checkpoint**: Shared metadata types and exports exist, and tests can drive story implementation.

---

## Phase 3: User Story 1 - Understand The Project's Geopolitical Position (Priority: P1) MVP

**Goal**: Users and contributors can understand the project's neutral geopolitical policy and reject non-credible claims using documented criteria.

**Independent Test**: Review the public policy and verify that a reader can determine baseline sources, dispute criteria, rejection criteria, and representation rules without asking a maintainer.

### Tests for User Story 1

- [x] T010 [P] [US1] Add policy text assertions for Tier 1 scope and cutoff criteria in `lib/src/__tests__/mapDataPolicy.test.ts`
- [x] T011 [P] [US1] Add override register assertions for required governance fields in `lib/src/__tests__/mapDataPolicy.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Update neutrality goals, cutoff criteria, and rejected-claim rules in `docs/map-data-policy.md`
- [x] T013 [US1] Add Tier 1, Tier 2, and Tier 3 scope language to `docs/map-data-policy.md`
- [x] T014 [US1] Expand Tier 1 case records and notes in `docs/map-data-overrides.json`
- [x] T015 [US1] Document contributor evidence expectations for geopolitical proposals in `docs/map-data-policy.md`
- [x] T016 [US1] Run and fix policy-focused tests in `lib/src/__tests__/mapDataPolicy.test.ts`

**Checkpoint**: User Story 1 is complete when the public policy explains the neutral position, Tier 1 scope, cutoff rule, and rejection rules.

---

## Phase 4: User Story 2 - Represent Credible Disputes Transparently (Priority: P2)

**Goal**: Consumers can identify and render Tier 1 disputes with metadata and neutral display guidance.

**Independent Test**: Select a Tier 1 dispute and verify that package data exposes classification, parties, rationale, display guidance, and optional render context metadata that differs from ordinary undisputed regions.

### Tests for User Story 2

- [x] T017 [P] [US2] Add tests for every Tier 1 dispute record and required fields in `lib/src/__tests__/disputes.test.ts`
- [x] T018 [P] [US2] Add render context tests for dispute metadata in `lib/src/__tests__/WorldMap.test.tsx`
- [x] T019 [P] [US2] Add default-rendering compatibility tests for consumers that ignore dispute metadata in `lib/src/__tests__/WorldMap.test.tsx`

### Implementation for User Story 2

- [x] T020 [US2] Implement full Tier 1 dispute records in `lib/src/disputes.ts`
- [x] T021 [US2] Add territory-code or region-code lookup helpers in `lib/src/disputes.ts`
- [x] T022 [US2] Extend `CountryContext` with optional dispute metadata in `lib/src/types.ts`
- [x] T023 [US2] Attach dispute metadata to region contexts in `lib/src/index.tsx`
- [x] T024 [US2] Preserve existing tooltip, title, href, click, and style callback behavior in `lib/src/index.tsx`
- [x] T025 [US2] Export finalized dispute metadata and helper APIs from `lib/src/index.tsx`
- [x] T026 [US2] Run and fix dispute metadata and render tests in `lib/src/__tests__/disputes.test.ts` and `lib/src/__tests__/WorldMap.test.tsx`

**Checkpoint**: User Story 2 is complete when consumers can opt into dispute-aware rendering while ordinary map usage remains compatible.

---

## Phase 5: User Story 3 - Review Geopolitical Contributions Consistently (Priority: P3)

**Goal**: Maintainers can evaluate geopolitical issues and pull requests with repeatable documented outcomes.

**Independent Test**: Evaluate sample credible and fringe proposals against the contribution rules and confirm maintainers reach accept, request evidence, redirect, reject, or defer outcomes with documented reasoning.

### Tests for User Story 3

- [x] T027 [P] [US3] Add proposal review outcome tests for credible, deferred, and fringe examples in `lib/src/__tests__/mapDataPolicy.test.ts`
- [x] T028 [P] [US3] Add documentation checks for review outcomes and contributor requirements in `lib/src/__tests__/mapDataPolicy.test.ts`

### Implementation for User Story 3

- [x] T029 [US3] Add geopolitical proposal review outcomes to `docs/map-data-policy.md`
- [x] T030 [US3] Add examples for accepted Tier 1, deferred Tier 2 or Tier 3, and rejected fringe claims in `docs/map-data-policy.md`
- [x] T031 [US3] Add maintainer-review status values to relevant records in `docs/map-data-overrides.json`
- [x] T032 [US3] Update issue or contribution guidance references in `.github/ISSUE_TEMPLATE/feature_request.md`
- [x] T033 [US3] Run and fix proposal review tests in `lib/src/__tests__/mapDataPolicy.test.ts`

**Checkpoint**: User Story 3 is complete when geopolitical contribution decisions can be made from documented criteria and examples.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final package documentation, release integrity, and validation.

- [x] T034 [P] Update package API documentation for dispute exports in `README.md`
- [x] T035 [P] Update library README source or generated content path used by `lib/scripts/generate-readme.mjs`
- [x] T036 Add consumer example for dispute-aware styling and tooltips in `docs/examples.md`
- [x] T037 Add a changeset describing the public API and map-policy impact in `.changeset/geopolitical-disputes.md`
- [x] T038 Run README generation and review generated changes in `lib/README.md`
- [x] T039 Run `yarn lint` from repository root using scripts in `package.json`
- [x] T040 Run `yarn format-check` from repository root using scripts in `package.json`
- [x] T041 Run `yarn typecheck` from repository root using scripts in `package.json`
- [x] T042 Run `yarn spellcheck` from repository root using scripts in `package.json`
- [x] T043 Run `yarn test:coverage` from repository root using scripts in `package.json` and confirm thresholds remain above 80%
- [x] T044 Run `yarn build` from repository root using scripts in `package.json`
- [x] T045 Run `npm pack --dry-run ./lib` from repository root and review package files from `lib/package.json`
- [x] T046 Perform final geopolitical neutrality review against `docs/map-data-policy.md` and `docs/map-data-overrides.json`
- [x] T047 Verify quickstart scenarios in `specs/001-geopolitical-disputes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can start in parallel with User Story 1 after shared types exist, but final docs should align with US1 policy wording.
- **User Story 3 (Phase 5)**: Depends on Foundational; can start in parallel with User Story 1, but should reuse final cutoff terms from US1.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependencies

- **US1**: No dependency on other user stories.
- **US2**: No hard dependency on US1 for code, but metadata wording must remain consistent with US1 policy.
- **US3**: No hard dependency on US2, but examples should reference the final Tier 1 and deferred-tier terminology.

### Parallel Opportunities

- T003 and T004 can run in parallel during setup.
- T008 and T009 can run in parallel after T005 through T007.
- US1 tests T010 and T011 can run in parallel.
- US2 tests T017, T018, and T019 can run in parallel.
- US3 tests T027 and T028 can run in parallel.
- Documentation polish tasks T034 and T035 can run in parallel before README generation.

## Parallel Example: User Story 1

```text
Task: "T010 [P] [US1] Add policy text assertions for Tier 1 scope and cutoff criteria in lib/src/__tests__/mapDataPolicy.test.ts"
Task: "T011 [P] [US1] Add override register assertions for required governance fields in lib/src/__tests__/mapDataPolicy.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T017 [P] [US2] Add tests for every Tier 1 dispute record and required fields in lib/src/__tests__/disputes.test.ts"
Task: "T018 [P] [US2] Add render context tests for dispute metadata in lib/src/__tests__/WorldMap.test.tsx"
Task: "T019 [P] [US2] Add default-rendering compatibility tests for consumers that ignore dispute metadata in lib/src/__tests__/WorldMap.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T027 [P] [US3] Add proposal review outcome tests for credible, deferred, and fringe examples in lib/src/__tests__/mapDataPolicy.test.ts"
Task: "T028 [P] [US3] Add documentation checks for review outcomes and contributor requirements in lib/src/__tests__/mapDataPolicy.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate policy documentation and override governance tests.
4. Stop if needed; the project now has a public neutral policy and cutoff rule.

### Incremental Delivery

1. Deliver US1 policy and governance.
2. Add US2 package metadata and render context support.
3. Add US3 contributor review workflow and examples.
4. Finish polish, documentation, release, and package validation.

### Notes

- Keep tests ahead of implementation for code-bearing tasks.
- Preserve ordinary rendering unless consumers opt into dispute metadata.
- Do not add Tier 2 or Tier 3 active records in this feature.
- Do not add localized map variants in this feature.
- Avoid precise disputed-boundary geometry changes unless a task explicitly adds a reviewed policy and test update.
