# Geopolitical Policy

`react-svg-worldmap` is an open-source thematic map package. Its bundled world map is intended for charts and dashboards, not for legal, diplomatic, navigational, cadastral, or authoritative boundary use.

This project does not endorse any sovereignty claim. When a territory is disputed, partially recognized, or otherwise politically sensitive, the project aims to make that ambiguity visible and auditable instead of silently choosing a side.

## Goals

- Use internationally recognized baselines as the starting point for map-data decisions.
- Separate recognized sovereignty, current control, dispute status, naming, and visual representation where those concepts differ.
- Clearly mark credible disputed or partially recognized territories.
- Reject fringe or non-credible claims that would turn the map into a political advocacy surface.
- Keep decisions consistent, documented, and reviewable by contributors.

## Source Hierarchy

When reviewing geopolitical map changes, maintainers use this order of precedence:

1. United Nations naming, terminology, resolutions, processes, and statistical standards where applicable.
2. Widely recognized international legal, treaty, diplomatic, or state-level records.
3. The small-scale base geometry source used by the package.
4. The project overrides register in `docs/map-data-overrides.json`.
5. Reference-only comparison against major geopolitical datasets or major map platforms when additional context is needed.

No single source is treated as perfect for every case. The policy goal is a defensible and consistent project decision, not a claim of geopolitical truth.

## Default Representation

The package provides one neutral global representation. It does not provide country-specific localized map variants.

The bundled base geometry is regenerated from the documented Natural Earth Admin 0 source path and remains a thematic small-scale visualization. Higher coordinate precision improves visible country-level detail, and quality-budgeted optimization reduces package size, but neither makes the package a legal, diplomatic, navigational, cadastral, or authoritative boundary reference.

For disputed or recognition-sensitive cases, the project prefers:

- Explicit metadata over silent sovereignty changes.
- Coarse neutral representation over precise contested boundary claims at this map scale.
- Dispute-aware display guidance such as dashed boundaries, neutral labels, or tooltip metadata where supported by the package.

## Initial Tier 1 Scope

The initial supported disputed-territory set is limited to these high-visibility Tier 1 cases:

- Crimea
- Palestinian Territories
- Taiwan
- Kashmir
- Western Sahara
- Kosovo

Tier 2 and Tier 3 disputes may be documented as future expansion candidates, but they are not part of the initial supported dataset unless a later feature explicitly expands the scope.

## Inclusion Criteria

A territory must meet at least one of these criteria before it can be accepted into the disputed-territory dataset:

1. It is referenced in United Nations resolutions, processes, or recognized programs.
2. It is a recognized dispute between two or more United Nations member states.
3. It is widely covered in major geopolitical or international-law datasets.
4. It is explicitly handled as disputed or politically sensitive by major map platforms.

Claims outside these criteria should be rejected or deferred.

## Review Outcomes

Maintainers should use one of these outcomes for geopolitical issues and pull requests:

- `accept`: The proposal is credible, scoped, sourced, and consistent with this policy.
- `request-evidence`: The proposal may be credible, but the contributor has not provided enough public evidence.
- `redirect`: The proposal asks to silently change sovereignty, but the better outcome is dispute metadata, display guidance, or documentation.
- `defer`: The proposal concerns a credible dispute outside the current release scope.
- `reject`: The proposal is fringe, unsourced, advocacy-driven, or outside the project cutoff criteria.

## Examples

- Crimea should not be silently represented as ordinary Russian territory. The project should record it as a disputed territory with Ukraine as the recognized baseline and Russia as the controlling power where that distinction is relevant.
- Western Sahara should not be fully assigned to Morocco without dispute metadata.
- Kosovo should be treated as partially recognized rather than forced into a single universal recognition model.
- Requests to mark an entire recognized country, unknown island, or private political claim as disputed without credible backing should be rejected.

## Contributor Requirements

Geopolitical issues and pull requests must include:

- The affected territory or territories.
- The requested change.
- Public source evidence.
- Which inclusion criterion is met.
- The expected impact on names, boundaries, metadata, display, documentation, or package behavior.

Maintainers should not merge geopolitical changes that lack enough public evidence to apply this policy consistently.

## Canonical Project Files

This document is the contributor-facing policy entry point. Implementation and case-specific records live in:

- `docs/map-data-policy.md`
- `docs/map-data-overrides.json`

If this file conflicts with those files, update the documents together before merging the change.
