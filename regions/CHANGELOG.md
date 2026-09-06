# Changelog

All notable changes to `@react-svg-worldmap/regions` will be documented in this file.

## 2.1.0 - 2026-05-10

### Added

- Published optional first-level region collections for 23 target countries.
- Added coverage metadata, target-country exports, and `createRegionsDetailProvider()` for use with `react-svg-worldmap`.
- Added package-local MIT license, contributing guidance, code of conduct, and release validation coverage.

### Changed

- Aligned the optional regions package version with `react-svg-worldmap@2.1.0`.
- Region collections are loaded in per-country chunks so consumers do not parse every supported country during country-only rendering.

### Fixed

- Preserved the `loadRegionCollection(countryCode)` promise-returning API for unsupported country codes. Missing collections now resolve to `undefined` instead of returning `undefined` synchronously.
