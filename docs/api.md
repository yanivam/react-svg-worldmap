---
sidebar_position: 4
---

# API

## Export members

- `isoCode`: the ISO code available to name countries.
- `DataItem`: the type for each country's value to be passed in the `data` prop.
- `CountryContext`: the context of each country's style, to be used in custom styling.
- `Props`: the props type for the `WorldMap` component.
- `WorldMap`: available both as named and default export. The actual component to be rendered.

## Props

<small>

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `DataItem[]` | Mandatory. Array of JSON records, each with country/value. |
| `size` | <code>string &#124; number</code> | The size of your map. See [Sizing](#sizing) for details, and see [Sizing example](/examples/sizing) |
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
| :construction: `type` :construction: | `string` | Select type of map you want, either "tooltip" or "marker". <br />:memo: This functionality not only complicates the code, but is infrequently used and needs to be redesigned to make it better. For now it is deprecated and has no effect. :memo: |
| `styleFunction` | `(context: CountryContext) => React.CSSProperties` | A callback function to customize styling of each country (see [Custom styles example](/examples/custom-style)) |
| `hrefFunction` | See below | A callback function to bind an href link to each country. The return can be the target URL as a string or an object specifying both the `href` and `target` properties. (see [Href binding example](/examples/links)) |
| `tooltipTextFunction` | See below | A callback function to customize tooltip text (see [Localization example](/examples/localization)) |
| `onClickFunction` | See below | A callback function to add custom onclick logic (see [Onclick action example](/examples/onclick)) |

</small>

```ts
type DataItem = {
  country: isoCode;
  value: number;
};

type hrefFunctionType = (
  countryName: string,
  isoCode: isoCode,
  value: string,
  prefix?: string,
  suffix?: string,
) => {target: string; href: string} | string | undefined;

type tooltipTextFunctionType = (
  countryName: string,
  isoCode: isoCode,
  value: string,
  prefix?: string,
  suffix?: string,
) => string;

type onClickFunctionType = (
  event: React.MouseEvent<SVGElement, MouseEvent>,
  countryName: string,
  isoCode: isoCode,
  value: string,
  prefix?: string,
  suffix?: string,
) => void;
```
