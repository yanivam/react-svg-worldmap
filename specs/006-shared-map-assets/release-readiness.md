# Release Readiness: Shared Core Map Assets

## Baseline

- Core package dry-run command: `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`
- Baseline package: `react-svg-worldmap@2.1.0`
- Baseline packed size: `1.2 MB`
- Baseline unpacked size: `10.5 MB`
- Baseline file count: `6`
- Baseline largest package files:
  - `dist/index.cjs`: `5.2 MB`
  - `dist/index.js`: `5.2 MB`
  - `dist/index.d.cts`: `14.7 kB`
  - `dist/index.d.ts`: `14.7 kB`
  - `README.md`: `10.3 kB`
  - `package.json`: `2.3 kB`
- Baseline local `lib/dist` files:
  - `dist/index.cjs.map`: `15 MB`
  - `dist/index.js.map`: `15 MB`
  - `dist/index.cjs`: `5.0 MB`
  - `dist/index.js`: `5.0 MB`
- Baseline published JavaScript source-map references:
  - `lib/dist/index.cjs`: has `//# sourceMappingURL=index.cjs.map`
  - `lib/dist/index.js`: has `//# sourceMappingURL=index.js.map`

## Baseline Performance Notes

- Smooth zoom tests already cover immediate visual feedback before deferred detail work.
- Existing representative targets remain: typical visible feedback within `250 ms`, worst-case visible completion within `500 ms`.
- The current artifact layout duplicates large topology payloads in both public module outputs; this primarily affects package size and parse/load risk rather than map geometry correctness.

## Shared Asset Strategy

- Status: implemented.
- Reduced and detailed country topology remain inside the core `react-svg-worldmap` package.
- Shared published asset paths:
  - `map-assets/countries-reduced.topo.cjs`
  - `map-assets/countries-detailed.topo.cjs`
- Source/test asset paths:
  - `lib/src/map-assets/countries-reduced.topo.cjs`
  - `lib/src/map-assets/countries-detailed.topo.cjs`
- Metadata is generated separately as small TypeScript modules under `lib/src/map-assets/*.metadata.ts` so importing metadata does not pull full topology payloads into the public entry bundles.
- ESM and CommonJS public entry files both reference the same package-local `.cjs` assets. No new country-map package, hosted asset, or consumer configuration is required.
- Source-map policy: published JavaScript intentionally has no `sourceMappingURL` comments because source maps are not included in the npm package.

## Validation Results

- `NO_UPDATE_NOTIFIER=1 yarn workspace react-svg-worldmap build`: PASS.
  - `dist/index.js`: `57.9 kB`
  - `dist/index.cjs`: `60.6 kB`
  - No `sourceMappingURL` comments in published JavaScript.
- `node lib/scripts/inspect-package-artifacts.mjs`: PASS.
  - Estimated unpacked bytes: `4,164,075`
  - Estimated packed bytes: `588,839`
  - Shared assets present and largest files are the two topology assets.
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib`: PASS.
  - Packed size: `588.4 kB`
  - Unpacked size: `4.2 MB`
  - File count: `8`
  - Included files: README, package metadata, ESM/CJS entry files, declarations, and two `map-assets/*.cjs` topology assets.
- `node lib/scripts/smoke-esm.mjs`: PASS.
  - Default export resolves as a function.
  - Named `regions` export resolves.
  - Shared country assets are present.
  - Published JavaScript has no source-map references.
- `node lib/scripts/smoke-cjs.cjs`: PASS.
  - CommonJS require resolves to the component.
  - Shared country assets are present.
- `yarn compare:distributions`: PASS.
  - Built ESM and CommonJS entry points expose matching named exports.
  - Both formats share the same `regions` export.
  - Static render output for identical map props is byte-for-byte identical.
- `yarn workspace react-svg-worldmap test WorldMap.test.tsx geometry-tiers.test.ts zoom-performance.test.tsx country-hit-targets.test.tsx Region.test.tsx`: PASS.
  - 5 files, 96 tests.
- `yarn workspace react-svg-worldmap test`: PASS.
  - 20 files, 231 tests.
- `yarn workspace @react-svg-worldmap/regions test`: PASS.
  - 3 files, 18 tests.
- `yarn typecheck`: PASS.
- `yarn lint`: PASS after excluding generated metadata assets and removing a stale eslint-disable.
- `yarn format-check`: PASS after formatting the artifact inspection script and 006 spec/task docs.
- `yarn spellcheck`: PASS after adding project words for the new package-artifact terminology.
- `yarn test:coverage`: PASS.
  - Statements: `99.09%`
  - Branches: `93.45%`
  - Functions: `96.55%`
  - Lines: `99.09%`
- `NO_UPDATE_NOTIFIER=1 yarn build:website`: PASS.
  - No Browserslist warning observed.
- `NO_UPDATE_NOTIFIER=1 yarn build:website` after the release-shape example marker update: PASS.
  - No Browserslist warning observed.
- `NO_UPDATE_NOTIFIER=1 yarn build`: PASS.
  - Core, regions, and website builds completed.
- `yarn generate:readme`: PASS.
- `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions`: PASS.
  - Packed size: `1.3 MB`
  - Unpacked size: `8.5 MB`
  - File count: `56`
- Optional regions source-map policy: PASS.
  - `rg "sourceMappingURL" regions/dist` produced no matches after disabling region package source maps.
- Warning review: PASS. Yarn cache-location warnings were emitted because the preferred user cache folder is not writable in this sandbox; no package, build, lint, typecheck, Browserslist, source-map, dependency, or runtime warning introduced by this feature remains unresolved.
- Geopolitical neutrality review: PASS. The implementation copies existing generated topology bytes into package-local assets and does not change map geometry source files, country names, country codes, disputed areas, or boundary policy.
- Final diff review: PASS. Public API imports remain unchanged, optional regions remain separate, package contents now include two core `map-assets` files, docs explain the package-size/source-map policy, and generated README output was refreshed.

## Risks And Mitigations

- Consumer module compatibility: ESM import and CommonJS require both resolve against the built package. Mitigation: keep smoke scripts in the release path and run them after every package build.
- Map asset loading behavior: ESM and CommonJS now load package-local `.cjs` assets. Mitigation: package inspection fails if assets are missing, and geometry tests validate reduced and detailed tier loading.
- Debugging/source-map behavior: published JavaScript no longer references maps. Mitigation: document the policy; source maps are omitted intentionally to avoid missing-source-map warnings and large published debug artifacts.
- Startup and zoom responsiveness: the reduced tier still loads at initial import and detailed topology remains behind the `2x` path. Mitigation: zoom performance tests continue to validate immediate feedback before deferred detail settles.
- Bundler compatibility: package-local `.cjs` assets are implementation details that modern bundlers and Node can resolve from the built entry files. Mitigation: website build remains part of final validation.
- Geopolitical/map data neutrality: topology bytes are copied from the existing generated files; no country names, codes, borders, or disputed-territory policy changed. Mitigation: final diff review must confirm generated geometry source files are not modified.

## Semantic Version Recommendation

- Minor release is appropriate if this ships with `2.1.0`: public imports, country rendering, and optional regions remain backward compatible, but the package artifact layout changes in a consumer-visible way for tooling and package inspection.
