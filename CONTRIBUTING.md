# Contributing

## Region Data Changes

Region data is published through `@react-svg-worldmap/regions`, not the core `react-svg-worldmap` package. Keep the core package usable without importing target-country region data.

When adding or changing region data:

1. Record every source in `regions/src/data/starter.ts`, `regions/src/coverage.ts`, `docs/map-data-policy.md`, and `docs/map-data-overrides.json`.
2. Prefer official country or government sources when practical. If a country uses Natural Earth Admin 1 data, keep the coverage status `experimental` until a country-specific official source review is complete.
3. Preserve the generic `region` API term while storing local subdivision kinds such as state, province, territory, canton, department, emirate, or equivalent.
4. Generate SVG paths in the core map coordinate system with `yarn workspace @react-svg-worldmap/regions generate:regions`. The generator rounds region path coordinates to hundredth-pixel precision to keep the optional package compact without removing visible boundary detail.
5. Validate region names, country associations, stable IDs, source IDs, non-empty paths, source URLs, coverage counts, and review notes with `yarn workspace @react-svg-worldmap/regions test`.
6. Keep internal region borders visually distinct from country borders. The default overlay style is dotted and thematic.
7. Do not describe region boundaries as legal, diplomatic, cadastral, navigational, or authoritative.

## Required Validation

Before submitting a region-data change, run:

```sh
yarn workspace @react-svg-worldmap/regions test
yarn workspace react-svg-worldmap test
yarn typecheck
yarn lint
yarn format-check
yarn spellcheck
yarn test:coverage
yarn build
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions
```

Record package-size impact in `docs/RELEASING.md` when generated data changes.
