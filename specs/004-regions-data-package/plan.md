# Implementation Plan: Optional Regions Data Package

**Branch**: `004-regions-data-package` | **Date**: 2026-05-02 | **Spec**: `specs/004-regions-data-package/spec.md`  
**Input**: Feature specification from `/specs/004-regions-data-package/spec.md`

## Summary

Deliver first-level local government region boundaries through the optional `@react-svg-worldmap/regions` package while preserving the default country-only core package behavior. The implementation must provide region data and coverage metadata for the exact 23-country target list across the Americas, Europe, Asia, Africa, and Oceania; render dotted region overlays and zoom-aware labels through the core detail-provider contract; update zoom and sizing examples to use the optional package; and remove the visible below-map region list from sizing examples.

## Technical Context

**Language/Version**: TypeScript with React; Node `>=18` per project baseline  
**Primary Dependencies**: Existing Yarn workspace packages; React; existing map/projection tooling in the repository; no new runtime dependency planned for consumers  
**Storage**: Static generated TypeScript region collections in `regions/src/data/`, with SVG paths projected into the core map coordinate system  
**Testing**: Vitest and Testing Library for package tests; TypeScript checks for website examples; repository validation scripts for lint, format, spellcheck, coverage, build, and npm package dry-runs  
**Target Platform**: Published npm packages for browser React consumers plus Docusaurus website examples  
**Project Type**: Yarn workspace React library with an optional companion data package and documentation site  
**Performance Goals**: Country-only consumers do not install or load region data through the core package; target-country region rendering remains usable at zoomed detail levels; unreadable labels are intentionally hidden  
**Constraints**: Optional package remains separate from core imports; region data is thematic and non-authoritative; all target-country data must be source-reviewed and reproducible; sizing examples must not render the visible text region list below maps  
**Scale/Scope**: First-level region coverage for exactly 23 target countries: United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia. The coverage model must also support single-region, partial, experimental, and unavailable states without changing the core API.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. The feature updates public package exports, generated data, source/generation scripts, package docs, API docs, examples, and release notes so external contributors can inspect and reproduce the data surface.
- **Political and Geopolitical Neutrality**: PASS. Region boundaries, names, and country coverage are affected. Implementation must update `docs/map-data-policy.md`, `docs/map-data-overrides.json`, per-country source summaries, review notes, and non-authoritative thematic boundary language.
- **Quality Gates**: PASS. The plan requires focused tests, full workspace tests, typecheck, lint, format, spellcheck, coverage, build, README generation, and npm pack dry-runs for both core and regions packages.
- **Accessible, Lightweight React Library**: PASS. Region rendering uses the existing SVG/detail-provider architecture, keeps target-country data in the optional package, preserves country interactions/accessibility, and avoids hosted map services or runtime data fetching.
- **Release Integrity and Compatibility**: PASS. The plan includes ESM/CJS/types/package contents validation, generated README synchronization, changelog/release documentation, and package-size verification.

## Project Structure

### Documentation (this feature)

```text
specs/004-regions-data-package/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── public-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
lib/
├── src/
│   ├── index.tsx
│   ├── types.ts
│   ├── labels/
│   │   └── placement.ts
│   ├── components/
│   │   └── VisibleRegionList.tsx
│   └── __tests__/
│       ├── WorldMap.test.tsx
│       ├── detail-provider.test.tsx
│       ├── visible-region-list.test.tsx
│       └── zoom-labels.test.tsx
├── scripts/
│   └── migrate-to-topo.ts
└── README.md

regions/
├── src/
│   ├── coverage.ts
│   ├── data/
│   │   └── starter.ts
│   ├── providers/
│   │   └── createRegionsDetailProvider.ts
│   └── __tests__/
│       ├── region-data.test.ts
│       └── regions-package.test.ts
├── scripts/
│   └── generate-starter-regions.mjs
├── package.json
└── README.md

website/
├── package.json
└── src/
    ├── components/
    │   ├── ZoomExample.tsx
    │   └── sizing/
    │       ├── XL.tsx
    │       └── XXL.tsx
    └── react-svg-worldmap.d.ts

docs/
├── api.md
├── customization.md
├── examples.md
├── map-data-overrides.json
├── map-data-policy.md
└── RELEASING.md
```

**Structure Decision**: Keep the existing workspace. Core rendering and shared TypeScript contracts live in `lib`; optional generated target-country data and provider helpers live in `regions`; examples live in `website`; and policy/API/release documentation live in `docs`.

## Target Coverage

The required region breakdown countries are:

| Group | Countries |
| --- | --- |
| Americas | United States, Canada, Mexico, Brazil, Argentina, Venezuela |
| Europe | Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia |
| Asia | India, Pakistan, United Arab Emirates, Malaysia, Iraq |
| Africa | Nigeria, Ethiopia, South Africa, Sudan |
| Oceania | Australia, Micronesia |

Implementation may mark a country `partial` or `experimental` only when the source review or data quality requires it, and that status must be explicit in coverage metadata and documentation. Countries marked `complete` must validate actual region counts against expected first-level counts.

## Phase 0: Research

Research decisions are captured in `specs/004-regions-data-package/research.md` and resolve the implementation direction:

- Use "region" as the generic API term for first-level official subdivisions while preserving local names and subdivision kinds.
- Keep `@react-svg-worldmap/regions` as the optional package instead of adding a second package name.
- Implement the exact 23-country target list, not a two-country subset and not global coverage.
- Store generated overlay paths, centroids, and bounds in the core map coordinate system.
- Use repeatable generation and validation scripts with source summaries, expected counts, and review notes for every target country.
- Render dotted internal overlays and hide region labels when zoom, fit, or collision rules make them unreadable.
- Remove the visible below-map region list from sizing examples.
- Preserve core package size and default behavior.
- Treat region data as thematic and non-authoritative.

No unresolved clarification items remain.

## Phase 1: Design And Contracts

Design artifacts:

- `specs/004-regions-data-package/data-model.md`
- `specs/004-regions-data-package/contracts/public-api.md`
- `specs/004-regions-data-package/quickstart.md`

Public contract impact:

- Core `WorldMap` continues to support country-only rendering without optional data.
- Region detail continues through `detailLevel="regions"` and `detailProvider`.
- Region coverage metadata supports complete, partial, experimental, unavailable, and single-region cases.
- Region records include stable identity, country association, local kind, source identity, renderable path, centroid, and bounds.
- Optional package exports provider helpers, coverage catalog, and target-country region collections without being imported by core.
- Website examples import the optional package for real region data; sizing examples do not render the visible below-map region list.

## Implementation Strategy

1. Stabilize contracts and tests for target-country coverage metadata, provider behavior, dotted overlays, label placement, and sizing-example absence of the region list.
2. Build or refine the repeatable generation workflow so each target country has source-reviewed geometry, expected count metadata, and generated projected SVG paths.
3. Keep core changes generic: types, detail-provider rendering, label placement, and accessibility-compatible overlay behavior.
4. Replace website placeholder usage with optional package imports and remove below-map region-list rendering from sizing examples.
5. Update documentation, policy records, release notes, generated README, and package-size evidence.
6. Run focused validation during implementation and full release-oriented validation before completion.

## Post-Design Constitution Check

- **Open Source Stewardship**: PASS. Data model and contracts document package exports, generated target-country data, source review, docs, and examples.
- **Political and Geopolitical Neutrality**: PASS. Design requires source summaries, per-country coverage review notes, policy docs, and non-authoritative language.
- **Quality Gates**: PASS. Quickstart defines focused and full validation commands, including coverage and package dry-runs.
- **Accessible, Lightweight React Library**: PASS. Optional data remains outside default core loading; overlays preserve country interactions and SVG accessibility behavior.
- **Release Integrity and Compatibility**: PASS. Design includes generated README synchronization, package output checks, changelog/release notes, and semver/package-size review.

## Complexity Tracking

No constitution violations or additional complexity exceptions are required.
