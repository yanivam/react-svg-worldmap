# Zoom Drill-Down Design

Date: 2026-04-05 Status: Draft for review Branch: `codex/zoom-drilldown-architecture`

## Summary

Add a zoom-enabled drill-down experience to `react-svg-worldmap` while preserving the package's core identity:

- small and simple by default
- no required network access
- minimal package size for the base use case
- accessible interaction model that meets WCAG 2.2 AA

The first iteration focuses on interactive exploration only. Users should be able to focus a country, zoom into it, and, when optional detail data is installed, reveal state/province boundaries for that country. The design must leave room for future region-level storytelling overlays, remote data loading, and city layers without forcing a public API redesign later.

## Goals

- Preserve the current world-map-first experience for consumers who do not opt into drill-down.
- Support guided drill-down from country level to state/province level.
- Keep the base package close to its current size by keeping detailed geography outside the core package.
- Require no network access for the first shipped drill-down iteration.
- Build the architecture so future remote/static detail packs can be added without changing the mental model.
- Treat WCAG 2.2 AA compliance as part of the feature, not a later enhancement.

## Non-Goals

- Shipping a city layer in the first iteration.
- Turning the project into a general-purpose hosted map platform.
- Requiring remote fetching or hosted services for core drill-down functionality.
- Solving all custom data-provider use cases in the first iteration.
- Adding free-pan/free-zoom as the primary interaction mode.

## Updated Phase 1 Decisions

- Use `detailLevel` instead of `precision`.
- Default to `detailLevel="countries"` for backward compatibility.
- Treat `detailLevel="regions"` as opt-in.
- If regions detail is requested but the regions package/provider is unavailable, fall back to countries and log a console warning.
- Keep capitals and largest cities out of phase 1.
- Include collision-aware default labels in phase 1.
- Show region labels only after drill-down into a country.

## User Experience

### Default Behavior

Consumers who continue using the package as a world map should not need to change anything. The default usage remains a static or interactive world map at country level.

### Drill-Down Behavior

For consumers who enable drill-down:

- users can select a country and focus into it
- the map zooms to the selected country
- if region data exists for that country, state/province boundaries are displayed
- users can move back up to the world level
- users can reset the interaction to its initial state

The primary interaction model is guided focus and drill-down. Click/tap is supported, but the same interaction must be available through keyboard and explicit controls.

### Accessible Interaction Model

To satisfy WCAG 2.2 AA expectations, drill-down cannot rely on pointer gestures alone. The feature must include:

- keyboard-operable country selection and drill-down
- built-in controls for `zoom in`, `zoom out`, `back`, and `reset`
- predictable focus management when the active scope changes
- status announcements when drill-down state changes
- strong visible focus treatment
- a built-in visible-region list for the currently focused scope so the user is not forced to interact only through SVG hit targets
- reduced-motion-friendly behavior for zoom transitions

### Failure and Fallback UX

The component must remain useful when deeper data is unavailable. Supported fallback states include:

- drill-down disabled
- no provider configured
- provider configured but no region coverage for the selected country
- provider loading
- provider failure

The component should communicate these states clearly and continue to function as a world map.

## Packaging Strategy

Phase 1 will use an npm-first packaging model.

Packages:

- `react-svg-worldmap`
- `@react-svg-worldmap/regions`

The base package owns the runtime and interaction model. The optional regions package owns the normalized global state/province dataset.

### Why This Direction

- It preserves the package's no-network-needed story.
- It avoids hosting costs and runtime fetch failures in the first iteration.
- It keeps heavy geography data out of the base package.
- It still allows the architecture to evolve into a hybrid local-plus-remote model later.

### Explicitly Rejected for Phase 1

- remote-first region delivery
- one npm package per country
- city data in the first release

## Package Responsibilities

### `react-svg-worldmap`

The core package should own:

- world map rendering
- zoom and drill-down state management
- accessibility behavior and semantics
- keyboard navigation
- focus management
- live announcements
- built-in drill-down controls
- built-in visible-region list
- provider interface and loading lifecycle
- fallback states when detail data is unavailable

### `@react-svg-worldmap/regions`

The optional regions package should own:

- normalized global state/province data
- metadata describing country coverage
- package-backed provider helpers or data adapters that can satisfy the core provider interface

## Data Provider Architecture

The core package must depend on a provider abstraction rather than directly depending on a specific delivery mechanism.

### Design Rule

The renderer should not care whether detail data comes from:

- an installed npm package
- a consumer-supplied module
- a future remote/static asset source

It should only care that a requested detail layer resolves into normalized data for the current scope.

### Provider Responsibilities

A provider is responsible for:

- reporting whether coverage exists for a requested layer and scope
- loading normalized detail data for that scope
- surfacing loading, unavailable, and error outcomes in a consistent way

### Why the Provider Must Be Async from Day One

Even in the npm-first version, the provider model should be asynchronous:

- it mirrors the future remote-loading model
- it allows bundler-based lazy loading of installed detail packs
- it forces the core UX to correctly handle loading and unavailable states from the start

## Normalized Data Model

The first detail layer is `regions`.

At a high level, the core should consume normalized region data rather than raw source-specific shapes. Each region entry should provide enough information for rendering, labeling, navigation, and focus targeting.

### Country-Scope Detail Record

Each country-level detail payload should include:

- parent country code
- coverage metadata
- a collection of regions
- optional preferred viewport information for fit-to-scope behavior

### Region Record

Each region entry should include:

- stable region id
- parent country code
- human-readable region name
- optional short label or localized label
- geometry payload
- optional centroid and/or bounding box metadata
- optional ordering metadata for visible list rendering

For labeling quality, the preferred detail-pack shape should eventually expose enough geometry metadata for geometry-aware label validation, not just centroids.

This model is intentionally neutral so that future providers can transform different source formats into the same runtime shape.

## Interaction Model

### Levels

The first version supports two navigable levels:

- world
- country-focused with region detail

Cities are intentionally out of scope for this phase.

### Primary Navigation Path

The recommended primary flow is:

1. User focuses or selects a country.
2. User activates drill-down through click/tap, keyboard, or an explicit control.
3. The component zooms to that country.
4. If region data is available, the component renders the state/province layer and synchronizes the visible-region list.
5. User can navigate back to the world or reset the experience.

### Built-In Controls

The first iteration should include built-in controls for:

- zoom in
- zoom out
- back
- reset

Even if some controls overlap conceptually, they are useful for accessibility and predictability.

### Visible-Region List

The visible-region list is required in phase 1. It should:

- reflect the currently focused scope
- surface the regions currently available in the detailed layer
- remain synchronized with SVG interactions
- provide an accessible non-SVG path for navigation and selection

## Accessibility Requirements

The design target is WCAG 2.2 AA at the component level.

The drill-down feature should explicitly cover:

- keyboard operation
- focus order and focus restoration
- live region announcements for scope changes
- visible focus indicators
- sufficient control target sizes
- reduced-motion handling
- equivalent functionality without pointer gestures

Because SVG regions may be visually small or irregular, the visible-region list is a core accessibility mechanism, not a secondary enhancement.

## Performance and Size Strategy

The current package includes country topology data inline. The drill-down architecture should preserve that philosophy for the world layer while avoiding a large increase in the base package size.

### Expected Package Shape

Target package layout:

- `react-svg-worldmap`: base runtime and world topology
- `@react-svg-worldmap/regions`: one global regions pack

### Rough Size Direction

These are directional estimates only and should be validated later:

- core package: small increase over current size for drill-down runtime and accessibility support
- global regions package: materially larger than core, but still manageable as a separate optional install

The design assumes that splitting detailed geography out of the core package is the primary protection against unacceptable bundle growth.

## Labeling Inspirations

Phase 1 borrows these ideas:

- progressive disclosure by zoom and scope
- geometry-aware collision avoidance
- stable label visibility
- priority ordering with country labels ahead of region labels
- labels may span same-feature water when that improves readability
- labels must not overlap land geometry from another visible feature

### Phase 1 Label Placement Rules

The phase-1 labeler should optimize for legibility rather than strict polygon containment.

Accepted behavior:

- a label may extend across ocean or empty space that still belongs to the same feature context
- a multi-part country can keep one label tied to its primary visible landmass
- the runtime may try several nearby fallback positions before suppressing a label

Rejected behavior:

- a label may not overlap another visible country or region's land geometry
- a label may not be shown if no nearby position satisfies viewport, decluttering, and foreign-geometry checks

At implementation time, the preferred algorithm is:

1. Find a strong interior anchor for the feature's main visible polygon.
2. Measure the rendered label box.
3. Score a small set of nearby fallback positions.
4. Reject any candidate whose label box overlaps foreign land geometry.
5. Prefer candidates with stronger own-feature coverage and better decluttering outcomes.

Phase 1 does not attempt:

- curved labels
- dense city labeling
- continuous tile-map behavior

## Deferred Work

The following items are intentionally postponed, ordered by importance and likely impact on package usefulness:

1. Remote/static pack loading.
2. City layer support.
3. Consumer-supplied custom data providers.
4. Country-specific high-detail packs.
5. Data storytelling overlays at region and city levels.
6. Free-pan/free-zoom as a first-class interaction mode.
7. Richer multi-candidate label density and decluttering rules for dense region/city layers.
8. Pack version negotiation and compatibility metadata.
9. Pluggable accessible detail panels or custom list renderers.
10. Offline caching for future remote packs.

## Risks and Open Questions

- Global region data may still be larger than desired, even as a separate package.
- Coverage quality may be inconsistent across countries.
- SVG hit areas and labels may not be sufficient on their own, increasing reliance on the visible-region list.
- The distinction between `zoom in`, `back`, `zoom out`, and `reset` needs careful behavioral definition during implementation planning.
- The provider contract will need a precise API shape in the implementation plan, but the architectural direction is clear.

## Recommended Implementation Framing

This project should be implemented in phases:

1. Add the runtime architecture and accessibility model in the core package.
2. Add the global regions data package and package-backed provider path.
3. Integrate the region layer into guided drill-down behavior.
4. Validate package-size impact and UX quality before considering future phases.

## Approval Gate

This spec captures the agreed phase-1 direction:

- start with npm-installed detail packs
- use one global regions package
- postpone cities
- design the core so remote loading can be added later
- require accessible controls and a visible-region list from the first release

After review and approval, the next step is to write an implementation plan. No implementation work is part of this spec.
