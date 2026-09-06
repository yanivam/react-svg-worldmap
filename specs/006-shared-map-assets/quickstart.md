# Quickstart: Shared Core Map Assets

## Focused Validation

Run the core behavior and package-surface checks first:

```bash
yarn workspace react-svg-worldmap test WorldMap.test.tsx geometry-tiers.test.ts zoom-performance.test.tsx country-hit-targets.test.tsx
yarn workspace @react-svg-worldmap/regions test
NO_UPDATE_NOTIFIER=1 yarn build:website
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
```

Inspect the core dry-run output and record:

- packed size
- unpacked size
- file count
- files that contain reduced and detailed country topology
- whether any published JavaScript references missing `.map` files

## Package Smoke Checks

Validate public consumption paths after building:

```bash
NO_UPDATE_NOTIFIER=1 yarn build
node lib/scripts/smoke-cjs.cjs
node lib/scripts/smoke-esm.mjs
```

The smoke checks must prove:

- default import still resolves
- named exports still resolve
- CommonJS require still resolves
- TypeScript declarations are emitted and included
- country-level maps do not require a new package

## Source-Map Inspection

After the package build, inspect published JavaScript outputs:

```bash
rg "sourceMappingURL" lib/dist
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
```

If JavaScript files contain `sourceMappingURL` comments, the referenced `.map` files must be included intentionally in the package. Otherwise the release policy should remove the comments from published JavaScript.

## Full Pre-Release Validation

Run the full validation set before declaring the implementation shippable:

```bash
yarn workspace react-svg-worldmap test
yarn workspace @react-svg-worldmap/regions test
yarn typecheck
yarn lint
yarn format-check
yarn spellcheck
yarn test:coverage
NO_UPDATE_NOTIFIER=1 yarn build
NO_UPDATE_NOTIFIER=1 yarn build:website
yarn generate:readme
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions
```

## Release Readiness Notes

Before release, document:

- before and after core package packed size
- before and after core package unpacked size
- package file list and largest files
- import/require/type smoke results
- country-only, detailed zoom, and optional region test results
- source-map policy and inspection result
- startup, zoom, and asset-loading performance observations
- known risks, mitigations, and follow-up work
- semantic-version recommendation
