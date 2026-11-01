# react-svg-worldmap

## 2.4.0

### Minor Changes

- f723122: Add stable hooks for styling and testing. Each country path has `data-country-code` and `data-country-name`. The map is drawn in layers, each a `<g>` under the `<svg>` with `data-map-layer` and `data-map-layer-order`: `ocean`, `countries`, `disputed-territories` (with `showDisputedTerritories`) and `labels`. The new `ocean` layer is one `<rect data-map-ocean>` filled with `backgroundColor`, the same colour as the figure behind it. The frame rect has `data-map-frame`. New exports: `mapRenderingLayers`, `mapRenderingLayerOrder` and the `MapRenderingLayerId` type. The default render looks the same as before; code that selected the first `<g>` or `<rect>` of the SVG should switch to these attributes.

## 2.3.0

### Minor Changes

- 49757bc: Add an opt-in `projection` prop. `projection="equalEarth"` draws the map in the equal-area Equal Earth projection, so countries keep their true relative size. The default stays `"mercator"` and renders exactly as before. Equal Earth uses a 2:1 frame (height = width / 2) to match its shape and draws the outline of the globe in `borderColor`. Also exports the `ProjectionOption` type and the `projectionOptions` list. Equal Earth is generally available and fully supported; Mercator remains the default, and any future change of default would only come in a major release, based on user feedback.

## 2.2.0

### Minor Changes

- dd8521e: Add Tier 1 geopolitical dispute metadata (Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, Kosovo). New exports: `disputedTerritories`, `disputeIds`, `disputesByCountryCode`, `getDisputeById`, `getDisputeByCountryCode`, and the `Dispute*` types. Callback context gains an optional `dispute` field for countries linked to a dispute. Each dispute also records its UN standing (`unStanding`). New opt-in `showDisputedTerritories` prop draws the disputed territories themselves (Crimea, the Kashmir areas, West Bank, Gaza, Western Sahara, Kosovo, Taiwan; from Natural Earth 5.1.2) as a red overlay, with `disputedTerritoryColor`, `disputedTerritoryTooltipFunction`, `onDisputedTerritoryClick`, and the `disputedTerritoryAreas` export. With the prop off, the default map geometry and rendering are unchanged. The map data policy now documents the Tier 1 scope, inclusion criteria, and review outcomes.

## 2.1.0

### Minor Changes

- d9b6e96: `size="responsive"` now fills the full width of its container instead of stopping at 75% of the smaller viewport dimension. The map measures its `<figure>` rather than the outer wrapper, so the figure's margins no longer make the SVG overflow. To limit the size, constrain the container (for example with `max-width`) or pass a number as `size`.

### Patch Changes

- d9b6e96: Remove duplicated geometry from the bundled world map: France no longer lists Corsica twice (which could leave Corsica unfilled under `fill-rule: evenodd`), and a degenerate single-point polygon in North Korea, zero-length arcs, and repeated points have been dropped. Country shapes are otherwise unchanged.
