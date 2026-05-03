# Research: Regions Package

## Decision: Keep Region Detail In An Optional Workspace Package

Rationale: Existing consumers expect the core package to render country maps without installing extra region data. A separate `@react-svg-worldmap/regions` package preserves the country-only default, keeps region coverage opt-in, and lets future region datasets grow without forcing all consumers to carry them.

Alternatives considered:

- Bundle starter regions into `react-svg-worldmap`: rejected because it grows the default package for consumers who only need countries.
- Require consumers to fetch region data from a hosted service: rejected because the project must work without a hosted map dependency.
- Leave region detail entirely to custom consumer code: rejected because the feature requires a documented package-backed starter path.

## Decision: Use A Provider Boundary For Region Detail

Rationale: A `DetailProvider` contract lets the core renderer consume region coverage and collections without importing the optional package at runtime. The optional package and custom consumer providers share one integration boundary, which keeps fallback states and accessibility behavior centralized in the core map.

Alternatives considered:

- Directly import optional region data from the core package: rejected because it couples the core runtime to optional data.
- Add ad hoc props for each supported country: rejected because it does not scale to custom providers or future coverage.
- Render region data only in website examples: rejected because consumers need a reusable package API.

## Decision: Region Coverage Uses Explicit Status Metadata

Rationale: Region data can be complete, partial, experimental, or unavailable. Encoding that status in coverage metadata keeps limited starter coverage honest and allows applications to inspect support before requesting detail.

Alternatives considered:

- Treat presence of records as full support: rejected because starter coverage may be limited.
- Hide unsupported countries until runtime: rejected because consumers need discoverable coverage.
- Use a boolean `supported` flag only: rejected because it cannot distinguish complete, partial, and experimental coverage.

## Decision: Ready Region Detail Renders Boundaries, Labels, Visible List, Pins, And Status

Rationale: Region detail is useful only when users can see and understand the displayed regions. Boundaries and fit-aware labels provide the visual layer, the visible region list provides non-SVG discoverability, pins remain geographically anchored, and live status communicates loading/fallback transitions.

Alternatives considered:

- Render boundaries only: rejected because regions would be hard to identify accessibly.
- Always render all labels and pins: rejected because collisions and unreadable text would degrade the map.
- Suppress pins during region detail: rejected because consumer-provided geographic overlays should remain usable when fit rules allow.

## Decision: Regenerate Core Country Topology From Current Project Source Path With 6 Decimal Places

Rationale: The clarified requirement chooses the existing project source path rather than switching to a new upstream dataset. The generation workflow must raise retained source precision to at least 6 decimal places before quality-budgeted optimization and stop geometry reduction that removes visible country-level coastline, island, border, and small-country detail.

Alternatives considered:

- Switch to Natural Earth 10m Admin 0: rejected by clarification in favor of the current source path.
- Preserve exact source precision: rejected because 6 decimals provides a concrete high-detail target and avoids unbounded source noise.
- Keep the current reduced topology: rejected because it removes too much visible country-level detail.
- Use 50m source as a middle ground: rejected because the user prioritized restoring detail, not further source simplification.

## Decision: Prefer Lossless TopoJSON Encoding, Then Apply Quality-Budgeted Simplification

Rationale: TopoJSON arc sharing, delta encoding, minification, and build-time formatting reduce size without discarding geometry detail and should remain the first optimization layer. The clarified package-size requirement allows a second, quality-budgeted simplification or quantization pass when the high-detail baseline produces too large a core package, provided automated validation proves no material human-visible degradation for selected small-island, coastline, border, and small-country fixtures.

Alternatives considered:

- Continue aggressive simplification for package size: rejected because geometry quality is the primary goal.
- Store full unencoded GeoJSON in the package: rejected because TopoJSON gives meaningful lossless compression while preserving the public API.
- Quantize below the 6-decimal target: rejected because it violates the clarified precision requirement.
- Lossless-only optimization: rejected because the high-detail baseline can still produce a materially larger packed package than acceptable for a lightweight core library.

## Decision: Validate Optimization With Fixed Quality Fixtures

Rationale: "Minimal human-visible compromise" needs a repeatable proxy. The optimizer should compare the optimized topology against the high-detail baseline for country record preservation, retained precision, renderability, and fixture-level shape preservation. Fixture countries should cover small islands, complex coastlines, sensitive borders, and small countries so size reduction does not silently remove the details the regeneration was meant to restore.

Alternatives considered:

- Manual visual review only: rejected because it is subjective and not repeatable in CI.
- Global coordinate-count threshold only: rejected because it can hide localized degradation in small or complex features.
- Package-size target only: rejected because a smaller package can still produce visibly worse map quality.

## Decision: Add Map-Data Generation Validation

Rationale: The regenerated topology needs objective checks: same country record count and ISO/name coverage, at least 6 decimal places retained in generated coordinates, higher retained coordinate detail than the current bundled topology, renderable SVG paths, and recorded file-size impact. This turns "more detail" into a repeatable gate.

Alternatives considered:

- Manual visual inspection only: rejected because it is subjective and hard to repeat.
- File-size check only: rejected because package size does not prove geometry quality.
- Snapshot the entire topology only: rejected because it detects changes but does not explain whether precision and coverage requirements were met.

## Decision: Treat Country Topology Regeneration As A Map-Data Neutrality Change

Rationale: Country geometry, borders, small islands, and disputed areas can carry geopolitical meaning. Regeneration must be reviewed against `docs/map-data-policy.md` and `docs/map-data-overrides.json`, and documentation must continue to describe the default map as a thematic visualization rather than an authoritative boundary reference.

Alternatives considered:

- Treat precision-only generation as non-political: rejected because changed borders and territory visibility can alter representation.
- Block all geometry changes due to neutrality risk: rejected because the clarified feature explicitly requires restoring detail.
- Add multiple geopolitical variants: rejected because it expands scope beyond the current default map.
