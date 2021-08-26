---
sidebar_position: 3
---

# Customization

## Custom Styling

This is an optional more advanced customization option. When used, the developer has full control to define the color, opacity and any other style element of a country with data record.

This is done by passing your custom implementation of the `styleFunction`. The function recieves as input the country context that includes country,countryValue: colorm, minValue and maxValue, and returns a json object representing the style.

For example:

```tsx
import {CountryContext} from 'react-svg-worldmap';

const stylingFunction = ({
  countryValue,
  minValue,
  maxValue,
  country,
  color,
}: CountryContext) => {
  const opacityLevel =
    0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue);
  return {
    fill: country === 'US' ? 'blue' : color,
    fillOpacity: opacityLevel,
    stroke: 'green',
    strokeWidth: 1,
    strokeOpacity: 0.2,
    cursor: 'pointer',
  };
};
```

## Onclick Action

This is an optional more advanced customization option. When used, the developer has full access to the click event, country name, iso code, value, prefix and suffix is given.

This is done by passing your custom implementation of the `onClickFunction`. The function takes in the following parameters:

1. `event: React.MouseEvent<SVGElement, MouseEvent>`
2. `countryName: string`
3. `isoCode: string`
4. `value: string`
5. `prefix?: string`
6. `suffix?: string`

## Sizing

The `size` can be a number specifying the width of the map, in pixels. It can also be one of the following aliases:

| Alias | Width |
| ----- | ----- |
| `sm`  | 240   |
| `md`  | 336   |
| `lg`  | 480   |
| `xl`  | 640   |
| `xxl` | 1200  |

When the `size` is set to `responsive`, the map size will be set automatically based on the window size.

:::info

The algorithm used in responsive sizing is:

```js
const width = Math.min(window.innerHeight, window.innerWidth) * 0.75;
```

:::

## Props

<small>

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `Data[]` | Mandatory. Array of JSON records, each with country/value. |
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
| `hrefFunction` | See below | A callback function to bind an href link to each country (see [Href binding example](/examples/links)) |
| `tooltipTextFunction` | See below | A callback function to customize tooltip text (see [Localization example](/examples/localization)) |
| `onClickFunction` | See below | A callback function to add custom onclick logic (see [Onclick action example](/examples/onclick)) |

</small>

```ts
type Data = {
  country: string;
  value: number;
};

type hrefFunctionType = (
  countryName: string,
  isoCode: string,
  value: string,
  prefix?: string,
  suffix?: string,
) => string | undefined;

type tooltipTextFunctionType = (
  countryName: string,
  isoCode: string,
  value: string,
  prefix?: string,
  suffix?: string,
) => string;

type onClickFunctionType = (
  event: React.MouseEvent<SVGElement, MouseEvent>,
  countryName: string,
  isoCode: string,
  value: string,
  prefix?: string,
  suffix?: string,
) => void;
```
