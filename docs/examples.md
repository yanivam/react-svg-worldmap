---
sidebar_position: 5
---

# Examples

## [Zoom with regions](/examples/zoom)

- The first example for the zoomable map experience with opt-in region detail.
- Demonstrates the `zoom` prop, zoom in/out/reset controls, double-click zoom, and drag panning.
- Country border strokes keep a constant screen-space thickness while zooming.
- Country labels are enabled by default while zooming, grow within clamped screen-space bounds, and are filtered so labels only appear when they fit.
- The example renders on an XL canvas, shows region details by default, and lets users turn region details on or off.
- Region details come from the optional `@react-svg-worldmap/regions` package, with complete target-country coverage for 23 countries across the Americas, Europe, Asia, Africa, and Oceania.
- The example follows the four-step optional region setup path: install the regions package, import `createRegionsDetailProvider`, pass the provider to the map, and enable `detailLevel="regions"` with zoom.
- Country geometry uses gradual disclosure: reduced closed country shapes below `2x`, detailed country shapes at `2x`, and selected dotted region overlays at `4x`.
- Zoom feedback is staged for smoothness: the visible map transform updates first, then detailed country geometry, labels, pins, and optional region overlays settle afterward. Representative package tests target visible feedback within 250 ms for typical zoom clicks and visible completion within 500 ms for worst-case representative zoom clicks.
- Internal region borders render as dotted overlays, and region labels appear only when zoom and label-fit rules keep them readable.
- The example can overlay capital city pins and AWS Region location pins on demand; both overlays are off by default so sample data stays outside the core package.
- AWS Region pins come from the official AWS Regions documentation. Each pin uses the most precise location available: published or directly inferable city locations first, state or equivalent capitals when only an administrative area is known, and country capitals when only country-level geography is known. Capital fallback labels include `(location not published)`.
- Uses the bundled reduced/detailed country topology tiers, regenerated from the documented Natural Earth Admin 0 source path with at least 6 decimal places of retained source precision and quality-budgeted package-size optimization.
- Uses lightweight SVG land/ocean contrast through sea/background color `#A0D7EB`, no-data land color `#F4F2F2`, closed country shapes, and border colors; Google Maps is only a visual-design reference for readability principles, not a dependency or clone target.
- The smoothness target applies to the bundled examples and representative package scenarios. Consumer configurations with unbounded custom labels, pins, styles, or container constraints may need their own validation.

## [examples/sizing](/examples/sizing)

- A simple example of the world map
- 4 maps given two different data sets
- Example of some simple features using the default styling
- XL and XXL examples demonstrate opt-in region detail from the optional regions package without rendering a below-map list of region names.
- Default examples keep land visible against the ocean/background through SVG color contrast and closed country shapes, not hosted map tiles or raster basemaps.
- Responsive size example showing how an example with responsive size looks

## [examples/custom-style](/examples/custom-style)

- An example of a custom styling function
- An example of dispute-aware styling can use the same callback with optional `context.dispute` metadata.
- Context type has fields are as follows:

<small>

| Field | Type | Description |
| --- | --- | --- |
| `country` | `string` | ISO value for each country |
| `countryValue` | `number` | Value inputted for the specific country (this is the input data for the specific country) |
| `color` | `string` | The color that is inputted by the user for countries with values |
| `minValue` | `number` | The smallest value of the input data |
| `maxValue` | `number` | The largest value of the input data |
| `dispute` | `DisputeClassification \| undefined` | Optional dispute metadata for supported Tier 1 disputed territories |

</small>

```tsx
<WorldMap
  data={[{ country: "UA", value: 1 }]}
  styleFunction={(context) =>
    context.dispute?.display.borderStyle === "dashed"
      ? { strokeDasharray: "4 2" }
      : {}
  }
  tooltipTextFunction={(context) =>
    context.dispute?.display.tooltipLabel ?? context.countryName
  }
/>
```

## [examples/localization](/examples/localization)

- An example showing how to use the `tooltipTextFunction` to localize tooltip texts.
- The function translates both country names and values to Spanish.
- For example:

| Data | Localized text |
| --- | --- |
| ` { "country": "us", value: 331883986 }` | "Estados Unidos: 3.32 mil millónes" |

## [examples/onclick](/examples/onclick)

- An example showing how each country can have an `onclick` event handler bound.
- When clicking on a country with value, the React state would be updated.

## [examples/links](/examples/links)

- An example showing how each country can have an `href` bound.
- Each country in the example takes you to its Wikipedia page.

## [examples/text-labels](/examples/text-labels)

- An example showing how to draw custom text labels on the map.
- The callback receives `mapWidth`, the current map width, as the parameter, and responsively draws text labels onto the SVG.
- Besides the `label`, any other keys will be passed as props to the `text` element.
- This example labels the four oceans responsively, coloring the Arctic ocean in another color.

## [examples/rich-interaction](/examples/rich-interaction)

- An example showing how a map with rich interactions enabled is like.
- Try double-clicking on the map!

## [examples/string-value](/examples/string-value)

- Some users do not have a need to display numeric values.
- This is an example showing how each data value can have a string value.
- The same thing can be accomplished with `tooltipTextFunction`, by hiding the number value and adding your string to the Country value (see [localization](/examples/localization)), but this will make that user experience easier.
- If you are using both string and number values together, string will be treated as `minValue`.
