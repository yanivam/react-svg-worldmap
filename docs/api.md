---
sidebar_position: 4
---

# API

## Export members

- `SizeOption`: the union of available sizes.
- `ISOCode`: the ISO code available to name countries.
- `DataItem`: the type for each country's value to be passed in the `data` prop.
- `Data`: it's just `DataItem[]`, for more convenience.
- `CountryContext`: the context in rendering each country, to be used in customization callbacks.
- `Props`: the props type for the `WorldMap` component.
- `regions`: the list of regions (`{ name, code }`) available in the library
- `WorldMap`: available both as named and default export. The actual component to be rendered.

## Props

<small>

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `Data` | Mandatory. Array of JSON records, each with country/value. |
| `size` | <code>SizeOption &#124; 'responsive' &#124; number</code> | The size of your map. `responsive` mode scales smoothly with the available width, up to a viewport-based cap. See [Sizing](#sizing) for details, and see [Sizing example](/examples/sizing) |
| `title` | `string` | Any string for the title of your map. |
| `color` | `string` | Color for highlighted countries. A standard color string. E.g. "red" or "#ff0000". |
| `tooltipBgColor` | `string` | Tooltip background color. |
| `tooltipTextColor` | `string` | Tooltip text color. |
| `valuePrefix` | `string` | A string to prefix values in tooltips. E.g. "$" |
| `valueSuffix` | `string` | A string to suffix values in tooltips. E.g. "USD" |
| `backgroundColor` | `string` | Component background color. |
| `strokeOpacity` | `string` | The stroke opacity of non selected countries. |
| `frame` | `boolean` | Should a frame be drawn around the map. |
| `frameColor` | `string` | Frame color. |
| `borderColor` | `string` | Border color around each individual country. |
| `richInteraction` | `boolean` | WHen turned on, double clicks would cause the map to rescale. (Other cool features to come) |
| :construction: `type` :construction: | `string` | Select type of map you want, either "tooltip" or "marker". <br />:memo: This functionality not only complicates the code, but is infrequently used and needs to be redesigned to make it better. For now it is deprecated and has no effect. :memo: |
| `styleFunction` | `(context: CountryContext) => React.CSSProperties` | A callback function to customize styling of each country (see [Custom styles example](/examples/custom-style)) |
| `hrefFunction` | <code>(context: CountryContext) => object &#124; string &#124; undefined</code> | A callback function to bind an href link to each country. The return can be the target URL as a string or an object specifying props passed to the anchor element (e.g. `href` and `target`). (see [Href binding example](/examples/links)) |
| `tooltipTextFunction` | `(context: CountryContext) => string` | A callback function to customize tooltip text (see [Localization example](/examples/localization)) |
| `onClickFunction` | `(context: CountryContext & {event: React.MouseEvent}) => void` | A callback function to add custom onclick logic (see [Onclick action example](/examples/onclick)) |
| `textLabelFunction` | `(mapWidth: number) => ({label: string} & TextProps)[]` | A callback function to draw text labels on the map (see [Text labels example](/examples/text-labels)) |
| `detailLevel` | `"countries" \| "regions"` | Controls the detail mode. `"countries"` is the default world-map behavior. `"regions"` enables drill-down when a regions provider is supplied. |
| `detailProvider` | `DetailProvider` | Optional provider used when `detailLevel="regions"` to load region boundaries and metadata for the selected country. |
| `regionNameTranslations` | `Record<string, Record<string, string>>` | Optional region-label translations keyed by country code and region id. If the active layer translations are incomplete, region labels fall back to English. |
| `showLabels` | `boolean` | Optional automatic label toggle. Defaults to `false` for backward compatibility. When enabled, labels are filtered aggressively to the current visible layer and viewport. |
| `initialDrilldownCountryCode` | `ISOCode` | Optional initial country focus for regions mode examples and guided drill-down experiences. |

</small>

### `detailLevel`

- `"countries"`: default, current world-map behavior
- `"regions"`: enables drill-down when a regions provider is supplied

If `detailLevel="regions"` is used without an available provider, the component falls back to `"countries"` and logs a warning.

### `showLabels`

- `false`: default, no automatic country or region labels
- `true`: render automatic labels for the active visible layer when they fit safely inside the viewport and pass geometry-aware placement checks

`textLabelFunction` still works independently and remains the explicit escape hatch for fully custom labeling.

When `showLabels` is enabled, the built-in label engine uses these rules:

- It starts from the best interior anchor it can find for the visible feature.
- It tries a few nearby fallback positions before dropping the label.
- A label may span empty water inside the same feature context.
- A label is rejected if its text box overlaps land geometry from another visible feature.
- Labels are still collision-filtered against one another, with higher-priority labels winning first.

### Zoom Controls

- The built-in zoom control uses a simple `+` / `-` stacked layout.
- In `detailLevel="regions"` it supports continuous zoom up to `10x`.

TODO: expose zoom-control placement and styling customization options in a future release.

```ts
type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

type DataItem = {
  country: ISOCode;
  value: number | string;
};

type CountryContext = {
  countryCode: ISOCode;
  countryName: string;
  countryValue: number | string | undefined;
  color: string;
  minValue: number;
  maxValue: number;
  prefix: string;
  suffix: string;
};
```
