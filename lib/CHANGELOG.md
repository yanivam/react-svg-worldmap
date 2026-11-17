# react-svg-worldmap

## 2.7.0

### Minor Changes

- 6cf30d9: Add an opt-in `theme` prop with an `"atlas"` theme. `theme="atlas"` draws blue water (`#A0D7EB`), slate borders and frame (`#607d86`), and light land (`#F4F2F2`, fully opaque) for countries without data, and keeps borders one pixel wide (`vector-effect: non-scaling-stroke`) with or without zoom. The land is drawn once beneath the countries (`<path class="worldmap__land" data-map-sublayer="land">` in the countries layer), so countries with data keep the `color` prop and its opacity scale and read against land rather than water. Country labels are `#263238` with a `#F4F2F2` halo and pin captions are `#263238`. Any colour prop you pass (`backgroundColor`, `borderColor`, `frameColor`, the pin and label colour props) overrides the theme, and `styleFunction` replaces the theme's country style. Works with both projections, `zoom`, the detailed borders and region detail. New exports: the `MapTheme` type and `mapThemeOptions`. Without `theme` (or with `theme="default"`) the map renders exactly as before.

## 2.6.0

### Minor Changes

- 37839ad: Add sharper borders when zoomed in and a region-detail API. With `zoom`, the map now draws detailed country borders (Natural Earth 10m) once zoomed in to 2x or more (`detailedGeometryMinScale`), and the default borders below that. The detailed data is a separate file (`dist/map-assets/countries-detailed.cjs`, about 2.4 MB, 360 kB gzipped) loaded with `import()` the first time it is needed, so the default bundle grows by only a few kB and Vite and webpack emit the data as its own chunk. It has the same countries, names and codes as the default map, with Crimea as part of Ukraine in both. `zoom={{ detailedGeometry: false }}` turns it off and `preloadDetailedCountryGeometry()` loads it ahead of time. New `detailLevel="regions"`, `detailProvider` and `onDetailStatusChange` props draw the regions of the countries in view as dashed borders once zoomed in to `regionDetailMinScale` (default 4); providers return GeoJSON in longitude / latitude, which the map projects with the current projection. New exports: `createReadyDetailResult`, `createUnavailableDetailResult`, `createFailedDetailResult`, `createIdleDetailResult`, `isReadyDetailResult`, and the `DetailProvider`, `DetailProviderResult`, `DetailLevel`, `DetailStatus`, `RegionCollection`, `RegionFeature` and `RegionCoverageStatus` types. Without `zoom`, including with `richInteraction`, the default render is unchanged and the detailed data is never loaded.

## 2.5.0

### Minor Changes

- 5469453: Add opt-in zoom and pan, map pins and country labels. `zoom` (or `zoom={{ ... }}` with `ZoomOptions`) adds zoom in / zoom out / reset buttons, drag to pan, double-click zoom, keyboard zoom and pan (`+`, `-`, arrow keys, `Escape`) and ctrl / ⌘ + wheel or trackpad pinch; a plain wheel still scrolls the page. The map stays inside its viewport in both projections, zoom changes are announced to screen readers, the zoom animation respects `prefers-reduced-motion`, borders keep a constant width, and `maxScale` (default 8) caps every zoom gesture. With zoom on, country names are drawn where they fit. `onZoomChange` reports each change from the interaction itself, so storing the state in a parent can't cause a render loop. New `pins` prop draws captioned markers at longitude / latitude, with or without zoom. New colour props: `pinColor`, `pinTextColor`, `pinOutlineColor`, `labelColor` and `labelHaloColor`. New `country-labels` and `pins` map layers (existing layer ids and order numbers are unchanged) and new type exports `ZoomOptions`, `ZoomState`, `MapPin` and `CountryLabelCandidate`. Without `zoom`, the default render and `richInteraction` behave exactly as before. `WorldMap` is now typed as returning `React.ReactElement` instead of `JSX.Element`, so its declarations also type-check with the React 19 types.

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
