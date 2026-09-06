# Contributing to @react-svg-worldmap/regions

Thanks for improving the optional regions package. This package contains reviewed, country-scoped first-level region data for `react-svg-worldmap`; the core package must continue to work without importing it.

## Region Data Changes

Before adding or changing region data:

1. Review the root [`CONTRIBUTING.md`](../CONTRIBUTING.md) and [`docs/map-data-policy.md`](../docs/map-data-policy.md).
2. Record sources in the generated collection metadata, coverage metadata, map-data policy docs, and any needed overrides.
3. Prefer official country or government sources when practical.
4. Preserve the generic `region` API term while storing local subdivision kinds such as state, province, territory, canton, department, emirate, or equivalent.
5. Keep internal region borders visually distinct from country borders. The default overlay style is dotted and thematic.
6. Do not describe region boundaries as legal, diplomatic, cadastral, navigational, or authoritative.

## Validation

Run the package checks before submitting a region package change:

```sh
yarn workspace @react-svg-worldmap/regions test
yarn workspace @react-svg-worldmap/regions build
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions
```

For generated geometry or source-policy changes, also run the repository-level checks listed in the root [`CONTRIBUTING.md`](../CONTRIBUTING.md).
