---
sidebar_position: 5
---

# Examples

All examples share one small data set (`website/src/data/CountryData.ts`): population in millions and GDP per capita in US dollars, approximate 2024 figures.

Every example follows the site's light or dark mode. A small hook (`website/src/components/mapTheme.ts`) picks `backgroundColor`, `borderColor`, `strokeOpacity` and the tooltip colors for the current mode, and each example spreads them on `WorldMap` with `{...theme}`.

## [examples/equal-earth](/examples/equal-earth)

- Population map with `projection="equalEarth"`, plus a menu to compare with Mercator.
- In Equal Earth, Greenland shrinks and Africa shows its true relative size.

## [examples/sizing](/examples/sizing)

- The same map at each `size`: `sm`, `md`, `lg`, `xl` (default), `xxl`, `"responsive"` and a number of pixels.

## [examples/custom-style](/examples/custom-style)

- A `styleFunction` that shades countries by value and fills countries without data in grey.
- The function receives the country context and returns React `CSSProperties`:

<small>

| Field | Type | Description |
| --- | --- | --- |
| `countryCode` | `string` | ISO code of the country |
| `countryName` | `string` | Name of the country |
| `countryValue` | `number \| string \| undefined` | The country's value from `data`, or `undefined` |
| `color` | `string` | The `color` prop |
| `minValue` | `number` | The smallest value in `data` |
| `maxValue` | `number` | The largest value in `data` |
| `dispute` | `DisputeClassification \| undefined` | Dispute metadata for supported Tier 1 disputed territories |

</small>

## [examples/localization](/examples/localization)

- A `tooltipTextFunction` that shows tooltips in Spanish.
- `Intl.DisplayNames` translates the country names and `Intl.NumberFormat` formats the numbers, so no translation table is needed. For example, `{ country: "us", value: 345 }` shows "Estados Unidos: 345 millones de habitantes".

## [examples/onclick](/examples/onclick)

- An `onClickFunction` that stores the clicked country in React state and shows it below the map.

## [examples/tooltip-and-click](/examples/tooltip-and-click)

- A custom tooltip (formatted as currency) together with a click that outlines the selected country through `styleFunction`.

## [examples/links](/examples/links)

- An `hrefFunction` that turns each country into a link to its Wikipedia page.

## [examples/text-labels](/examples/text-labels)

- A `textLabelFunction` that labels the four oceans.
- The function receives the current map width, so positions and font size follow the map's size. Besides `label`, every key is passed to the `<text>` element.

## [examples/rich-interaction](/examples/rich-interaction)

- `richInteraction` turns on zoom: double-click the map, or press `+` and `-`.

## [examples/disputes](/examples/disputes)

- The opt-in disputed-territory overlay (`showDisputedTerritories`).
- Only the disputed territories are highlighted in red (e.g. Crimea, not all of Ukraine; the Kashmir areas, not India, Pakistan, and China), dashed where the metadata suggests it.
- Hovering a territory shows its status and parties. Clicking it shows the dispute, its parties and its UN standing.

## [examples/string-value](/examples/string-value)

- Values can be text instead of numbers, here a list of trips.
- All text values get the same shade. If you mix text and number values, text values are treated as `minValue`.
