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

## Land And Ocean Clarity

The default map uses sea/background color `#A0D7EB` as the ocean/non-land field, neutral no-data land color `#F4F2F2`, and a softer country/coastline stroke. Country geometry is emitted as closed shapes so land fills stay distinct from the sea/background field. The SVG paint stack is ocean/background, countries, optional regions, labels, pins, and interaction targets, so overlays do not replace the base country fills. This improves the land-vs-ocean separation that users expect from clear map products while keeping the component SVG-only and themeable.

Use `backgroundColor`, `borderColor`, and `color` for simple theming:

```tsx
<WorldMap
  data={data}
  backgroundColor="#A0D7EB"
  borderColor="#607d86"
  color="#4f83cc"
/>
```

Use `styleFunction` when you need full control over land fills and data opacity. For readable results, keep no-data land visibly distinct from the ocean/background and avoid making internal region borders look stronger than country borders.

Geometry detail is disclosed gradually. The initial world view uses reduced closed country geometry below `2x`, detailed country geometry can load at `2x`, and optional region overlays can load at `4x` when a compatible provider is selected. Styling callbacks apply to both country tiers.

## Rich interactions

This optional interaction mode captures a few events inside the SVG graphics. Current interactions include:

- Double-clicking causes the map to zoom in around the clicked point.

TODO:

- Vertical-scrolling causes the map to zoom in and out.
- Draggable when zoomed in.
- Separate scale slider and zoom button components.

## Zoom Labels And Pins

The `zoom` prop enables bottom-right zoom controls, drag panning, double-click zoom, default country labels, and optional pins. The controls use accessible `+` and `-` buttons. Double-click zoom uses the clicked point as the zoom origin and the same configured `zoomFactor` as the `+` control.

Zoom updates are staged: the map transform responds first, then labels, pins, detailed country geometry, and optional region overlays settle. This keeps the default examples smooth while preserving the SVG rendering and accessibility model.

Labels are placed from projected country geometry and filtered by available country area and overlap with already accepted labels. For countries with non-contiguous territory, placement uses the largest projected geometry part so the label is not centered over empty space between distant regions.

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

## Country Map Granularity

Country geometry is bundled in the core package and regenerated from the documented Natural Earth Admin 0 source path with at least 6 decimal places of retained source precision. Custom styling, labels, and pins use reduced geometry for the initial world view and detailed geometry at `2x` and above after TopoJSON compression, delta encoding, minification, and quality-budgeted quantization. Very small islands and coastlines remain covered by validation fixtures while the map remains a non-authoritative thematic visualization.

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

The optional provider exposes coverage metadata so applications can check whether a country is supported before enabling region detail. It currently includes complete target-country first-level coverage for 23 countries. Future non-target countries may use partial or experimental coverage metadata, but the target-country package does not mark target countries as experimental. Unsupported, failed, or unavailable detail keeps the country-level view instead of breaking the map.

Internal region borders are dotted by default, and region labels use the same zoom-aware fit and collision behavior as country labels. When region detail is visible, country borders are drawn slightly stronger so country edges remain readable. Region overlay hover text is intentionally concise and uses `Region, Country`; put longer source or policy explanations in surrounding documentation instead of hover UI.
