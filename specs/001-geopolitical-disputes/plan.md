# Implementation Plan: Neutral Geopolitical Disputes

**Branch**: `001-geopolitical-disputes` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)

## Summary

Add a neutral, auditable Tier 1 disputed-territories layer for the published React SVG world map package. The implementation will extend the existing map-data policy and overrides register, add package-owned dispute metadata for Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, and Kosovo, expose that metadata through documented package exports and render contexts, and provide default dispute-aware display guidance without introducing hosted map services, localization variants, or heavyweight runtime dependencies.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18 development baseline, Node >=18  
**Primary Dependencies**: Existing package dependencies: React, d3-geo, topojson-client, react-path-tooltip, tslib  
**Storage**: Checked-in package source files plus documented JSON policy register; no external storage  
**Testing**: Vitest, React Testing Library, package build, lint, format check, spellcheck, README generation check  
**Target Platform**: Published npm library consumed by browser-based React applications  
**Project Type**: Yarn workspace library package with documentation website  
**Performance Goals**: Dispute metadata lookup is constant-time per rendered region and adds no measurable interactive delay for the existing world map render path  
**Constraints**: Preserve existing ordinary country rendering by default; no hosted map API; no country-specific localized map variants; no new runtime dependency unless separately justified  
**Scale/Scope**: Initial dataset is exactly six Tier 1 disputes, with policy structure supporting future Tier 2 and Tier 3 additions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Open Source Stewardship**: PASS. Plan keeps all policy, metadata, contracts, and docs in the repository and requires public API changes to be typed and documented.
- **Political and Geopolitical Neutrality**: PASS. Feature directly affects disputed territories and will update `docs/map-data-policy.md` and `docs/map-data-overrides.json`; Tier 1 classifications must be auditable and non-endorsement language must remain explicit.
- **Quality Gates**: PASS. Plan includes unit tests for metadata, render context behavior, default dispute styling behavior, generated documentation checks, build, lint, type checking, spellcheck, and package coverage.
- **Accessible, Lightweight React Library**: PASS. Dispute display must preserve SVG titles, tooltips, keyboard behavior, and existing accessibility behavior; no hosted map service or heavyweight dependency is planned.
- **Release Integrity and Compatibility**: PASS. Plan identifies package export, README generation, documentation, changeset, semantic versioning, and package smoke validation impacts.

## Project Structure

### Documentation (this feature)

```text
specs/001-geopolitical-disputes/
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
├── map-data-policy.md
└── map-data-overrides.json

lib/
├── README.md
├── package.json
├── scripts/
│   └── generate-readme.mjs
└── src/
    ├── __tests__/
    ├── constants.ts
    ├── disputes.ts
    ├── index.tsx
    └── types.ts

website/
└── docs or existing generated documentation references
```

**Structure Decision**: Use the existing `lib` package as the implementation surface, keep governance docs in `docs/`, and add a small package-owned `lib/src/disputes.ts` metadata module rather than introducing a new workspace or generated data pipeline. Existing topology remains the base map; dispute metadata and rendering guidance are layered on top.

## Complexity Tracking

No constitution violations are planned.

## Phase 0: Research Summary

See [research.md](./research.md). Key decisions:

- Use the existing `docs/map-data-policy.md` and `docs/map-data-overrides.json` as governance sources.
- Add typed Tier 1 dispute metadata in the package source for consumer access.
- Preserve ordinary map rendering by default and expose opt-in dispute-aware styling through typed context and helper metadata.
- Defer Tier 2, Tier 3, localized map variants, and precise disputed boundary geometry.

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), and [quickstart.md](./quickstart.md).

Post-design Constitution Check:

- **Open Source Stewardship**: PASS. Public types, data shape, and contributor policy are documented.
- **Political and Geopolitical Neutrality**: PASS. Tier 1 cases are explicitly scoped and tied to the policy/overrides register.
- **Quality Gates**: PASS. Quickstart includes verification commands and tests required before implementation completion.
- **Accessible, Lightweight React Library**: PASS. Design uses existing SVG paths and context functions without adding services or dependencies.
- **Release Integrity and Compatibility**: PASS. Design calls for README regeneration, package export review, changeset, and smoke validation.
