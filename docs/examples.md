---
sidebar_position: 5
---

# Examples

## [examples/regions-drilldown](/examples/regions-drilldown)

- A featured example showing the optional regions package as a polished first-run experience.
- Opens in `xl` size and starts in region detail so you can immediately inspect the additional geometry.
- Uses a Google-style accessible `+` / `-` zoom control in the bottom-right corner.
- Includes live announcements and the visible-region list.
- Explicitly enables `showLabels`; labels are otherwise off by default for backward compatibility.

When labels are enabled, they use geometry-aware placement:

- country labels at world level
- region labels only after drill-down
- labels may bridge same-feature water when that improves placement
- labels are rejected if their text box overlaps another visible feature's land geometry
- English fallback when provided translations are incomplete for the active region layer

TODO: expose zoom-control placement and styling customization options in a future release. TODO: improve the featured regions example's land/ocean contrast without changing the default library styling. TODO: finish the high-zoom country-border rendering polish so shared boundaries stay visually consistent.

## [examples/sizing](/examples/sizing)

- A simple example of the world map
- 4 maps given two different data sets
- Example of some simple features using the default styling
- Responsive size example showing how an example with responsive size looks

## [examples/custom-style](/examples/custom-style)

- An example of a custom styling function
- Context type has fields are as follows:

<small>

| Field | Type | Description |
| --- | --- | --- |
| `country` | `string` | ISO value for each country |
| `countryValue` | `number` | Value inputted for the specific country (this is the input data for the specific country) |
| `color` | `string` | The color that is inputted by the user for countries with values |
| `minValue` | `number` | The smallest value of the input data |
| `maxValue` | `number` | The largest value of the input data |

</small>

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
