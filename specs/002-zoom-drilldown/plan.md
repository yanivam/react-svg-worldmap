# Implementation Plan: Zoom Drill-Down

**Branch**: `002-zoom-drilldown` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from `/specs/002-zoom-drilldown/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement opt-in country-level zooming for the existing React SVG world map while preserving default country rendering and all current public behavior. Phase 1 covers continuous zoom, drag panning, reset, keyboard-operable controls, live zoom status, fit-aware country labels, automatic clamped zoom-aware country label sizing with consumer overrides, consumer-supplied pins, and constant screen-space country border strokes during zoom. Phase 2, after the zoom foundation is complete, introduces optional provider-backed region detail in a separate data package.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 development baseline, public peer compatibility with React >=16.8, Node >=18 **Primary Dependencies**: React, d3-geo, topojson-client, react-path-tooltip, tsup, Vitest, Testing Library **Storage**: N/A - bundled TopoJSON geometry, consumer props, and optional future region package data **Testing**: Vitest with jsdom, Testing Library for React interaction tests, package coverage via `yarn test:coverage` **Target Platform**: Browser-rendered React SVG package, ESM/CJS package consumers, Docusaurus website examples **Project Type**: Yarn workspace library plus documentation website **Performance Goals**: Zoom and pan interactions should update without remounting map data; label and pin filtering should remain usable for the bundled world country set; repeated zoom should not visually thicken country borders; label screen size should grow modestly at high zoom while staying within configured bounds **Constraints**: Preserve default non-zoom behavior, no hosted map service or remote network dependency, no region data in Phase 1 core package, keep SVG accessibility and keyboard access, maintain package build and coverage gates above 80% **Scale/Scope**: One published core package (`lib`), one website example/docs surface, bundled world country geometry, optional Phase 2 region package/provider boundary

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS - Public zoom, label sizing, pin, and later region-provider contracts are documented in `contracts/public-api.md`; no private services or proprietary data sources are introduced.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - Phase 1 does not change country geometry, names, codes, or disputed areas. Phase 2 region data is explicitly treated as a neutrality-reviewed map data change against `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **Quality Gates**: PASS - Plan requires lint, format check, typecheck, spellcheck, coverage, build, generated README verification, and package smoke validation.
- **Accessible, Lightweight React Library**: PASS - Zoom controls, keyboard behavior, live announcements, reduced-motion handling, readable label sizing, and visible region list requirements are included; Phase 1 adds no hosted map API and keeps data out of core.
- **Release Integrity and Compatibility**: PASS - Existing country-level API remains the default; new public props/types, docs, examples, generated README, package outputs, and release notes must be validated.

## Project Structure

### Documentation (this feature)

```text
specs/002-zoom-drilldown/
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
│   │   ├── PinMarker.tsx
│   │   ├── Region.tsx
│   │   ├── TextLabel.tsx
│   │   ├── ZoomControls.tsx
│   │   └── ZoomStatus.tsx
│   ├── labels/
│   │   └── placement.ts
│   ├── pins/
│   │   └── mapPins.ts
│   ├── zoom/
│   │   ├── geometry.ts
│   │   └── state.ts
│   └── __tests__/
│       ├── WorldMap.test.tsx
│       ├── zoom-controls.test.tsx
│       ├── zoom-drag.test.tsx
│       ├── zoom-interaction.test.tsx
│       ├── zoom-labels.test.tsx
│       ├── zoom-state.test.ts
│       ├── zoom-geometry.test.ts
│       ├── label-placement.test.ts
│       └── map-pins.test.ts
├── scripts/
│   └── generate-readme.mjs
└── README.md

website/
├── src/components/ZoomExample.tsx
├── src/data/countryCapitalPins.ts
└── src/pages/examples/zoom.tsx
```

**Structure Decision**: Use the existing Yarn workspace. Phase 1 changes stay in the published `lib` package and website/docs example surfaces. Phase 2 can add an optional region data workspace/package after the country-level zoom foundation is complete.

## Phase 0: Research

Research decisions are recorded in [research.md](./research.md). The label-size clarification is resolved by adapting the Google Maps style concept of zoom-level label styling to this lightweight SVG map: country labels remain screen-space text, but their target font size grows through a clamped zoom-aware rule and remains subject to existing fit/collision gating.

No unresolved clarification items remain.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](./data-model.md): Defines zoom state, label candidates, label size rule, consumer pins, detail provider/result models, region records, visible region list, label placement, and country border stroke rendering.
- [contracts/public-api.md](./contracts/public-api.md): Defines Phase 1 zoom/pin public props and Phase 2 provider contracts; label size behavior is configurable through `ZoomOptions`.
- [quickstart.md](./quickstart.md): Documents implementation and verification flow, including repeated zoom validation for constant country border thickness and clamped label growth.

Post-design constitution re-check:

- **Open Source Stewardship**: PASS - API and behavior contracts are documented in the feature artifacts.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW - No Phase 1 geometry/content changes; Phase 2 region data remains policy-gated.
- **Quality Gates**: PASS - Verification commands cover package tests, coverage, lint, typecheck, formatting, spellcheck, build, README generation, and package smoke validation.
- **Accessible, Lightweight React Library**: PASS - Design preserves explicit controls, keyboard operation, live status, readable label sizing, and no hosted map dependencies.
- **Release Integrity and Compatibility**: PASS - Documentation and generated package outputs are included in validation.

## Complexity Tracking

No constitution violations or complexity exceptions.
