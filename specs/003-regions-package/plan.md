# Implementation Plan: Regions Package

**Branch**: `003-regions-package` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-regions-package/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add optional provider-backed region detail on top of the completed country-level zoom foundation. The core map remains country-only by default, but can accept a region detail provider and display country-scoped region boundaries, labels, fallback states, and accessibility status when supported data exists. A separate optional regions workspace package will expose starter coverage metadata, normalized region records, and a helper that creates a core-compatible provider.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 development baseline, public peer compatibility with React >=16.8, Node >=18  
**Primary Dependencies**: React, d3-geo, topojson-client, react-path-tooltip, tsup, Vitest, Testing Library; optional region package should reuse existing build/test tooling and avoid new runtime map-service dependencies  
**Storage**: Bundled package data for starter region coverage; no runtime persistence or remote service required  
**Testing**: Vitest with jsdom, Testing Library for React interaction tests, package coverage via `yarn test:coverage`, package build and smoke checks  
**Target Platform**: Browser-rendered React SVG package, ESM/CJS package consumers, Docusaurus website examples  
**Project Type**: Yarn workspace library plus optional data package and documentation website  
**Performance Goals**: Region display should preserve interactive zoom responsiveness for starter coverage; unsupported countries must fall back without blocking country-level rendering; label and pin filtering must remain usable for rendered region collections  
**Constraints**: Preserve default country-only behavior, no hosted map service dependency, core package must not depend on optional regions package at runtime, region data must pass map-data neutrality review, package coverage gates stay above 80%  
**Scale/Scope**: One existing core package (`lib`), one new optional regions package (`regions`), starter country-scoped region coverage, docs/website examples, public provider boundary for custom region data

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS - The optional package and public provider contract keep behavior easy to inspect and reuse without private services.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - Region names, boundaries, and coverage are map data changes. The plan requires review against `docs/map-data-policy.md` and `docs/map-data-overrides.json`, with starter coverage documented as limited.
- **Quality Gates**: PASS - Plan includes unit/component tests, region data validation, lint, format check, typecheck, spellcheck, coverage, build, generated README verification, and package smoke validation.
- **Accessible, Lightweight React Library**: PASS - The core remains SVG-based and country-only by default. Region detail preserves keyboard zoom/reset behavior, live status, readable labels, and avoids hosted map APIs.
- **Release Integrity and Compatibility**: PASS - New props/types, optional package exports, package contents, README generation, docs, examples, and release notes are identified as release surfaces.

## Project Structure

### Documentation (this feature)

```text
specs/003-regions-package/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── public-api.md
└── tasks.md
```

### Source Code (repository root)

```text
lib/
├── src/
│   ├── index.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── Region.tsx
│   │   ├── TextLabel.tsx
│   │   ├── ZoomControls.tsx
│   │   ├── ZoomStatus.tsx
│   │   └── VisibleRegionList.tsx
│   ├── detail/
│   │   └── providerState.ts
│   ├── labels/
│   │   └── placement.ts
│   ├── pins/
│   │   └── mapPins.ts
│   ├── zoom/
│   │   ├── geometry.ts
│   │   └── state.ts
│   └── __tests__/
│       ├── detail-provider.test.tsx
│       ├── visible-region-list.test.tsx
│       ├── WorldMap.test.tsx
│       └── zoom-labels.test.tsx
├── scripts/
│   └── generate-readme.mjs
└── README.md

regions/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── coverage.ts
    ├── data/
    │   └── starter.ts
    ├── providers/
    │   └── createRegionsDetailProvider.ts
    └── __tests__/
        └── region-data.test.ts

website/
├── src/components/ZoomExample.tsx
├── src/data/countryCapitalPins.ts
└── src/pages/examples/zoom.tsx
```

**Structure Decision**: Keep the core package as the only required runtime dependency for country maps. Add a sibling optional workspace package for starter region data and provider helpers. Core region rendering consumes only the public provider contract so custom providers and the optional package share the same integration boundary.

## Phase 0: Research

Research decisions are recorded in [research.md](./research.md). All technical unknowns are resolved: optional package boundary, provider contract shape, starter coverage policy, region geometry representation, accessibility fallback behavior, and validation gates.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](./data-model.md): Defines region package, coverage metadata, region records, provider/result state, visible region list, and label/pin behavior in region detail.
- [contracts/public-api.md](./contracts/public-api.md): Defines core detail props, provider/result contracts, optional regions package exports, accessibility behavior, and compatibility requirements.
- [quickstart.md](./quickstart.md): Documents the implementation and verification flow for core fallback, optional package use, starter coverage, and release validation.

Post-design constitution re-check:

- **Open Source Stewardship**: PASS - Public contracts and optional package artifacts are documented.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - Region data is explicitly policy-gated, starter coverage is limited and documented, and unsupported countries fall back without implying coverage.
- **Quality Gates**: PASS - Plan requires tests for provider states, visible list behavior, region data validation, package builds, coverage, lint, typecheck, format, spellcheck, README generation, and package smoke checks.
- **Accessible, Lightweight React Library**: PASS - Core remains lightweight, provider-based, SVG-rendered, and keyboard-operable with live status for detail transitions.
- **Release Integrity and Compatibility**: PASS - Package exports, generated READMEs, docs, examples, changelog/release notes, and package contents are release requirements.

## Complexity Tracking

No constitution violations or complexity exceptions.
