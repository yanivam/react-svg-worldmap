---
sidebar_position: 3
---

# Customization

## Custom Styling

This is an optional more advanced customization option. When used, the developer has full control to define the color, opacity and any other style element of a country with data record.

This is done by passing your custom implementation of the `styleFunction`. The function recieves as input the country context that includes `country`, `countryValue`, `color`, `minValue` and `maxValue`, and returns a React `CSSProperties` object.

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
