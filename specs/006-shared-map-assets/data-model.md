# Data Model: Shared Core Map Assets

## Core Package Artifact

Represents the published `react-svg-worldmap` package.

**Fields**:

- `name`: package name, fixed as `react-svg-worldmap`
- `version`: package version from `lib/package.json`
- `entrypoints`: ESM, CommonJS, and TypeScript declaration files
- `files`: npm-published file list from package metadata
- `packedSize`: packed tarball size from `npm pack --dry-run`
- `unpackedSize`: unpacked package size from `npm pack --dry-run`
- `countryAssets`: included reduced and detailed country map assets
- `sourceMapPolicy`: source-map behavior applied to published JavaScript

**Validation rules**:

- Must include country-level map assets in the same package.
- Must not require a new country-map package.
- Must preserve existing public entry points and declarations.
- Must keep packed size at or below `1.2 MB`.
- Must reduce unpacked size from `10.5 MB` to `7.875 MB` or less.

## Country Map Asset

Represents a package-internal country topology payload.

**Fields**:

- `tier`: `reduced` or `detailed`
- `format`: module or data format chosen by implementation
- `path`: package-local published path
- `size`: packed and unpacked contribution
- `loader`: internal loading path used by map rendering
- `includedInPackage`: whether the asset appears in the packed package

**Relationships**:

- Belongs to one `Core Package Artifact`.
- Is consumed by the internal geometry tier loader.
- Must not become a new public package dependency.

**Validation rules**:

- Must be loaded successfully by supported ESM and CommonJS consumers.
- Must preserve country geometry content unless a map-data policy review approves a change.
- Must fail in a diagnosable way if loading fails.

## Source Map Policy

Represents the release rule for generated source maps.

**Fields**:

- `mode`: `publish-referenced-maps` or `remove-published-references`
- `publishedMapFiles`: source-map files included in the package, if any
- `javascriptReferences`: `sourceMappingURL` comments present in published JavaScript
- `consumerWarningStatus`: observed warning behavior in package smoke tests

**Validation rules**:

- Published JavaScript must not reference absent source-map files.
- If source maps are published, package-size impact must be documented.
- If source-map references are removed, debugging tradeoffs must be documented.

## Compatibility Scenario

Represents a consumer usage path that must continue to work.

**Fields**:

- `scenario`: default import, named import, CommonJS require, TypeScript declarations, website build, country-only rendering, detailed zoom rendering, optional region rendering
- `command`: validation command or smoke script
- `result`: pass/fail
- `warnings`: package, module-resolution, source-map, Browserslist, or runtime warnings

**Validation rules**:

- All required compatibility scenarios must pass before release.
- Any warning introduced by this feature must be resolved or explicitly documented with maintainer approval.

## Release Readiness Report

Represents the maintainer-facing summary needed before shipping.

**Fields**:

- `sizeBefore`: current baseline packed/unpacked sizes
- `sizeAfter`: new packed/unpacked sizes
- `packageFiles`: npm dry-run file list
- `compatibilityResults`: results for all compatibility scenarios
- `performanceObservations`: startup, zoom, and asset-loading observations
- `sourceMapBehavior`: final policy and inspection result
- `risks`: known risks and mitigations
- `semanticVersionRecommendation`: patch, minor, or major impact with rationale

**Validation rules**:

- Must include at least three risk areas: consumer module compatibility, map asset loading behavior, and debugging/source-map behavior.
- Must state whether the implementation is shippable or requires follow-up.
