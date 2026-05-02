# Data Model: Zoom Drill-Down

## Zoom State

Represents the Phase 1 country-level viewport interaction.

Fields:

- `enabled`: Whether zoom behavior is active.
- `scale`: Current continuous zoom scale.
- `translate`: Current x/y pan offset.
- `isDragging`: Whether pointer drag panning is active.
- `lastPointer`: Optional last pointer position used during drag.
- `announcement`: Most recent status text for assistive technologies.

Validation rules:

- Omitted zoom options preserve default country-level rendering.
- Reset restores the default world transform.
- Zoom out must not make the map unusably small.
- Zoom in must support repeated continuous scaling without a fixed finite step list.
- Drag panning must not mutate country data or selection state.

## Country Border Stroke Rendering

Represents the visual rule for country boundary strokes under zoom transforms.

Fields:

- `baseStrokeWidth`: The default screen-space stroke width derived from existing country styles.
- `screenSpaceStrokeWidth`: The effective rendered stroke width after zoom is applied.
- `vectorEffect`: Whether SVG non-scaling stroke behavior is applied to country paths.

Validation rules:

- Country border strokes must keep constant screen-space thickness at all zoom levels.
- Repeated zoom-in actions must not increase the visible border thickness between countries.
- Existing consumer border color, stroke opacity, region class name, and style callbacks must remain compatible.
- The border rule must apply to default country paths without requiring a new consumer prop.

## Country Label Candidate

Represents a possible country label at the current zoom and viewport.

Fields:

- `countryCode`: ISO country code.
- `countryName`: Display name.
- `geometryPartId`: Stable id for the country geometry part used for placement.
- `anchor`: Candidate x/y label anchor.
- `bounds`: Candidate text bounds after projection and zoom.
- `availableArea`: Estimated visible area available for the label.
- `priority`: Ordering used when labels compete.

Validation rules:

- Candidate text must fit inside the selected visible geometry part.
- Candidates must avoid unacceptable overlap with already accepted labels.
- Non-contiguous countries may produce multiple candidates, but only readable placements are accepted.
- Lower-priority labels may be hidden to preserve readability.

## Country Label Size Rule

Represents the default and consumer-configured screen-space sizing behavior for country label text.

Fields:

- `minFontSize`: Minimum screen-space label font size.
- `maxFontSize`: Maximum screen-space label font size.
- `zoomScale`: Current zoom scale used to derive the target label size.
- `growthRate`: Optional curve factor controlling how quickly labels grow as zoom increases.

Validation rules:

- Default country labels must grow modestly as zoom increases.
- Computed label size must stay within the configured minimum and maximum.
- Label fit and collision calculations must use the computed label size.
- Consumer overrides in `ZoomOptions` must not affect default non-zoom rendering.

## Consumer Pin

Represents a consumer-supplied point detail shown only at sufficient zoom.

Fields:

- `id`: Optional stable consumer-provided pin identifier.
- `coordinates`: Longitude/latitude pair.
- `caption`: Human-readable caption displayed with the marker when space allows.
- `countryCode`: Optional ISO country code used for filtering or prioritization.
- `kind`: Optional marker kind exposed for styling and testing hooks.
- `priority`: Optional ordering used when pins compete for visible space.

Validation rules:

- Pins are supplied by consumers or examples, not bundled as core capital city metadata.
- Pin markers and captions must be hidden when the zoomed visible area cannot fit them.
- Missing or empty pins must not break country rendering, zooming, or labels.
- Invalid longitude/latitude coordinates must be ignored or reported without breaking the map.

## Detail Level

Represents the consumer-selected map depth.

Fields:

- `countries`: Default country-level world map, with optional Phase 1 zooming.
- `regions`: Phase 2 opt-in country-to-region drill-down mode.

Validation rules:

- Omitted detail level is equivalent to `countries`.
- `regions` requires a compatible detail provider for region data after Phase 1 is complete.
- Unsupported future levels must not be silently treated as supported.

## Detail Provider

Represents the Phase 2 detail data boundary used by the core package.

Fields:

- `supports(countryCode)`: Reports whether region coverage exists for a country.
- `loadRegions(countryCode)`: Loads normalized region data for a country.

Validation rules:

- Provider results must report status explicitly.
- Provider failure must not break country-level rendering.
- The core package must not assume a specific provider implementation.

## Detail Provider Result

Represents the outcome of requesting region data.

Fields:

- `status`: `idle`, `loading`, `ready`, `unavailable`, or `failed`.
- `layer`: The requested detail layer, initially `regions`.
- `detailLevel`: The active or requested detail level.
- `collection`: Optional normalized region collection.
- `warning`: Optional consumer-facing warning.

Validation rules:

- `ready` results must include a valid region collection.
- `unavailable` and `failed` results must leave the map in a stable fallback state.
- Warnings must be clear but must not appear for default country-level use.

## Region Collection

Represents a Phase 2 country-scoped set of normalized regions.

Fields:

- `countryCode`: Parent country code.
- `englishCountryName`: Human-readable parent country name.
- `coverage`: Metadata describing starter or complete coverage.
- `regions`: Ordered list of region records.
- `preferredViewport`: Optional viewport for fitting the country scope.

Validation rules:

- Region collection country code must match the requested country.
- Region collection must contain at least one region for `ready` status.
- Starter coverage must be documented and not implied as complete global coverage.

## Region Record

Represents a state, province, or comparable sub-country feature.

Fields:

- `id`: Stable region identifier.
- `countryCode`: Parent country code.
- `labels`: Human-readable label set.
- `path`: Renderable geometry.
- `centroid`: Optional point for labeling and focus.
- `bounds`: Optional geometry bounds for viewport fitting.
- `order`: Optional ordering for visible list and label priority.

Validation rules:

- Region id must be stable within the parent country.
- Region labels must be non-empty.
- Region geometry must be usable by the core renderer.
- Region names and boundaries must pass map-data neutrality review where relevant.

## Drill-Down State

Represents the Phase 2 region interaction state.

Fields:

- `scope`: World scope or focused country scope.
- `selectedCountryCode`: Optional selected country.
- `detailStatus`: Current provider status.
- `zoomLevel`: Current zoom level.
- `canGoBack`: Whether a back action is available.
- `announcement`: Most recent status text for assistive technologies.

Validation rules:

- Reset returns to world scope and country-level view.
- Back from focused country scope returns to world scope.
- Repeated boundary controls must leave state stable.
- Reduced-motion preferences must be respected for transitions.

## Visible Region List

Represents the accessible non-SVG path to currently displayed regions.

Fields:

- `countryCode`: Focused country.
- `items`: Regions currently visible or available in the focused layer.
- `activeRegionId`: Optional active or focused region.

Validation rules:

- List items must stay synchronized with rendered region detail.
- The list is present when region detail is displayed.
- The list must remain keyboard-operable.

## Label Placement

Represents the default decision about which country or region labels are visible.

Fields:

- `candidateLabels`: Labels available at the current scope.
- `visibleLabels`: Labels selected after collision checks.
- `priority`: Ordering that favors countries before regions and higher-priority regions before lower-priority regions.

Validation rules:

- Country labels appear by default when Phase 1 zooming is enabled.
- Region labels appear only in Phase 2 focused region scope.
- Labels must avoid unacceptable overlap.
- Lower-priority labels may be hidden to preserve readability.
