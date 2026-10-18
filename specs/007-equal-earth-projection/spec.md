# Feature Specification: Opt-in Equal Earth projection

**Feature Branch**: `feat/equal-earth-projection`  
**Created**: 2026-10-17  
**Status**: Implemented (target release 2.3.0)  
**Issue**: [#196](https://github.com/yanivam/react-svg-worldmap/issues/196)  
**Input**: User description: "Support Equal Earth as an opt-in option. Include an example that switches between the two projections. Keep all existing examples working."

## Background

The map is drawn with d3's default Mercator projection. Mercator inflates areas far from the equator: Greenland (2.2M km²) is drawn larger than DR Congo (2.3M km²) and about as large as Africa (30.4M km²). The Equal Earth projection (published 2018) is equal-area. The African Union adopted it as its standard world map in February 2026, and the UN General Assembly's non-binding "Correct the Map" resolution (4 September 2026) recommends equal-area maps such as Equal Earth for general-purpose world maps. `d3-geo` (already a dependency) ships `geoEqualEarth`, so no new dependency is needed.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Render the map in Equal Earth (Priority: P1)

A developer passes `projection="equalEarth"` and gets the same component (data coloring, tooltips, callbacks, sizing) drawn in Equal Earth.

**Why this priority**: This is the feature itself.

**Independent Test**: Render `<WorldMap data={data} projection="equalEarth" />` and compare it with the Mercator render.

**Acceptance Scenarios**:

1. **Given** a WorldMap with `projection="equalEarth"`, **When** it renders, **Then** every country is drawn, and Greenland's projected area is smaller than DR Congo's.
2. **Given** the same props, **When** compared with the Mercator render, **Then** the SVG width is identical and the height is width / 2 (2:1 frame, matching the projection) instead of width × 3/4.

---

### User Story 2 - Existing maps do not change (Priority: P1)

A developer who upgrades to 2.3.0 without touching their code sees exactly the same map.

**Why this priority**: The change ships in a minor release, so it must be fully backward compatible.

**Independent Test**: The default-render snapshot and all existing tests pass. The snapshot hashes were regenerated once with 0.1 rounding (so they match on arm64 and x86); the path data behind them is unchanged.

**Acceptance Scenarios**:

1. **Given** a WorldMap with no `projection`, **When** it renders, **Then** the path data is identical to 2.2.0. The default-render snapshot hashes were regenerated with coordinates rounded to 0.1, and regenerating them from the 2.2.0 code gives a byte-identical snapshot.
2. **Given** `projection="mercator"`, **Then** output equals the render without the prop.
3. **Given** every existing website example, **When** the site is built and loaded, **Then** each renders with no console errors.

---

### User Story 3 - Equal Earth example (Priority: P2)

The website example "Equal Earth" shows a world population map in Equal Earth, with a switch to Mercator and a checkbox for the disputed-territory overlay.

**Why this priority**: Shows the difference between the projections and how to use the prop.

**Independent Test**: Open `/examples/equal-earth` and switch between the options.

**Acceptance Scenarios**:

1. **Given** the Equal Earth example, **When** the user selects Mercator, **Then** the map geometry and frame change; selecting Equal Earth restores them.
2. **Given** the overlay checkbox is on, **When** the projection changes, **Then** the disputed territories are drawn in the selected projection.

---

### Edge Cases

- The `showDisputedTerritories` overlay is projected with the same projection as the countries.
- `richInteraction` zoom (double-click, `+`/`-`) behaves the same.
- `textLabelFunction` returns SVG pixel positions; labels placed for Mercator are not re-projected (documented).
- SSR: projection fitting is pure computation, no DOM access.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `Props.projection?: "mercator" | "equalEarth"`, default `"mercator"`.
- **FR-002**: Mercator keeps d3 defaults (scale 961 / 2π ≈ 152.95, translate [480, 250]) so default output is unchanged.
- **FR-003**: Equal Earth is fitted once (cached) to the whole globe inside a 960 × 480 viewport (8-unit margin), full width, vertically centred, and the outline of the globe is drawn behind the countries in `borderColor` (hidden from assistive technology). The SVG height is width / 2 for Equal Earth and width × 3/4 for Mercator.
- **FR-004**: Export the `ProjectionOption` type and the `projectionOptions` list.
- **FR-005**: Country paths and disputed-territory paths use the selected projection.
- **FR-006**: Website example "Equal Earth" (`/examples/equal-earth`) with a projection switch and a disputed-territory overlay toggle.

### Constitution Requirements _(mandatory)_

- **CR-001**: MIT distribution unchanged. Public API additions: `projection` prop, `ProjectionOption`, `projectionOptions`. Documented in README, `docs/api.md`, `docs/customization.md`, `docs/examples.md`.
- **CR-002**: Map data, names, codes, boundaries, and disputed areas are not changed. Only the projection of the same geometry changes. No change to `docs/map-data-policy.md` or `docs/map-data-overrides.json`.
- **CR-003**: New tests in `lib/src/__tests__/projection.test.tsx` (module, prop, callbacks, overlay, interaction, snapshot). Lint, format, spellcheck, typecheck, build, pack, CJS/ESM smoke, and website build must pass.
- **CR-004**: No new dependency. SVG accessibility unchanged. Package size change ≤ 2%.
- **CR-005**: Minor release 2.3.0 (additive). Changeset added; `lib/README.md` regenerated.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Default-render snapshot unchanged.
- **SC-002**: All lib tests pass; new code fully covered.
- **SC-003**: All 11 website examples load with zero console errors.
- **SC-004**: npm package size grows by < 2%.

## Out of scope / follow-ups

- Graticule lines (latitude / longitude) for Equal Earth.
- Other projections (e.g. Natural Earth, Robinson) or a custom projection function.
- Making Equal Earth the default (would be a major release).

## Assumptions

- Size presets and the Mercator 4:3 frame stay as they are; only Equal Earth uses a 2:1 frame.
- Snapshot path data is rounded to 0.1 before hashing, so the snapshots match on arm64 and x86-64 even though their floating-point output differs slightly.
