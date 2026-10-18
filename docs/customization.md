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

## Projections

`WorldMap` draws in the Mercator projection by default. Mercator keeps local shapes but inflates areas far from the equator: Greenland looks about as large as Africa, which is about 14 times larger.

Pass `projection="equalEarth"` to use the [Equal Earth](https://en.wikipedia.org/wiki/Equal_Earth_projection) equal-area projection, where countries keep their true relative size. The African Union adopted it as its standard world map in 2026, and the UN General Assembly's non-binding "Correct the Map" resolution of 4 September 2026 recommends equal-area maps such as Equal Earth for general use.

```tsx
import { WorldMap, type ProjectionOption } from "react-svg-worldmap";

const [projection, setProjection] = useState<ProjectionOption>("mercator");

<WorldMap data={data} projection={projection} />;
```

Notes:

- The default stays `mercator`, so existing maps render exactly as before.
- Equal Earth is about twice as wide as it is tall, so the SVG uses a 2:1 frame (height = width / 2) instead of the 4:3 Mercator frame. The width and sizing presets are unchanged.
- In Equal Earth the map is fitted to the whole globe, and the outline of the globe is drawn behind the countries in `borderColor` (with `strokeOpacity`).
- Tooltips, click and href callbacks, `richInteraction` zoom, and `showDisputedTerritories` work the same in both projections.
- `textLabelFunction` positions are SVG pixels. Labels placed for Mercator may need new coordinates for Equal Earth.

See the [Equal Earth example](/examples/equal-earth), which switches between both projections and shows the disputed-territory overlay.
