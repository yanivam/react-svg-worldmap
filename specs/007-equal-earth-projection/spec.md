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
2. **Given** the same props, **When** compared with the Mercator render, **Then** the SVG width, height, and layout transform are identical.

---

### User Story 2 - Existing maps do not change (Priority: P1)

A developer who upgrades to 2.3.0 without touching their code sees exactly the same map.

**Why this priority**: The change ships in a minor release, so it must be fully backward compatible.

**Independent Test**: The existing default-render snapshot and all existing tests pass unchanged.

**Acceptance Scenarios**:

1. **Given** a WorldMap with no `projection`, **When** it renders, **Then** output matches the 2.2.0 default-render snapshot (path hashes included).
2. **Given** `projection="mercator"`, **Then** output equals the render without the prop.
3. **Given** every existing website example, **When** the site is built and loaded, **Then** each renders with no console errors.

---

### User Story 3 - Switch projections at runtime (Priority: P2)

A website example offers a radio group (Mercator / Equal Earth) that re-renders the same map.

**Why this priority**: Shows the difference between the projections and how to use the prop.

**Independent Test**: Open `/examples/projections` and switch between the options.

**Acceptance Scenarios**:

1. **Given** the Projections example, **When** the user selects Equal Earth, **Then** the map geometry changes; selecting Mercator restores the original geometry.

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
- **FR-003**: Equal Earth is fitted once (cached) to the bundled countries inside the existing 960 × 720 viewport, full width, vertically centred.
- **FR-004**: Export the `ProjectionOption` type and the `projectionOptions` list.
- **FR-005**: Country paths and disputed-territory paths use the selected projection.
- **FR-006**: Website example `/examples/projections` with a projection switch.

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

- Sphere outline (graticule / ocean shape) for Equal Earth.
- A height ratio adapted to Equal Earth (about 2:1) instead of the fixed 4:3 viewport, which leaves empty space above and below.
- Other projections (e.g. Natural Earth, Robinson) or a custom projection function.
- Making Equal Earth the default (would be a major release).

## Assumptions

- The rendering viewport, size presets and `heightRatio` stay as they are.
- Snapshot path hashes are generated on x86-64 (as in CI); arm64 machines produce slightly different floating-point output for the same geometry.
