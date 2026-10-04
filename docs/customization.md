---
sidebar_position: 3
---

# Customization

## Custom Styling

This is an optional more advanced customization option. When used, the developer has full control to define the color, opacity and any other style element of a country with data record.

This is done by passing your custom implementation of the `styleFunction`. The function receives as input the country context that includes `country`, `countryValue`, `color`, `minValue` and `maxValue`, and returns a React `CSSProperties` object. Note that `countryValue` can be a number, string, or undefined, for which case you may need to handle the styling differently.

For example:

```tsx
import { CountryContext } from "react-svg-worldmap";

const stylingFunction = ({
  countryValue,
  minValue,
  maxValue,
  country,
  color,
}: CountryContext) => {
  const calculatedValue =
    typeof countryValue === "string" ? minValue : countryValue;
  const opacityLevel =
    calculatedValue !== undefined
      ? 0.1 + (1.5 * (calculatedValue - minValue)) / (maxValue - minValue)
      : 0;
  return {
    fill: country === "US" ? "blue" : color,
    fillOpacity: opacityLevel,
    stroke: "green",
    strokeWidth: 1,
    strokeOpacity: 0.2,
    cursor: "pointer",
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

When the `size` is set to `responsive`, the map fills the width of its container and grows and shrinks continuously as the container resizes. The height is always `width * 3/4`.

Because the map is not capped by the viewport height, a wide container can produce a map taller than the screen. To limit it, constrain the container, for example with `max-width`, or pass a number as the `size`.

The container needs a width that doesn't depend on its content, such as a block element or a flex item with `width: 100%` or `flex: 1`. In a shrink-to-fit container (a flex item with no width or `flex-grow`, `inline-block`, a float, or an `auto` grid column), the map and its container size each other, so the map can shrink but will not grow back.

:::info

The algorithm used in responsive sizing is:

```js
const width = availableWidth; // measured container width
```

:::

## Rich interactions

This cool UI feature would cause a few events to be captured inside the SVG graphics. Current interactions include:

- Double-clicking causes the map to zoom in twice, then restore its original scale.

TODO:

- Vertical-scrolling causes the map to zoom in and out.
- Draggable when zoomed in.
- Separate scale slider and zoom button components.
