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

The current bundled map is generated small-scale topology checked into the repo as package-local reduced and detailed country tiers. `lib/src/countries.topo.ts` remains a compatibility wrapper for the reduced tier. As of the gradual-disclosure work, maintainers regenerated both tiers from the documented `Natural Earth Admin 0` source path using `world-atlas@2.0.2` `countries-10m.json`.

Generation settings and validation:

- Generator: `lib/scripts/migrate-to-topo.ts`
- Default source input: `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json`
- Local override: `WORLD_ATLAS_SOURCE_PATH=/path/to/countries-10m.json`
- Retained source precision observed during regeneration: 12 decimal places
- Minimum required retained source precision: 6 decimal places
- Country records preserved: 175
- Source coordinate count before optimization: 511,005
- Compression: TopoJSON arc sharing, TopoJSON delta encoding, and JSON minification
- Lossy reduction: quality-budgeted TopoJSON quantization at `4000` for the reduced tier and `10000` for the detailed tier
- Maximum quantization step: `0.036003600360036005` degrees
- Quality fixtures passed: Cyprus (`small-island`), Norway (`coastline`), Western Sahara (`border`), Kosovo (`small-country`, `border`), and Luxembourg (`small-country`)
- High-detail source size before optimization: 17,496,803 bytes
- Optimized reduced source size recorded during regeneration: 1,574,896 bytes
- Optimized detailed source size recorded during regeneration: 2,430,645 bytes
- Optimized reduced source payload size: 1,572,619 bytes
- Optimized detailed source payload size: 2,428,359 bytes
- Source size reduction from high-detail baseline: 91.0% reduced tier, 86.1% detailed tier
- Core npm package dry-run after optimization: 1.2 MB packed, 10.4 MB unpacked, 6 files
- Optional regions npm package dry-run after optimization: 2.8 MB packed, 10.2 MB unpacked, 7 files

What the package-size reduction does:

1. Converts the selected `world-atlas@2.0.2` country objects back to GeoJSON and preserves the 175 expected country records before any minimization.
2. Rebuilds the country geometry as TopoJSON so shared borders are stored once as reusable arcs instead of being repeated independently by neighboring countries.
3. Lets the TopoJSON transform store arcs with integer coordinates and delta encoding. This removes most repeated decimal coordinate strings from the source payload while keeping a reversible transform for rendering.
4. Applies a quality-budgeted quantization grid of `10000`. This is the only intentionally lossy step: coordinates are snapped to the generated grid to remove sub-pixel detail that is not expected to be visible in the default small-scale map. The generator records the maximum grid step and rejects output when fixture bounds or area deltas exceed the documented quality budget.
5. Emits minified generated topology data for `lib/src/countries-reduced.topo.ts` and `lib/src/countries-detailed.topo.ts`, and excludes formatter expansion for generated topology files, keeping the committed source and built bundles compact.
6. Validates the regenerated data through record-count checks, coordinate-count checks, non-empty SVG path rendering for every country, explicit quality fixtures for small islands, coastlines, borders, and small countries, and npm pack dry-runs for the published package.

The regenerated topology intentionally favors visible country-level coastline, island, border, and small-country detail, then applies quality-budgeted quantization to reduce package size without material human-visible degradation in the validation fixtures. Country paths are validated as closed shapes. The runtime uses reduced country geometry below `2x`, detailed country geometry at `2x` and above, and optional selected region geometry at `4x` and above. It remains a thematic visualization and must not be described as a legal, diplomatic, navigational, cadastral, or authoritative boundary source.

## Land And Ocean Visual Treatment

Clear commercial basemaps commonly separate land and water through water/land color contrast, coastline emphasis, label hierarchy, and styled map layers. This project uses those principles only as visual-design guidance. The default SVG map keeps land visible against sea/background color `#A0D7EB`, uses neutral no-data land color `#F4F2F2`, and uses a softer coastline/country stroke. Closed country shapes keep land fills separate from the sea/background field. Rendering uses an explicit SVG layer order of ocean/background, country land and borders, optional dotted regions, labels, pins, and interaction targets so the ocean cannot paint over land and region overlays do not replace country fills or borders. The package does not provide Google Maps parity, hosted map tiles, raster imagery, terrain rendering, satellite rendering, external geometry providers, custom map provider APIs, or legal basemap accuracy.

Changes to the default visual treatment should preserve themeability through existing styling props and must not introduce map-service runtime dependencies. Documentation should describe the output as a lightweight SVG thematic map.

## Optional Region Detail Package

The optional region detail package uses separate coverage metadata from the bundled country map. Region coverage can be complete, partial, experimental, or unavailable, but that status must be visible in package metadata and documentation. The current target-country package includes complete first-level coverage for 23 countries across the Americas, Europe, Asia, Africa, and Oceania. Future non-target countries may use partial, experimental, or unavailable statuses when source review or expected-count validation is not complete.

Region data generation records:

- United States: generated from `us-atlas@3.0.1` `states-10m.json`, derived from U.S. Census Bureau cartographic boundary data; District of Columbia and territories are excluded from the 50-state layer.
- Canada: generated from Opendatasoft `georef-canada-province` GeoJSON using Statistics Canada province and territory records; includes 10 provinces and 3 territories.
- Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia: generated from Natural Earth Admin 1 states/provinces 10m cultural vectors and marked complete for the target package after expected-count validation.
- Rendered region paths are generated in the core map coordinate system for the optional package, then rounded to hundredth-pixel precision before publishing. This removes redundant decimal text from SVG paths while keeping the visual precision below the visible map-detail threshold. Region data is validated for expected counts, names, source identifiers, coverage metadata, and non-empty SVG paths.

Region names and boundaries are reviewed under the same neutrality goals as country data and must not be described as legal, diplomatic, navigational, cadastral, or authoritative references. Internal region borders should be rendered as dotted overlays so they are not confused with country borders.

## AWS Region Example Pins

The zoom-with-regions website example includes optional AWS Region pins as sample overlay data. The source of truth for region codes, AWS display names, and geography is the official AWS Regions documentation at `https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html`.

AWS does not consistently publish city-level infrastructure locations for every Region on that page. The example includes the commercial AWS account Regions from the table plus the separate GovCloud and China account-type Regions referenced from that AWS documentation. Example pins therefore use the most precise public or inferable location available: published or directly inferable city locations first, state or equivalent administrative capitals when only a state/admin area is known, and country capitals when only country-level geography is known. Labels for state-capital and country-capital fallbacks include `(location not published)`.

## References

- `UNSD M49`: https://unstats.un.org/unsd/methodology/m49/
- `UNTERM`: https://unterm.un.org/
- `Natural Earth Admin 0 Countries`: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
- `Natural Earth Admin 1 States/Provinces`: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
