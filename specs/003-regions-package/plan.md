# Implementation Plan: Regions Package

**Branch**: `003-regions-package` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-regions-package/spec.md`

## Summary

Add optional provider-backed region detail while preserving country-only rendering as the default, restore the bundled core country map to higher-detail geometry, and reduce the resulting core package size through quality-budgeted topology optimization. The implementation keeps the optional regions package separate from the core package, updates the website "Zoom with regions" example, and revises the country map-data workflow so `lib/src/countries.topo.ts` is regenerated from the current project source path with at least 6 decimal places of retained source precision. Size reduction may use simplification or quantization only when automated quality fixtures show no material human-visible degradation for small islands, coastlines, borders, and small countries.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 development baseline, public peer compatibility with React >=16.8, Node >=18  
**Primary Dependencies**: React, d3-geo, topojson-client, react-path-tooltip, topojson-server for generation, tsup, Vitest, Testing Library; optional region package reuses existing build/test tooling and must avoid hosted map-service dependencies  
**Storage**: Bundled checked-in TopoJSON country geometry, bundled optional starter region data, no runtime persistence or remote service  
**Testing**: Vitest with jsdom, Testing Library for React interaction tests, map-data validation tests, package coverage via `yarn test:coverage`, package build and smoke checks  
**Target Platform**: Browser-rendered React SVG package, ESM/CJS package consumers, Docusaurus website examples  
**Project Type**: Yarn workspace library plus optional data package and documentation website  
**Performance Goals**: Preserve interactive zoom responsiveness with optimized higher-detail country topology and starter region detail; unsupported countries must fall back without blocking country-level rendering; label and pin filtering must remain usable for rendered country and region collections  
**Constraints**: Preserve default country-only behavior, core package must not depend on optional regions package at runtime, no hosted map service dependency, country topology regeneration must retain at least 6 decimal places, lossless compression is preferred, lossy simplification or quantization must stay within an explicit quality budget, map data changes must pass neutrality review, package coverage gates stay above 80%  
**Scale/Scope**: One existing core package (`lib`), one optional regions workspace package (`regions`), one country topology generator and optimizer, starter country-scoped region coverage, docs/website examples, public provider boundary for custom region data

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS - Optional package contracts, country topology generation and optimization settings, source path, validation output, and package-size tradeoffs will be documented and reviewable in-repo.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - Region boundaries and regenerated/optimized country geometry affect map data. The plan requires review against `docs/map-data-policy.md` and `docs/map-data-overrides.json`, with no claim that the default map is authoritative.
- **Quality Gates**: PASS - Plan includes unit/component tests, map-data validation, quality-budget fixtures, lint, format check, typecheck, spellcheck, coverage, build, generated README verification, and package smoke validation.
- **Accessible, Lightweight React Library**: PASS WITH SIZE REVIEW - Core remains SVG-based and country-only by default. Higher-detail topology may grow the core package, so the plan now requires measured package-size reduction through quality-budgeted optimization without adding runtime map services.
- **Release Integrity and Compatibility**: PASS - New props/types, optional package exports, generated READMEs, map-data regeneration/optimization docs, package contents, examples, changelog, and release notes are identified as release surfaces.

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
├── scripts/
│   ├── generate-readme.mjs
│   └── migrate-to-topo.ts
├── src/
│   ├── countries.topo.ts
│   ├── index.tsx
│   ├── types.ts
│   ├── components/
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
│       ├── map-data-generation.test.ts
│       ├── visible-region-list.test.tsx
│       ├── WorldMap.test.tsx
│       └── zoom-labels.test.tsx

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
        ├── region-data.test.ts
        └── regions-package.test.ts

website/
├── src/components/ZoomExample.tsx
├── src/components/ZoomExample.module.css
├── src/data/countryCapitalPins.ts
└── src/pages/examples/zoom.tsx

docs/
├── api.md
├── customization.md
├── examples.md
├── map-data-policy.md
└── map-data-overrides.json
```

**Structure Decision**: Keep the core package as the only required runtime dependency for country maps. Add a sibling optional workspace package for starter region data and provider helpers. Keep country map generation and quality-budgeted optimization inside `lib/scripts/` so the source path, precision settings, optimization settings, validation fixtures, and generated `lib/src/countries.topo.ts` remain package-owned and reproducible.

## Phase 0: Research

Research decisions are recorded in [research.md](./research.md). All technical unknowns are resolved: optional package boundary, provider contract shape, starter coverage policy, region geometry representation, accessibility fallback behavior, validation gates, country topology precision, compression policy, quality-budgeted simplification, map-data validation, and package-size tradeoff.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](./data-model.md): Defines region package, coverage metadata, region records, provider/result state, visible region list, country topology source, topology generation run, topology optimization budget, topology validation report, and label/pin behavior.
- [contracts/public-api.md](./contracts/public-api.md): Defines core detail props, provider/result contracts, optional regions package exports, rendering/accessibility behavior, and map-data generation/optimization contract.
- [quickstart.md](./quickstart.md): Documents implementation and verification flow for core fallback, optional package use, starter coverage, country topology regeneration, quality-budgeted optimization, and release validation.

Post-design constitution re-check:

- **Open Source Stewardship**: PASS - Public contracts, optional package artifacts, and the country topology regeneration and optimization workflow are documented.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - Region and optimized country geometry changes are explicitly policy-gated; validation must preserve country records and document generation/optimization settings without implying authoritative boundaries.
- **Quality Gates**: PASS - Plan requires tests for provider states, visible list behavior, region data validation, map-data generation validation, quality-budget fixtures, package builds, coverage, lint, typecheck, format, spellcheck, README generation, and package smoke checks.
- **Accessible, Lightweight React Library**: PASS WITH SIZE REVIEW - Core remains provider-based, SVG-rendered, and keyboard-operable. Higher-detail topology is optimized by a documented quality budget and introduces no runtime map service.
- **Release Integrity and Compatibility**: PASS - Package exports, generated READMEs, docs, examples, changelog/release notes, map-data docs, package contents, and package-size measurements are release requirements.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Higher-detail bundled country topology increases core package size | The clarified requirement prioritizes country-level granularity and visible coastline/island/border detail over aggressive size reduction | Keeping the old aggressively reduced topology fails the core map quality requirement |
| Quality-budgeted lossy optimization | The high-detail baseline produced a materially larger package, and the clarified requirement allows simplification when human-visible quality is protected by fixtures | Lossless-only optimization is unlikely to reduce the package enough; unbounded simplification would repeat the original quality problem |
