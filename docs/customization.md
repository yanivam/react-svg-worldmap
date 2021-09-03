---
sidebar_position: 3
---

# Customization

## Custom Styling

This is an optional more advanced customization option. When used, the developer has full control to define the color, opacity and any other style element of a country with data record.

This is done by passing your custom implementation of the `styleFunction`. The function recieves as input the country context that includes `country`, `countryValue`, `color`, `minValue` and `maxValue`, and returns a React `CSSProperties` object. Note that `countryValue` can be undefined, for which case you may need to handle the styling differently.

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
  const opacityLevel = countryValue
    ? 0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue)
    : 0;
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
