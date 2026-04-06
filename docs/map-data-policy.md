# Map Data Policy

`react-svg-worldmap` ships a single default world map for thematic data visualization. It is a small-scale SVG intended for charts and dashboards, not for legal, diplomatic, navigational, or cadastral use.

## Neutrality Goals

The project aims to present neutral and balanced map content by separating naming policy, geometry source, and dispute handling instead of treating one raw dataset as authoritative for all three.

## Source Hierarchy

The project uses this order of precedence when reviewing or updating the bundled map:

1. `UNSD M49` and `UNTERM` for country and area naming, codes, and neutral terminology
2. `Natural Earth Admin 0` for the small-scale base geometry used by the bundled SVG map
3. `docs/map-data-overrides.json` for disputed territories, recognition- sensitive cases, and post-source policy adjustments
4. Reference-only validation against other datasets when maintainers need more context for a specific case

## Default Representation

The default package output is a thematic world map, not a legal boundary reference. For disputed or recognition-sensitive areas, the project prefers a coarse small-scale representation with explicit documentation over precise boundary claims that could imply a political endorsement.

## Dispute Handling Modes

Each sensitive case in the overrides register should use one of these modes:

- `standard`: keep the base geometry unchanged
- `coarse-neutral`: intentionally avoid precise contested boundary claims at this scale
- `name-policy`: use naming and terminology rules as the main policy surface
- `maintainer-review-required`: do not change this case silently

## Maintenance Workflow

When maintainers need to revisit a geopolitical case or update the bundled map:

1. Record the policy decision in `docs/map-data-policy.md` or `docs/map-data-overrides.json`.
2. Review whether the generated geometry still matches the written policy.
3. Regenerate the bundled topology only after the policy change is documented.
4. Mention user-visible policy changes in release notes or changelog entries.

## Current Bundled Geometry

The current bundled map remains a generated small-scale topology checked into the repo. This policy branch documents how future geometry reviews should be handled; it does not yet replace the shipped world geometry.

## References

- `UNSD M49`: https://unstats.un.org/unsd/methodology/m49/
- `UNTERM`: https://unterm.un.org/
- `Natural Earth Admin 0 Countries`: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
