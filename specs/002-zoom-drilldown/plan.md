# Implementation Plan: Zoom Drill-Down

**Branch**: `002-zoom-drilldown` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)

## Summary

Add an opt-in, accessible zoom experience to `react-svg-worldmap` while preserving the current country-level world map as the default. Phase 1 builds zoom in/out controls, continuous zoom, drag panning, country labels, label fit/collision logic, non-contiguous country handling, and consumer-supplied pins positioned by longitude/latitude with captions. Phase 2 adds the optional region detail package only after the zoom foundation is complete. The plan adapts the policy-first discipline from `docs/superpowers/plans/2026-04-04-neutral-map-policy.md`: document behavior and public contracts first, keep the base package stable, make optional data explicit, and validate package/docs outputs before release.

## Technical Context

- **Language/Version**: TypeScript 4.7, React 18 development baseline, Node >=18
- **Primary Dependencies**: Existing package dependencies: React, d3-geo, topojson-client, react-path-tooltip, tslib; Phase 2 optional new workspace package for normalized regions data
- **Storage**: Checked-in world topology for Phase 1; optional sample capital pins may live in website/docs example data outside the core package; checked-in optional region data package for Phase 2; no external storage
- **Testing**: Vitest, React Testing Library, package build, website typecheck/build, lint, format check, spellcheck, coverage, package smoke validation
- **Target Platform**: Published npm library consumed by browser-based React applications
- **Project Type**: Yarn workspace library package plus documentation website and optional data workspace
- **Performance Goals**: Country-level default remains unchanged for existing consumers; zoom/pan and label calculation stay responsive for the built-in country topology; Phase 2 region drill-down avoids unnecessary work when detail is disabled
- **Constraints**: Default remains country-level; zoom is opt-in; Phase 1 does not introduce region-level rendering; no hosted map service; no network requirement; no bundled capital city metadata; accessibility behavior is part of the core feature
- **Scale/Scope**: Phase 1 supports country-level zooming, drag panning, country labels, label fit/collision rules, non-contiguous country handling, consumer-supplied pins with captions, accessible controls, and live announcements. Phase 2 supports optional country-to-region drill-down, starter region coverage, provider fallback, and visible-region list.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. Plan requires typed public contracts, checked-in optional package artifacts, docs, examples, and release notes/changelog or changeset coverage.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW. Feature adds region data and map detail handling, so any region names, codes, and boundaries must be reviewed against `docs/map-data-policy.md` and `docs/map-data-overrides.json`. The default map remains a small-scale thematic visualization, not an authoritative boundary reference.
- **Quality Gates**: PASS. Plan includes tests for defaults, zoom state, drag panning, labels, consumer-supplied pin thresholds, non-contiguous countries, accessibility controls, optional package coverage in Phase 2, website examples, package build, website build, lint, typecheck, format, spellcheck, package smoke checks, and coverage above threshold.
- **Accessible, Lightweight React Library**: PASS. Zoom must remain keyboard-operable, include explicit controls, support announcements and reduced motion, and avoid hosted map API dependencies. Phase 2 region detail must add visible-region list navigation.
- **Release Integrity and Compatibility**: PASS. Plan identifies package exports, optional workspace package, README generation, website docs/examples, semantic versioning, package contents, ESM/CJS/types, and smoke validation.

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
docs/
├── examples.md
└── superpowers/
    ├── plans/
    └── specs/

lib/
├── README.md
├── package.json
└── src/
    ├── __tests__/
    ├── components/
    ├── detail/
    ├── labels/
    ├── index.tsx
    └── types.ts

regions/
├── package.json
├── src/
│   ├── __tests__/
│   ├── data/
│   ├── providers/
│   ├── coverage.ts
│   ├── index.ts
│   ├── normalizeRegionCollection.ts
│   └── types.ts
├── tsconfig.json
└── tsup.config.ts

website/
├── docusaurus.config.js
└── src/
    ├── components/
    ├── data/
    └── pages/examples/
```

**Structure Decision**: Phase 1 keeps implementation in `lib` and `website`, adding country-level zoom state, controls, label placement, and a consumer-supplied pin API to the base package. Phase 1 must not add capital city metadata to `lib`; any sample capital pins belong in website/docs example data. Phase 2 extends the Yarn workspace with an optional `regions` workspace instead of adding remote services or bundling all region data into `lib`. Keep `lib` responsible for rendering, state, accessibility, provider contracts, and fallback behavior. Keep `regions` responsible for normalized starter region data and provider adapter helpers. Keep `website` responsible for featured zoom and drill-down examples.

## Complexity Tracking

No constitution violations are planned.

## Phase 0: Research Summary

See [research.md](./research.md). Key decisions:

- Preserve country-level rendering as the default.
- Use an explicit Phase 1 zoom opt-in that does not require region data.
- Support continuous zoom, drag panning, reset, country labels, and consumer-supplied pin visibility thresholds in Phase 1.
- Add a separate optional `@react-svg-worldmap/regions` workspace/package in Phase 2.
- Introduce an async region provider boundary with Phase 2 region detail.
- Keep bundled city metadata, remote loading, and hosted map services out of scope.
- Treat accessible controls, announcements, reduced-motion behavior, and Phase 2 visible-region list support as core acceptance requirements.

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), and [quickstart.md](./quickstart.md).

Post-design Constitution Check:

- **Open Source Stewardship**: PASS. Public contracts and package responsibilities are documented.
- **Political and Geopolitical Neutrality**: PASS WITH REVIEW. Region data and names require source/policy review before release.
- **Quality Gates**: PASS. Design defines executable validation for core, optional package, docs, and website.
- **Accessible, Lightweight React Library**: PASS. Design avoids hosted services and makes accessibility part of the base interaction model.
- **Release Integrity and Compatibility**: PASS. Design identifies exports, workspace package outputs, README generation, package smoke tests, and semantic versioning.
