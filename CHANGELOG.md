# Changelog

All notable changes to this project will be documented in this file.

The recent history follows a Keep a Changelog style. Older `1.x` entries are preserved below as legacy release notes.

## Unreleased

### Added

- A neutral map data policy for the bundled world map, including a documented source hierarchy and a maintainer-facing overrides register for sensitive geopolitical cases.
- A generated package README workflow that keeps `lib/README.md` aligned with the canonical package-facing sections in the root `README.md`.
- Additional regression tests for interaction, hover/focus behavior, and responsive utilities.

### Changed

- Rewrote the root and package READMEs in a more consistent product voice, with npm installation guidance, package requirements, accessibility notes, data source attribution, and the new neutrality policy surfaced near the top.
- Updated CI and release validation to run unit tests, coverage, package README generation checks, and smoke validation for packaged consumer imports.
- Enforced coverage thresholds above 90% for statements, branches, functions, and lines.
- Cleaned up lint warnings and test-run noise so routine verification output is easier to trust and review.

### Fixed

- Ensured the npm package README is preserved during publish so the policy and package documentation shown on npm stay in sync with the maintained package README.
- Fixed recursive synthetic hover event behavior for keyboard focus handling in `Region`, which had been causing noisy test output and unnecessary event churn.
- Formatted docs and verification-related files so the release validation flow passes cleanly.

## 2.0.1 - 2026-03-22

### Added

- WCAG 2.2 AA-oriented accessibility improvements across the package and demo site, including SVG labeling, keyboard interaction, richer focus support, and improved landmark structure in the website.
- A full Vitest and React Testing Library suite covering constants, utilities, `Region`, shared components, and `WorldMap`.
- A migration script for regenerating the bundled TopoJSON world data.

### Changed

- Replaced the bundled GeoJSON map source with a TopoJSON representation to reduce package size.
- Reduced published package size by excluding unnecessary files from the npm package output.
- Expanded the project README with development and accessibility guidance.

### Removed

- Deleted dead code and stale deprecated pieces, including the old tooltip component and unused props or imports.

## 2.0.0 - 2026-02-28

### Added

- Stable `2.0.0` release packaging and release automation.
- Pack-and-smoke validation for published package consumption.

### Changed

- Finalized the v2 release workflow, including trusted publishing / OIDC-based npm release automation.
- Fixed responsive sizing behavior, tooltip click handling, and smoke-test packaging issues as part of the stabilization work for `2.0.0`.

## 2.0.0-beta.1

### Added

- Smoke-test coverage for packaged CJS and ESM consumption paths.
- Release workflow improvements around validation and package publishing.

### Changed

- Fixed responsive sizing thresholds and `ResizeObserver`-driven resizing behavior as part of the v2 stabilization work.
- Improved tooltip click handling and CSP-friendlier styling during the pre-stable v2 hardening cycle.

## 2.0.0-alpha.1

### Added

- Support for string-valued map data.
- Exported region list support and stronger type-aware linting.

### Changed

- Upgraded dependencies and continued the move toward a cleaner v2 development toolchain.
- Simplified examples and improved linting, spellcheck, and CI coverage for the evolving v2 codebase.

## 2.0.0-alpha.0

### Added

- The initial v2 alpha release series with the new website-based documentation direction.
- `textLabelFunction` callback support.
- Double-click zoom interactions.
- Exported ISO code typing.
- Optional numeric `size` values.
- SSR-compatible rendering improvements.

### Changed

- Moved examples and documentation to the website hosted on GitHub Pages.
- Renamed the default branch from `master` to `main`.

## 2.0 prerelease series

Between the first `2.0.0-alpha` cut and the final `2.0.0` release, the project went through several additional untagged prerelease iterations that focused on:

- repo restructuring and the move to the current workspace layout
- API cleanup and file splitting
- website and documentation rebuilds
- module format fixes for CJS / ESM consumers
- packaging, smoke-test, and release automation stabilization
- responsive sizing, tooltip interaction, and import-path fixes
- dependency upgrades, linting, spellcheck, and general release hardening

## Legacy Releases

### 1.1.0

- Refactor build and dependency cleanup
- Moved code to lib folder

### 1.0.43

- Restructured file system to enable JavaScript and TypeScript usage and ability (see README.md for usage in JS vs TS)

### 1.0.42

- Deprecated marker functionality to fix improper highlight bug.
- Erased console.log

### 1.0.41

- Responsive size option for different sized layouts (mobile/desktop/tablet/etc...)

### 1.0.40

- Updated tooltip to allow for multiline functionality
- Added size xxl which supports 1200x1200 map sizes

### 1.0.39

- Added README gif and fixed errors in README
- Fixed errors in the localization example due to a mismatch of data and title

### 1.0.38

- Contribution thanks to [GoncaloGarcia]: https://github.com/GoncaloGarcia
- Allow setting background color and strokeOpacity as props

### 1.0.37

- Onclick callback as requested, for instructions on usage see README.md, for an example look at the example folder under onclick-example.

### 1.0.36

- README.md typo

### 1.0.35

- Added localization ability and tooltip text customization through a callback function called tooltipTextFunction
- Added example of how to use to examples

### 1.0.34

- Restored JSON to previous implementation so that it works with the code I wrote and highlights the right things

### 1.0.33

- Uglified our exported files, looking for change in size of file

### 1.0.32

- Minify geo json.

### 1.0.31

- Fixed bug with new data where some countries did not display properly

### 1.0.30

- Tried to reduce the size of countries.geo.json even more by changing the structure of the file and adding the extra properties programmatically.
- Changed names so they have spaces in between multiple words ex. UnitedStates -> United States

### 1.0.29

- Reduce the size of the countries.geo.json by limiting number precision to 3 digits

### 1.0.28

- Marker update, changed the style of markers and updated them to be circular because I believe that those would be more optimal for small countries rather than a larger icon like the old version

### 1.0.27

- Bug fix, console.log that was forgotten, solved issue

### 1.0.26

- Bug fix returning functionality due to the default styling function

### 1.0.25

- Renamed the islands to avoid confusion
- Added user control over map styling using stylingFunction (see README.md file for more detail)

### 1.0.24

- Fixed dependency bug for d3-geo not being a module
- Added marker type that is still in progress in beta (see README.md file for more detail)

### 1.0.23

- On hover - refine the highlighting.

### 1.0.22

- On hover - add highlight to border of current country by making the stroke 2 instead of 1.
