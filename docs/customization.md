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

When the `size` is set to `responsive`, the map width grows and shrinks continuously with the available space. In practice, that means the width is capped by both:

- the measured container width, when the map is rendered inside a container
- `75%` of the smaller viewport dimension

So `responsive` mode is smooth, but it intentionally stops growing once it hits that viewport-based cap.

:::info

The algorithm used in responsive sizing is:

```js
const width = Math.min(
  availableWidth,
  Math.min(window.innerHeight, window.innerWidth) * 0.75,
);
```

:::

## Rich interactions

This cool UI feature would cause a few events to be captured inside the SVG graphics. Current interactions include:

- Double-clicking causes the map to zoom in twice, then restore its original scale.

TODO:

- Vertical-scrolling causes the map to zoom in and out.
- Draggable when zoomed in.
- Separate scale slider and zoom button components.

## Zoom Labels And Pins

The `zoom` prop enables default country labels. Labels are placed from projected country geometry and filtered by available country area and overlap with already accepted labels. For countries with non-contiguous territory, placement uses the largest projected geometry part so the label is not centered over empty space between distant regions.

Country labels use screen-space font sizing while zooming. By default they start at `12px`, grow gradually at higher zoom levels, and stop at `20px` so labels become more readable without overwhelming the map. You can tune the rule with `countryLabelMinFontSize`, `countryLabelMaxFontSize`, and `countryLabelZoomGrowthRate`:

```tsx
<WorldMap
  data={data}
  zoom={{
    countryLabelMinFontSize: 13,
    countryLabelMaxFontSize: 24,
    countryLabelZoomGrowthRate: 0.4,
  }}
/>
```

Consumers can pass `pins` to render captioned markers at projected longitude/latitude positions. The core package does not bundle capital city data; examples can provide their own sample pin lists.

## Region Detail

Region detail is provided through an optional package and a provider. Country-level maps do not need the package.

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const detailProvider = createRegionsDetailProvider();

<WorldMap
  data={data}
  zoom
  detailLevel="regions"
  detailProvider={detailProvider}
/>;
```

The starter provider exposes coverage metadata so applications can check whether a country is supported before enabling region detail. Unsupported, failed, or unavailable detail keeps the country-level view instead of breaking the map.
