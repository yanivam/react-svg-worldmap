# Implementation Plan: Optional Regions Data Package

**Branch**: `004-regions-data-package` | **Date**: 2026-05-04 | **Spec**: [spec.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/specs/004-regions-data-package/spec.md)  
**Input**: Feature specification from `/specs/004-regions-data-package/spec.md`

## Summary

The feature keeps the optional regions package and zoom examples, but now makes the rendering contract explicit: the SVG must paint a sea/background layer first, country land and borders second, optional dotted regions third, labels fourth, pins fifth, and interaction/accessibility targets last. This plan targets the remaining rendering bug by turning layer order, closed country shapes, and hit-test identity into testable core-package behavior while preserving gradual geometry disclosure and optional region loading.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 examples, Node `>=18`  
**Primary Dependencies**: React, d3-geo, topojson-client, tsup, Vitest, Testing Library, Docusaurus website, optional `@react-svg-worldmap/regions` workspace  
**Storage**: Static generated TypeScript data files for country topology, region SVG paths, and example AWS pins; no runtime database  
**Testing**: Vitest for `lib` and `regions`, Testing Library/jsdom for React rendering tests, Docusaurus/TypeScript website build checks  
**Target Platform**: Browser SVG rendering through the published React package and Docusaurus examples  
**Project Type**: Yarn workspace with published React library (`lib`), optional data package (`regions`), and documentation/examples site (`website`)  
**Performance Goals**: Initial country-only render must use reduced country geometry; detailed country geometry must not parse below `2x`; selected region geometry must not parse below `4x`; core packed package should remain near 1 MB and regions under the prior 5 MB compressed target  
**Constraints**: No hosted tile service, Google Maps dependency, raster basemap, external geometry provider, or custom map provider API in this implementation; map remains thematic and non-authoritative  
**Scale/Scope**: 175 bundled country records, reduced and detailed country geometry tiers, complete first-level region data for 23 target countries, and worldwide AWS Region example pins matching the official AWS Regions documentation snapshot used by the package

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. Changes remain MIT-compatible, keep static source artifacts reviewable, and preserve public-package documentation paths.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW. Country and region geometry rendering is affected, so docs must continue to reference `docs/map-data-policy.md`, avoid authoritative boundary claims, and keep disputed/boundary language thematic.
- **Quality Gates**: PASS. Plan requires focused layer-order and hit-test tests, full package tests, typecheck, lint, formatting, spellcheck, coverage, build, and npm pack dry-runs.
- **Accessible, Lightweight React Library**: PASS. The layer stack uses SVG groups and static package data, keeps accessibility targets explicit, and adds no runtime map-service dependency.
- **Release Integrity and Compatibility**: PASS. Public API docs, package README generation, changelog/release notes, ESM/CJS/types build, and package contents remain in scope.

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
│   ├── components/
│   ├── labels/
│   ├── map-data/
│   ├── pins/
│   ├── zoom/
│   └── __tests__/
├── scripts/
└── package.json

regions/
├── src/
│   ├── data/
│   ├── providers/
│   └── __tests__/
├── scripts/
├── LICENSE
└── package.json

website/
├── src/
│   ├── components/
│   └── data/
└── package.json

docs/
├── api.md
├── customization.md
├── examples.md
├── map-data-policy.md
└── RELEASING.md
```

**Structure Decision**: Use the existing Yarn workspace boundaries. The core renderer and SVG layer-order tests belong in `lib`; optional region data and package validation belong in `regions`; example controls and AWS pins belong in `website`; map-data policy and public behavior documentation belong in `docs`.

## Complexity Tracking

No constitution violations requiring complexity exceptions.

## Phase 0: Research

See [research.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/specs/004-regions-data-package/research.md).

Resolved decisions:

- Use explicit SVG group ordering instead of relying on incidental JSX order.
- Keep the ocean as the SVG/background field and validate that country closed shapes paint above it.
- Keep interaction/accessibility targets aligned with visible country geometry and above visual geometry where needed for pointer behavior.
- Preserve fixed disclosure thresholds: reduced country below `2x`, detailed country at `2x`, optional regions at `4x`.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/specs/004-regions-data-package/data-model.md)
- [contracts/public-api.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/specs/004-regions-data-package/contracts/public-api.md)
- [quickstart.md](/Users/ehudamiri/Documents/projects/react-svg-worldmap/specs/004-regions-data-package/quickstart.md)

Implementation design:

- Add stable SVG group/test identifiers for `ocean`, `countries`, `regions`, `labels`, `pins`, and `interaction-targets`.
- Render the ocean/background layer before any map geometry.
- Render countries as closed visible land/fill paths with borders in the country layer.
- Render region boundaries as dotted overlay paths above country shapes without replacing country fills or borders.
- Render labels and pins above geometry.
- Keep interaction/accessibility targets aligned with rendered country identity so hover does not report Russia for unrelated countries.
- Update zoom controls so plus/minus clicks use twice the previous zoom-control step, double-click keeps using the plus-button factor, and a home-icon Reset zoom control restores the initial full-world scale and position in one click.
- Add render-structure regression tests that inspect DOM order and identity attributes.

## Constitution Check - Post-Design

- **Open Source Stewardship**: PASS. New rendering contract is documented and testable without private assets.
- **Political and Geopolitical Neutrality**: PASS. Geometry behavior remains thematic; docs must preserve non-authoritative language.
- **Quality Gates**: PASS. Design includes targeted regression tests plus full existing gates.
- **Accessible, Lightweight React Library**: PASS. No heavyweight provider or map-service runtime dependency is introduced.
- **Release Integrity and Compatibility**: PASS. Docs, generated README, changelog, package build, and pack dry-runs remain required.

## Validation Plan

Focused validation:

- `yarn workspace react-svg-worldmap test WorldMap.test.tsx country-hit-targets.test.tsx geometry-tiers.test.ts zoom-drag.test.tsx zoom-interaction.test.tsx zoom-controls.test.tsx`
- `yarn workspace @react-svg-worldmap/regions test`
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
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions`
