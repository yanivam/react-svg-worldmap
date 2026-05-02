# Map Data Policy

`react-svg-worldmap` ships a single default world map for thematic data visualization. It is a small-scale SVG intended for charts and dashboards, not for legal, diplomatic, navigational, or cadastral use.

## Neutrality Goals

The project aims to present neutral and balanced map content by separating naming policy, geometry source, and dispute handling instead of treating one raw dataset as authoritative for all three.

The project does not endorse any sovereignty claim. When a territory is disputed, partially recognized, or otherwise politically sensitive, the project aims to make that ambiguity visible and auditable instead of silently choosing a side.

## Source Hierarchy

The project uses this order of precedence when reviewing or updating the bundled map:

1. `UNSD M49` and `UNTERM` for country and area naming, codes, and neutral terminology
2. `Natural Earth Admin 0` for the small-scale base geometry used by the bundled SVG map
3. `docs/map-data-overrides.json` for disputed territories, recognition- sensitive cases, and post-source policy adjustments
4. Reference-only validation against other datasets when maintainers need more context for a specific case

## Default Representation

The default package output is a thematic world map, not a legal boundary reference. For disputed or recognition-sensitive areas, the project prefers a coarse small-scale representation with explicit documentation over precise boundary claims that could imply a political endorsement.

The package provides one neutral global representation. It does not provide country-specific localized map variants.

## Dispute Handling Modes

Each sensitive case in the overrides register should use one of these modes:

- `standard`: keep the base geometry unchanged
- `coarse-neutral`: intentionally avoid precise contested boundary claims at this scale
- `name-policy`: use naming and terminology rules as the main policy surface
- `maintainer-review-required`: do not change this case silently

## Initial Tier 1 Scope

The initial supported disputed-territory dataset is limited to these Tier 1 cases:

- Crimea
- Palestinian Territories
- Taiwan
- Kashmir
- Western Sahara
- Kosovo

Tier 2 candidates for future expansion include South China Sea, India-China border disputes, Abkhazia, South Ossetia, and Transnistria. Tier 3 candidates include Nagorno-Karabakh, Northern Cyprus, Somaliland, Falkland Islands or Malvinas, and Gibraltar. Tier 2 and Tier 3 cases are deferred unless a later feature explicitly expands the supported dataset.

## Inclusion Criteria

A territory must meet at least one of these criteria before it can be accepted into the disputed-territory dataset:

1. It is referenced in United Nations resolutions, processes, or recognized programs.
2. It is a recognized dispute between two or more United Nations member states.
3. It is widely covered in major geopolitical or international-law datasets.
4. It is explicitly handled as disputed or politically sensitive by major map platforms.

Claims outside these criteria should be rejected or deferred. This includes fringe, unsourced, advocacy-driven, unknown-island, or whole-country dispute claims that lack credible public backing.

## Contributor Requirements

Geopolitical issues and pull requests must include:

- The affected territory or territories.
- The requested change.
- Public source evidence.
- Which inclusion criterion is met.
- The expected impact on names, boundaries, metadata, display, documentation, or package behavior.

Maintainers should not merge geopolitical changes that lack enough public evidence to apply this policy consistently.

## Review Outcomes

Maintainers should use one of these outcomes for geopolitical issues and pull requests:

- `accept`: The proposal is credible, scoped, sourced, and consistent with this policy.
- `request-evidence`: The proposal may be credible, but the contributor has not provided enough public evidence.
- `redirect`: The proposal asks to silently change sovereignty, but the better outcome is dispute metadata, display guidance, or documentation.
- `defer`: The proposal concerns a credible dispute outside the current release scope, such as a deferred Tier 2 or Tier 3 candidate.
- `reject`: The proposal is fringe, unsourced, advocacy-driven, or outside the project cutoff criteria.

Examples:

- Accepted Tier 1 example: Crimea should be documented as a disputed territory with Ukraine as the recognized baseline and Russia as the controlling power where that distinction is relevant.
- Deferred Tier 2 example: South China Sea island groups may be credible future candidates, but they are outside the initial Tier 1 dataset.
- Rejected fringe example: a request to mark an entire recognized country or an unknown island as disputed without credible backing should be rejected.

## Maintenance Workflow

When maintainers need to revisit a geopolitical case or update the bundled map:

1. Record the policy decision in `docs/map-data-policy.md` or `docs/map-data-overrides.json`.
2. Review whether the generated geometry still matches the written policy.
3. Regenerate the bundled topology only after the policy change is documented.
4. Mention user-visible policy changes in release notes or changelog entries.

## Current Bundled Geometry

The current bundled map remains a generated small-scale topology checked into the repo. This policy branch documents how future geometry reviews should be handled; it does not yet replace the shipped world geometry.

## Optional Region Detail Package

The optional region detail package uses separate coverage metadata from the bundled country map. Starter region coverage can be partial or experimental, but that status must be visible in package metadata and documentation. Region names and boundaries are reviewed under the same neutrality goals as country data and must not be described as legal, diplomatic, navigational, or cadastral references.

## References

- `UNSD M49`: https://unstats.un.org/unsd/methodology/m49/
- `UNTERM`: https://unterm.un.org/
- `Natural Earth Admin 0 Countries`: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
