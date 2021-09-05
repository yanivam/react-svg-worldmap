---
sidebar_position: 5
---

# Examples

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

- An example showing how to use the `tooltipTextFunction` to locolize tooltip texts.
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
