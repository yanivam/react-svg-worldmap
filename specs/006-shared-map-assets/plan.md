# Implementation Plan: Shared Core Map Assets

**Branch**: `006-shared-map-assets` | **Date**: 2026-05-10 | **Spec**: [spec.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/006-shared-map-assets/spec.md)  
**Input**: Feature specification from `/specs/006-shared-map-assets/spec.md`

## Summary

Reduce the published core package footprint by moving duplicated country topology payloads out of the public ESM and CJS entry bundles and into package-internal shared assets that still ship inside `react-svg-worldmap`. The plan also makes the source-map release policy explicit so published JavaScript does not reference missing `.map` files, while preserving existing country rendering, optional region behavior, public imports, and release validation.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 examples, Node `>=18`  
**Primary Dependencies**: React, d3-geo, topojson-client, Vitest, Testing Library/jsdom, tsup, Docusaurus website, optional `@react-svg-worldmap/regions` workspace  
**Storage**: Static package-local country topology assets and generated package artifacts; no runtime database, hosted map service, or new optional country-map package  
**Testing**: Vitest for `lib`, Testing Library/jsdom for React behavior, package build with tsup, website typecheck/build, ESM/CJS package smoke tests, npm pack dry-runs and package-content inspection  
**Target Platform**: Browser SVG rendering through the published React package, Node package consumers using ESM or CommonJS, and Docusaurus examples  
**Project Type**: Yarn workspace with published React library (`lib`), optional data package (`regions`), and documentation/examples site (`website`)  
**Performance Goals**: Core package unpacked size at least 25% smaller than the current `10.5 MB` dry-run baseline while packed size stays at or below `1.2 MB`; no meaningful startup, zoom, or detailed-geometry loading regression against the smooth zoom targets  
**Constraints**: Keep country-level map data in the core package; do not create a new country-map package; keep regions optional; preserve documented default import, named exports, CommonJS require, and TypeScript declarations; avoid missing source-map warnings; avoid changing map geometry content or geopolitical naming  
**Scale/Scope**: Reduced and detailed country topology payloads, core package build outputs, package files metadata, import/require smoke scenarios, website build, optional region rendering integration, release-readiness documentation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. The feature keeps all country-level data in the MIT-distributed core package and makes package contents more inspectable for contributors and consumers.
- **Political and Geopolitical Neutrality**: PASS. The plan changes artifact layout only. Country names, codes, borders, disputed areas, and source geometry must remain byte-equivalent unless explicitly reviewed against `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **Quality Gates**: PASS. The plan includes focused behavior tests, package smoke tests, size inspection, source-map inspection, full repo validation, coverage, build, website build, and release artifact dry-runs.
- **Accessible, Lightweight React Library**: PASS. SVG rendering and accessibility behavior are preserved. No hosted map service, heavyweight renderer, or new runtime package is planned.
- **Release Integrity and Compatibility**: PASS. ESM, CJS, TypeScript declarations, package contents, README/docs, changelog/release notes, and semantic-version impact are in scope.

## Project Structure

### Documentation (this feature)

```text
specs/006-shared-map-assets/
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
│   ├── countries.topo.ts
│   ├── countries-detailed.topo.ts
│   ├── map-data/
│   │   └── geometry-tiers.ts
│   └── __tests__/
│       ├── WorldMap.test.tsx
│       ├── geometry-tiers.test.ts
│       ├── zoom-performance.test.tsx
│       └── country-hit-targets.test.tsx
├── scripts/
├── tsup.config.ts
├── package.json
└── README.md

regions/
├── src/
├── tsup.config.ts
└── package.json

website/
├── src/
└── package.json

docs/
├── api.md
├── examples.md
├── customization.md
└── RELEASING.md
```

**Structure Decision**: Keep the implementation inside existing workspace boundaries. The core package owns shared country assets and package metadata; `regions` remains optional and separate; `website` and `docs` provide consumer-facing validation and release documentation. No new package is introduced.

## Complexity Tracking

No constitution violations requiring complexity exceptions.

## Phase 0: Research

See [research.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/006-shared-map-assets/research.md).

Resolved decisions:

- Keep country topology in `react-svg-worldmap` and share it between module formats through package-internal assets.
- Prefer removing published source-map references over publishing large `.map` files unless validation proves published maps are worth the size cost.
- Treat topology payload duplication, not topology metadata, as the primary package-size problem.
- Validate ESM, CommonJS, TypeScript declarations, website build, country-only rendering, detailed zoom rendering, and optional regions before considering the change shippable.
- Document startup, zoom, asset-loading, debugging, and package-manager risk in a release-readiness report.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/006-shared-map-assets/data-model.md)
- [contracts/public-api.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/006-shared-map-assets/contracts/public-api.md)
- [quickstart.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/006-shared-map-assets/quickstart.md)

Implementation design:

- Move reduced and detailed country topology payloads out of duplicated public entry bundles and into shared package-internal assets that are included by `lib/package.json` files metadata.
- Keep existing map-data loader semantics stable so country-only maps render with only the core package and detailed maps still load when zoom requires them.
- Update tsup/package configuration so generated JavaScript either has no `sourceMappingURL` comments or includes the referenced source maps intentionally; this plan prefers no published source-map references.
- Add package-content inspection to prove large country topology appears once per intended asset rather than once per public module output.
- Add or extend smoke tests for ESM import, CommonJS require, TypeScript declarations, country-only rendering, detailed zoom rendering, optional regions, and website build.
- Produce a release-readiness note with before/after size numbers, source-map behavior, performance observations, compatibility results, risks, mitigations, and semantic-version recommendation.

## Constitution Check - Post-Design

- **Open Source Stewardship**: PASS. Shared assets remain source-controlled and published with the core package; documentation will explain package contents and release impact.
- **Political and Geopolitical Neutrality**: PASS. The design changes asset packaging only and requires review if geometry bytes, names, codes, or policy-sensitive data change unexpectedly.
- **Quality Gates**: PASS. The quickstart includes targeted tests, full workspace validation, coverage, package dry-runs, source-map inspection, and package-size checks.
- **Accessible, Lightweight React Library**: PASS. The component remains an SVG React library without new hosted or heavyweight runtime dependencies.
- **Release Integrity and Compatibility**: PASS. Public entry points, declarations, generated README, changelog/release notes, npm package contents, and semantic-version impact are explicitly validated.

## Validation Plan

Focused validation:

- `yarn workspace react-svg-worldmap test WorldMap.test.tsx geometry-tiers.test.ts zoom-performance.test.tsx country-hit-targets.test.tsx`
- `yarn workspace @react-svg-worldmap/regions test`
- `NO_UPDATE_NOTIFIER=1 yarn build:website`
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`

Full validation:

- `yarn workspace react-svg-worldmap test`
- `yarn workspace @react-svg-worldmap/regions test`
- `yarn typecheck`
- `yarn lint`
- `yarn format-check`
- `yarn spellcheck`
- `yarn test:coverage`
- `NO_UPDATE_NOTIFIER=1 yarn build`
- `NO_UPDATE_NOTIFIER=1 yarn build:website`
- `yarn generate:readme`
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions`

Package inspection:

- Confirm core packed size is `<= 1.2 MB`.
- Confirm core unpacked size is `<= 7.875 MB`.
- Confirm published JavaScript files do not reference missing `.map` files.
- Confirm country topology assets are included in `react-svg-worldmap` and not moved to a new package.
- Confirm no unnecessary duplicate large country topology payload appears across public ESM and CJS entry bundles.
