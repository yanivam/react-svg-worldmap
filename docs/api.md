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
- `ZoomOptions`: options for opt-in zoom controls, country labels, and pins.
- `ZoomState`: the current zoom scale and translation.
- `DetailLevel`: whether the map is showing countries or opt-in region detail.
- `DetailProvider`: provider interface for optional region-detail data.
- `DetailProviderResult`: status result returned by a region detail provider.
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
| `backgroundColor` | `string` | Component background color. Defaults to sea/background color `#A0D7EB` so neutral land shapes remain distinct from the surrounding ocean/background. |
| `strokeOpacity` | `string` | The stroke opacity of non selected countries. |
| `frame` | `boolean` | Should a frame be drawn around the map. |
| `frameColor` | `string` | Frame color. |
| `borderColor` | `string` | Border color around each individual country. Defaults to a softer coastline stroke that separates land without implying a legal basemap. |
| `richInteraction` | `boolean` | Enables legacy keyboard and double-click map interactions without the full `zoom` control surface. |
| `zoom` | <code>boolean &#124; ZoomOptions</code> | Enables bottom-right zoom in/out controls, drag panning, double-click zoom, default country labels, and optional pins. See [Zoom with regions example](/examples/zoom). |
| `pins` | `readonly MapPin[]` | Optional longitude/latitude pins with captions. |
| `onZoomChange` | `(state: ZoomState) => void` | Called when zoom scale or translation changes. |
| `detailLevel` | <code>'countries' &#124; 'regions'</code> | Optional detail mode. Defaults to country-level rendering. |
| `detailProvider` | `DetailProvider` | Optional provider for region-detail data. Required only when `detailLevel="regions"` should display regional boundaries. |
| `onDetailStatusChange` | `(status: DetailProviderResult) => void` | Called when region detail becomes loading, ready, unavailable, or failed. |
| :construction: `type` :construction: | `string` | Select type of map you want, either "tooltip" or "marker". <br />:memo: This functionality not only complicates the code, but is infrequently used and needs to be redesigned to make it better. For now it is deprecated and has no effect. :memo: |
| `styleFunction` | `(context: CountryContext) => React.CSSProperties` | A callback function to customize styling of each country (see [Custom styles example](/examples/custom-style)) |
| `hrefFunction` | <code>(context: CountryContext) => object &#124; string &#124; undefined</code> | A callback function to bind an href link to each country. The return can be the target URL as a string or an object specifying props passed to the anchor element (e.g. `href` and `target`). (see [Href binding example](/examples/links)) |
| `tooltipTextFunction` | `(context: CountryContext) => string` | A callback function to customize tooltip text (see [Localization example](/examples/localization)) |
| `onClickFunction` | `(context: CountryContext & {event: React.MouseEvent}) => void` | A callback function to add custom onclick logic (see [Onclick action example](/examples/onclick)) |
| `textLabelFunction` | `(mapWidth: number) => ({label: string} & TextProps)[]` | A callback function to draw text labels on the map (see [Text labels example](/examples/text-labels)) |

</small>

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

type ZoomOptions = {
  enabled?: boolean;
  initialScale?: number;
  minScale?: number;
  zoomFactor?: number;
  showControls?: boolean;
  showCountryLabels?: boolean;
  countryLabelMinFontSize?: number;
  countryLabelMaxFontSize?: number;
  countryLabelZoomGrowthRate?: number;
  showPins?: boolean;
};

type ZoomState = {
  scale: number;
  translate: [number, number];
};

type MapPin = {
  id?: string;
  coordinates: readonly [number, number];
  caption: string;
  countryCode?: ISOCode;
  kind?: string;
  priority?: number;
};

type DetailLevel = "countries" | "regions";

type RegionCoverageStatus =
  | "complete"
  | "partial"
  | "experimental"
  | "unavailable";

type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

type RegionCoverageRecord = {
  countryCode: ISOCode;
  countryName: string;
  status: RegionCoverageStatus;
  regionCount: number;
  expectedRegionCount?: number;
  sourceSummary?: string;
  sourceUrl?: string;
  reviewNotes?: string;
};

type RegionFeatureRecord = {
  id: string;
  countryCode: ISOCode;
  name: string;
  localizedName?: string;
  kind?: string;
  path: string;
  centroid?: readonly [number, number];
  bounds?: readonly [readonly [number, number], readonly [number, number]];
  order?: number;
  sourceId?: string;
};

type RegionCollectionRecord = {
  countryCode: ISOCode;
  countryName: string;
  coverageStatus: RegionCoverageStatus;
  expectedRegionCount?: number;
  sourceSummary?: string;
  sourceUrl?: string;
  regions: RegionFeatureRecord[];
  reviewNotes?: string;
};

type DetailProviderResult = {
  status: DetailLayerStatus;
  layer: "regions";
  countryCode?: ISOCode;
  coverageStatus?: RegionCoverageStatus;
  collection?: RegionCollectionRecord;
  warning?: string;
};

type DetailProvider = {
  supports(countryCode: ISOCode): boolean;
  getCoverage?(countryCode?: ISOCode): RegionCoverageRecord[];
  loadRegions(countryCode: ISOCode): Promise<DetailProviderResult>;
};
```

When zoom is enabled, country border strokes keep a constant screen-space thickness while the map scales. This prevents borders from becoming visually heavier during repeated zoom-in actions.

Zoom controls render as a compact bottom-right map overlay with accessible `+`, `-`, and `Reset zoom` buttons. The default `zoomFactor` is `2`, so each click moves faster than the earlier granular control step. Double-clicking the map zooms in around the clicked point and uses the same configured `zoomFactor` as the `+` button, so custom zoom tuning applies consistently across button and pointer interactions. The `Reset zoom` button restores the initial full-world scale and position in one click.

Default country labels use clamped screen-space sizing while zooming. The default label target starts at `12px`, grows gradually as zoom increases, and caps at `20px`; placement still rejects labels that do not fit the country shape or that collide with higher-priority labels. Override `countryLabelMinFontSize`, `countryLabelMaxFontSize`, or `countryLabelZoomGrowthRate` inside `zoom` to tune that behavior.

## Land And Ocean Clarity

The map is still a lightweight SVG thematic visualization, not a commercial basemap. Its default presentation separates land from the surrounding ocean/background by using sea/background color `#A0D7EB`, neutral no-data land color `#F4F2F2`, and a softer country/coastline stroke. Country geometry is emitted as closed shapes so the sea/background layer cannot fill land areas. The SVG paint order is explicit: ocean/background first, country land and borders second, optional dotted regions third, labels fourth, pins fifth, and interaction/accessibility targets last. This follows common basemap readability principles such as land/water contrast and coastline emphasis without adding Google Maps, hosted tiles, raster imagery, terrain/satellite rendering, external geometry providers, or custom map provider APIs.

Consumers can theme this with existing props:

```tsx
<WorldMap
  data={data}
  backgroundColor="#A0D7EB"
  borderColor="#607d86"
  color="#4f83cc"
/>
```

For full control of land fills, pass `styleFunction`; keep enough contrast between `backgroundColor`, country fill, country stroke, and labels for the target page theme.

## Geometry Detail Disclosure

Country geometry is bundled in reduced and detailed closed-shape tiers. Below `2x` zoom, the map uses the reduced country tier for lower initial parse and render cost. At `2x` and above, the core package can load its detailed country tier from a package-local module. At `4x` and above, selected region geometry can load when `detailLevel="regions"` and a compatible optional `detailProvider` is supplied.

The core package owns these built-in thresholds for now. External geometry providers and custom map provider APIs are future extension points, not part of the current public API.

## Region Detail

Region detail is opt-in and provider-backed. Country-level rendering remains the default, and the core package does not require the optional regions package at runtime. The component does not ask a provider to load region geometry below `4x` zoom.

The documented setup path uses four consumer steps: install `@react-svg-worldmap/regions`, import `createRegionsDetailProvider`, pass the created provider through `detailProvider`, and set `detailLevel="regions"` with zoom enabled.

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const detailProvider = createRegionsDetailProvider();

<WorldMap
  data={[{ country: "US", value: 1 }]}
  zoom
  detailLevel="regions"
  detailProvider={detailProvider}
/>;
```

If a provider is omitted, fails, or does not support the focused country, the map keeps the country-level view and reports the detail status through `onDetailStatusChange`. Target-country coverage in `@react-svg-worldmap/regions` currently includes complete first-level regions for 23 countries across the Americas, Europe, Asia, Africa, and Oceania. Future non-target countries may use `partial`, `experimental`, or `unavailable` metadata, but all target countries in the optional package are complete. Internal region borders are dotted, region labels follow the same fit and collision rules as country labels, and coverage/source limitations are documented through package metadata.

## Bundled Country Topology

The core package bundles country-level TopoJSON generated from the documented Natural Earth Admin 0 source path. The current generation keeps at least 6 decimal places of retained source precision, then applies TopoJSON arc sharing, delta encoding, JSON minification, and quality-budgeted quantization to keep the packed core package near 1 MB while preserving validation fixtures for small islands, coastlines, borders, and small countries.
