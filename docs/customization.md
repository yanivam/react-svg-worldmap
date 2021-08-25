---
sidebar_position: 3
---

# Customization

## Custom Styling

This is an optional more advanced customization option. When used, the developer has full control to define the color, opacity and any other style element of a country with data record. 

This is done by passing your custom implementation of the `styleFunction`. The function recieves as input the country context that includes country,countryValue: colorm, minValue and maxValue, and returns a json object representing the style. 

For example: 

~~~tsx
import {CountryContext} from 'react-svg-worldmap';

const stylingFunction = ({countryValue, minValue, maxValue, country, color}: CountryContext) => {
  const opacityLevel = 0.1 + (1.5 * (countryValue - minValue) / (maxValue - minValue))
  return {
    fill: country === "US" ? "blue" : color, 
    fillOpacity: opacityLevel, 
    stroke: "green", 
    strokeWidth: 1, 
    strokeOpacity: 0.2, 
    cursor: "pointer" 
  };
}
~~~

## Onclick Action

This is an optional more advanced customization option. When used, the developer has full access to the click event, country name, iso code, value, prefix and suffix is given. 

This is done by passing your custom implementation of the `onClickFunction`. The function takes in the following parameters:

1. `event: React.MouseEvent<SVGElement, MouseEvent>`
2. `countryName: string`
3. `isoCode: string`
4. `value: string`
5. `prefix?: string`
6. `suffix?: string`

For example: 

~~~tsx
const clickAction = (event: React.MouseEvent<SVGElement, MouseEvent>, countryName: string, isoCode: string, value: string, prefix?: string, suffix?: string) => {
  // Your action on click that you want to perform see example in the examples folder called onclick-example
}
~~~

## Responsive Size

* `size="responsive"` When the size is set to responsive, the map size will be set automatically based on the dimensions of the window size. 

## Props

<small>

| Prop                | Type    | Description |
| ------------------- | ------- | ----------- |
| `data`              | `Data[]`  | Mandatory. Array of JSON records, each with country/value. |
| `size`              | `string`  | The size of your map, either "sm", md", "lg", "xl", "xxl", or "responsive". |
| `title`             | `string`  | Any string for the title of your map |
| `color`             | `string`  | Color for highlighted countries. A standard color string. E.g. "red" or "#ff0000" |
| `tooltipBgColor`    | `string`  | Tooltip background color |
| `tooltipTextColor`  | `string`  | Tooltip text color |
| `valuePrefix`       | `string`  | A string to prefix values in tooltips. E.g. "$" |
| `valueSuffix`       | `string`  | A string to suffix values in tooltips. E.g. "USD" |
| `backgroundColor`   | `string`  | Component background color |
| `strokeOpacity`     | `string`  | The stroke opacity of non selected countries |
| `frame`             | `boolean` | true/false for drawing a frame around the map |
| `frameColor`        | `string`  | Frame color |
| `borderColor`       | `string`  | Border color around each individual country. "black" by default |
| :construction: `type` :construction:              | `string`  | Select type of map you want, either "tooltip" or "marker". <br />:memo: This functionality not only complicated the code, but was infrequently used and needs to be rethought to make it better. For simplicity sake, I have deprecated this functionality for the time being pending on a more elegant solution. :memo: |
| `styleFunction`     | `(context: CountryContext) => React.CSSProperties`  | A callback function to customize styling of each country (see custom-style-example) |
| `hrefFunction`      | See below | A callback function to bind an href link to each country (see links-example) |
| `tooltipTextFunction` | See below | A callback function to customize tooltip text (see localization-example) |

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
  suffix?: string
) => string | undefined;

type tooltipTextFunctionType = (
  countryName: string,
  isoCode: string,
  value: string,
  prefix?: string,
  suffix?: string
) => string;
```
