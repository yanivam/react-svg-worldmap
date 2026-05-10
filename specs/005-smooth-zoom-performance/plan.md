# Implementation Plan: Smooth Zoom Performance

**Branch**: `005-smooth-zoom-performance` | **Date**: 2026-05-10 | **Spec**: [spec.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/005-smooth-zoom-performance/spec.md)  
**Input**: Feature specification from `/specs/005-smooth-zoom-performance/spec.md`

## Summary

Improve zoom-control responsiveness so representative map examples show visible feedback within 250 ms in typical cases and complete the visible zoom update within 500 ms in worst cases. The plan starts with the clarified lightweight path: preserve the SVG renderer, provide immediate perceptual zoom motion, defer or cache secondary detail work, measure the result, and only consider a separate high-performance renderer or tile-like architecture if benchmark evidence shows the lightweight path cannot meet the targets.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 examples, Node `>=18`  
**Primary Dependencies**: React, d3-geo, topojson-client, Vitest, Testing Library/jsdom, tsup, Docusaurus website, optional `@react-svg-worldmap/regions` workspace  
**Storage**: Static TypeScript geometry/data files and generated package artifacts; no runtime database or hosted map service  
**Testing**: Vitest for `lib`, Testing Library/jsdom for React behavior, package build with tsup, website typecheck/build, performance-focused test harness for zoom responsiveness  
**Target Platform**: Browser SVG rendering through the published React package and Docusaurus examples  
**Project Type**: Yarn workspace with published React library (`lib`), optional data package (`regions`), and documentation/examples site (`website`)  
**Performance Goals**: 90% of representative zoom clicks show visible feedback within 250 ms; 100% complete visible zoom update within 500 ms; observed 1-2 second delay reduced by at least 75% on the maintainer's Mac  
**Constraints**: Keep SVG as the default renderer; preserve accessibility output, hover identity, labels, pins, region overlays, full-world reset, and public zoom behavior; no new required hosted map service, external basemap, paid runtime dependency, or heavyweight renderer unless benchmark-driven escalation is approved  
**Scale/Scope**: Existing country geometry tiers, optional region detail data, labels, pins, full-world and detailed zoom examples, and rapid repeated zoom-control interactions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. The plan keeps the package self-contained, MIT-compatible, and reviewable; any measurement helpers or docs will live in the repo.
- **Political and Geopolitical Neutrality**: PASS. No country names, borders, codes, disputed areas, or map-data source policy changes are planned. Existing geometry behavior must remain equivalent.
- **Quality Gates**: PASS. Plan includes focused performance/behavior tests, full package tests, typecheck, lint, formatting, spellcheck, coverage, build, and package dry-run validation.
- **Accessible, Lightweight React Library**: PASS. SVG remains the default rendering model and accessibility behavior must be preserved. Canvas/WebGL or tile-like work is explicitly an escalation path, not the starting point.
- **Release Integrity and Compatibility**: PASS. Public behavior docs, README generation, package contents, and changelog/release notes remain in scope if user-visible zoom behavior or validation commands change.

## Project Structure

### Documentation (this feature)

```text
specs/005-smooth-zoom-performance/
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
│   ├── components/
│   │   ├── ZoomControls.tsx
│   │   └── ZoomStatus.tsx
│   ├── labels/
│   │   └── placement.ts
│   ├── map-data/
│   │   └── geometry-tiers.ts
│   ├── pins/
│   │   └── mapPins.ts
│   ├── zoom/
│   │   ├── geometry.ts
│   │   └── state.ts
│   └── __tests__/
│       ├── zoom-controls.test.tsx
│       ├── zoom-interaction.test.tsx
│       ├── zoom-state.test.ts
│       ├── geometry-tiers.test.ts
│       └── zoom-performance.test.tsx
├── scripts/
└── package.json

website/
├── src/
│   ├── components/
│   │   └── ZoomExample.tsx
│   └── pages/examples/zoom.tsx
└── package.json

docs/
├── api.md
├── examples.md
└── customization.md
```

**Structure Decision**: Keep changes inside existing workspace boundaries. Core zoom behavior, caching/progressive-detail behavior, and performance tests belong in `lib`; demo-only measurement or documentation belongs in `website` and `docs`; no new package is introduced during the initial A+B approach.

## Complexity Tracking

No constitution violations requiring complexity exceptions.

## Phase 0: Research

See [research.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/005-smooth-zoom-performance/research.md).

Resolved decisions:

- Start with progressive SVG optimization and immediate perceptual motion.
- Treat canvas/WebGL or tile-like map architecture as escalation only after measurements show the initial approach cannot meet the target.
- Measure user-visible zoom response with representative scenarios rather than relying on implementation-only timings.
- Keep secondary detail layers from blocking the first visible zoom response.
- Preserve existing SVG accessibility and public zoom behavior while optimizing internal scheduling and reuse.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/005-smooth-zoom-performance/data-model.md)
- [contracts/public-api.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/005-smooth-zoom-performance/contracts/public-api.md)
- [quickstart.md](/Users/ehudamiri/projects/react-svg-worldmap/specs/005-smooth-zoom-performance/quickstart.md)

Implementation design:

- Add a representative zoom performance scenario that measures click-to-visible-feedback and click-to-visible-completion across full-world, detailed, and optional-region states.
- Keep zoom-control interactions responsive by making the first visible transform update independent of expensive secondary detail work.
- Reuse precomputed geometry, label, pin, and region projection work where inputs are unchanged.
- Stage labels, detailed paths, region overlays, and pins so they never block the first visual response.
- Preserve the existing zoom API and SVG semantics, including title/accessibility behavior and interaction target identity.
- Document benchmark expectations and escalation criteria before considering a separate high-performance renderer or tile-like data split.

## Constitution Check - Post-Design

- **Open Source Stewardship**: PASS. New artifacts are source-controlled docs/tests and do not depend on private services.
- **Political and Geopolitical Neutrality**: PASS. The design changes rendering performance only and does not alter map data policy, country naming, or boundary choices.
- **Quality Gates**: PASS. The plan includes targeted zoom performance regression coverage plus existing package and repo validation commands.
- **Accessible, Lightweight React Library**: PASS. The default SVG renderer and accessibility contract remain mandatory; no new runtime dependency is planned for the initial approach.
- **Release Integrity and Compatibility**: PASS. User-visible performance behavior will be documented, and generated README/package validation remains required if docs or package output change.

## Validation Plan

Focused validation:

- `yarn workspace react-svg-worldmap test zoom-controls.test.tsx zoom-interaction.test.tsx zoom-state.test.ts geometry-tiers.test.ts zoom-performance.test.tsx`
- `yarn workspace react-svg-worldmap test WorldMap.test.tsx zoom-labels.test.tsx country-hit-targets.test.tsx`
- `yarn workspace website typecheck`

Full validation:

- `yarn workspace react-svg-worldmap test`
- `yarn workspace @react-svg-worldmap/regions test`
- `yarn typecheck`
- `yarn lint`
- `yarn format-check`
- `yarn spellcheck`
- `yarn test:coverage`
- `yarn build`
- `yarn generate:readme`
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`
