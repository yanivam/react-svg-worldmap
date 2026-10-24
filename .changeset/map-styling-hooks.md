---
"react-svg-worldmap": minor
---

Add stable hooks for styling and testing. Each country path has `data-country-code` and `data-country-name`. The map is drawn in layers, each a `<g>` under the `<svg>` with `data-map-layer` and `data-map-layer-order`: `ocean`, `countries`, `disputed-territories` (with `showDisputedTerritories`) and `labels`. The new `ocean` layer is one `<rect data-map-ocean>` filled with `backgroundColor`, the same colour as the figure behind it. The frame rect has `data-map-frame`. New exports: `mapRenderingLayers`, `mapRenderingLayerOrder` and the `MapRenderingLayerId` type. The default render looks the same as before; code that selected the first `<g>` or `<rect>` of the SVG should switch to these attributes.
