# Neutral Map Policy Design

## Goal

Define a neutral, reviewable map data policy for `react-svg-worldmap` that keeps a single default world map while avoiding the implication that one raw dataset is an authoritative statement on sovereignty or legal boundaries.

## Problem

The package currently describes the map as sourced from Natural Earth and links to a physical land dataset. That creates three problems:

1. It overstates a single-source narrative for a politically sensitive map.
2. It points users to the wrong Natural Earth page for country boundaries.
3. It leaves disputed territories and future geopolitical changes without an explicit maintainer policy.

## Design Summary

The repo will adopt a source hierarchy instead of a single-source claim:

1. `UNSD M49` and `UNTERM` for naming, codes, and neutral terminology
2. `Natural Earth Admin 0` for the small-scale cartographic geometry base
3. A repo-maintained overrides register for disputed areas and sensitive cases
4. Reference-only validation against other datasets when a case needs review

The package will continue to ship one default thematic SVG world map. The policy will explicitly state that the map is designed for data visualization, not for legal, diplomatic, or cadastral use.

## Repository Changes

### Public documentation

- Update `lib/README.md` to describe the new source hierarchy and disclaimer.
- Update `README.md` to link to the new policy documentation.
- Add `docs/map-data-policy.md` with the maintainer-facing policy.

### Reviewable policy artifact

- Add `docs/map-data-overrides.json` with a machine-readable register of sensitive geopolitical cases and their handling mode.

### Internal process documents

- Save this design under `docs/superpowers/specs/`.
- Save the implementation plan under `docs/superpowers/plans/`.

## Disputed Territory Handling

The package will not attempt to encode "correct sovereignty" as product truth. Instead, each sensitive case will be assigned one of these handling modes:

- `standard`: use the base geometry unchanged
- `coarse-neutral`: keep the depiction intentionally small-scale and non-precise
- `name-policy`: treat naming and terminology as the main policy surface
- `maintainer-review-required`: no silent updates without a documented review

## Maintenance Workflow

1. Update the policy doc and overrides register first.
2. Review whether the current generated map still matches the policy.
3. If geometry changes are needed, regenerate the bundled topology as a follow-up using the documented policy inputs.
4. Mention user-visible policy changes in release notes or changelog entries.

## Out Of Scope

- Replacing the bundled geometry in this branch
- Adding multiple geopolitical variants to the package API
- Promising legal or diplomatic correctness for any disputed boundary

## Success Criteria

- The repo no longer presents the map as a direct single-source truth.
- Maintainers have a written hierarchy for names, geometry, and exceptions.
- Users can understand the neutrality stance from the public docs.
- Sensitive cases are tracked in a reviewable file instead of ad hoc edits.
