---
sidebar_position: 4
---

# API

## Export members

- `SizeOption`: the union of available sizes.
- `ProjectionOption`: the union of available projections, `"mercator" | "equalEarth"`.
- `projectionOptions`: the list of available projections.
- `ISOCode`: the ISO code available to name countries.
- `DataItem`: the type for each country's value to be passed in the `data` prop.
- `Data`: it's just `DataItem[]`, for more convenience.
- `CountryContext`: the context in rendering each country, to be used in customization callbacks.
- `Props`: the props type for the `WorldMap` component.
- `mapRenderingLayers`: the SVG layers in paint order (`ocean`, `countries`, `disputed-territories`, `labels`, `country-labels`, `pins`), each rendered as `<g data-map-layer>`. `mapRenderingLayerOrder` maps a layer to its order and `MapRenderingLayerId` is the layer type. See [Styling and testing hooks](./customization.md#styling-and-testing-hooks).
- `regions`: the list of regions (`{ name, code }`) available in the library
- `disputedTerritories`: Tier 1 dispute metadata keyed by dispute ID (`crimea`, `palestinian-territories`, `taiwan`, `kashmir`, `western-sahara`, `kosovo`).
- `disputeIds`: the list of dispute IDs.
- `disputesByCountryCode`: map from rendered country code (e.g. `UA`, `XK`) to dispute ID.
- `getDisputeById(id)` / `getDisputeByCountryCode(code)`: lookups returning a `DisputeClassification` (or `undefined` for a country code with no dispute).
- `disputedTerritoryAreas`: the territory shapes drawn by `showDisputedTerritories` (`{ id, name, disputeId, administration }`), e.g. `crimea`, `aksai-chin`, `west-bank`.
- `DisputedTerritoryContext`, `DisputedTerritoryArea`, `DisputeClassification`, `DisputeDisplayGuidance`, `DisputeTier`, `DisputeStatus`, `DisputeReviewStatus`, `DisputeBorderStyle`, `DisputeLabelStrategy`, `DisputeId`: types for the dispute metadata.
- `ZoomOptions`, `ZoomState`: the options of the `zoom` prop and the state passed to `onZoomChange`. See [Zoom and pan](#zoom-and-pan).
- `MapPin`: one entry of the `pins` prop.
- `preloadDetailedCountryGeometry()`: starts loading the detailed country borders drawn when zoomed in, for example when the pointer enters the map, so the first zoom shows them at once. See [Detailed borders](#detailed-borders).
- `DetailProvider`, `DetailProviderResult`, `DetailLevel`, `DetailStatus`, `RegionCollection`, `RegionFeature`, `RegionCoverageStatus`: types for region detail. See [Region detail](#region-detail).
- `createReadyDetailResult`, `createUnavailableDetailResult`, `createFailedDetailResult`, `createIdleDetailResult`, `isReadyDetailResult`: helpers to build and check `DetailProviderResult` values.
- `CountryLabelCandidate`: a placed country label (code, name, position and size in map coordinates).
- `WorldMap`: available both as named and default export. The actual component to be rendered.

## Props

<small>

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `Data` | Mandatory. Array of JSON records, each with country/value. |
| `size` | <code>SizeOption &#124; 'responsive' &#124; number</code> | The size of your map. `responsive` mode fills the width of its container. See [Sizing](#sizing) for details, and see [Sizing example](/examples/sizing) |
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
| `richInteraction` | `boolean` | When turned on, double-click zooms the map 1x → 2x → 4x → reset, and `+` / `-` zoom in and reset from the keyboard. For full zoom and pan, use `zoom`. |
| `zoom` | <code>boolean &#124; ZoomOptions</code> | Opt-in zoom and pan with buttons, drag, double-click, keyboard and ctrl / ⌘ + wheel; also shows country labels. Off by default. See [Zoom and pan](#zoom-and-pan) and the [Zoom example](/examples/zoom). |
| `onZoomChange` | `(state: ZoomState) => void` | Called with the new zoom state each time the zoom or pan changes (not on mount). |
| `pins` | `MapPin[]` | Markers with captions at longitude / latitude. Shown with or without `zoom`; overlapping pins are dropped by `priority`. |
| `pinColor` | `string` | Fill color of the pin markers. Default `#b91c1c`. |
| `pinTextColor` | `string` | Color of the pin captions. Default `#1f2937`. |
| `pinOutlineColor` | `string` | Outline of the pin markers and halo behind their captions. Default `#fff`. |
| `labelColor` | `string` | Color of the country labels shown with `zoom`. Default `#222`. |
| `labelHaloColor` | `string` | Halo drawn behind the country labels, for dark or busy maps. Default: none. |
| `detailLevel` | <code>'countries' &#124; 'regions'</code> | `regions` draws the regions (states, provinces) of the countries in view from `detailProvider`, as dashed borders, once zoomed in to `zoom.regionDetailMinScale`. Needs `zoom`. Default `countries`. See [Region detail](#region-detail). |
| `detailProvider` | `DetailProvider` | Supplies region geometry for `detailLevel="regions"`. |
| `onDetailStatusChange` | `(status: DetailProviderResult) => void` | Called when regions start loading, finish or fail for a country, and with `idle` when they are hidden again. |
| `projection` | <code>'mercator' &#124; 'equalEarth'</code> | Map projection. Default `mercator`. `equalEarth` shows countries at their true relative size. See [Projections](./customization.md#projections) and the [Equal Earth example](/examples/equal-earth). |
| :construction: `type` :construction: | `string` | Select type of map you want, either "tooltip" or "marker". <br />:memo: This functionality not only complicates the code, but is infrequently used and needs to be redesigned to make it better. For now it is deprecated and has no effect. :memo: |
| `styleFunction` | `(context: CountryContext) => React.CSSProperties` | A callback function to customize styling of each country (see [Custom styles example](/examples/custom-style)) |
| `hrefFunction` | <code>(context: CountryContext) => object &#124; string &#124; undefined</code> | A callback function to bind an href link to each country. The return can be the target URL as a string or an object specifying props passed to the anchor element (e.g. `href` and `target`). (see [Href binding example](/examples/links)) |
| `tooltipTextFunction` | `(context: CountryContext) => string` | A callback function to customize tooltip text (see [Localization example](/examples/localization)) |
| `onClickFunction` | `(context: CountryContext & {event: React.MouseEvent}) => void` | A callback function to add custom onclick logic (see [Onclick action example](/examples/onclick)) |
| `showDisputedTerritories` | `boolean` | Draw the disputed territories (Crimea, the Kashmir areas, West Bank, Gaza, Western Sahara, Kosovo, Taiwan) as a red overlay above the countries. Off by default. (see [Dispute metadata example](/examples/disputes)) |
| `disputedTerritoryColor` | `string` | Fill and border color of the disputed-territory overlay. Default `#d32f2f`. |
| `disputedTerritoryTooltipFunction` | `(context: DisputedTerritoryContext) => string` | Tooltip text for each territory. The default lists status, recognized sovereign, controlling power, and parties. |
| `onDisputedTerritoryClick` | `(context: DisputedTerritoryContext & {event: React.MouseEvent}) => void` | Called when a territory in the overlay is clicked. |
| `textLabelFunction` | `(mapWidth: number) => ({label: string} & TextProps)[]` | A callback function to draw text labels on the map (see [Text labels example](/examples/text-labels)) |

</small>

```ts
type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";

type ProjectionOption = "mercator" | "equalEarth";

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
  dispute?: DisputeClassification; // Tier 1 dispute metadata, if any
};

type DisputedTerritoryContext = {
  territoryId: string; // e.g. "crimea", "aksai-chin"
  territoryName: string;
  administration: string; // Natural Earth note, e.g. "Admin. by Russia; Claimed by Ukraine"
  dispute: DisputeClassification; // includes status, parties, unStanding, sourceRationale
};
```

## Zoom and pan

`zoom` is off by default. `zoom` (or `zoom={true}`) turns it on with the defaults below; pass an object to change them:

```ts
type ZoomOptions = {
  enabled?: boolean; // default true when an object is passed
  initialScale?: number; // default 1
  minScale?: number; // default 1
  maxScale?: number; // default 8
  zoomFactor?: number; // zoom per button, key or double-click, default 2
  showControls?: boolean; // zoom in / zoom out / reset buttons, default true
  showCountryLabels?: boolean; // default true
  countryLabelMinFontSize?: number; // label size at 1x, in px, default 12
  countryLabelMaxFontSize?: number; // default 20
  countryLabelZoomGrowthRate?: number; // default 0.35
  showPins?: boolean; // default true
  detailedGeometry?: boolean; // load detailed borders when zoomed in, default true
  detailedGeometryMinScale?: number; // default 2
  regionDetailMinScale?: number; // zoom for detailLevel="regions", default 4
};

type ZoomState = {
  scale: number; // 1 shows the whole map
  translate: [number, number]; // offset of the map, in SVG pixels
};

type MapPin = {
  id?: string;
  coordinates: [longitude: number, latitude: number];
  caption: string;
  countryCode?: ISOCode; // written to data-country-code
  kind?: string; // written to data-map-pin, default "pin"
  priority?: number; // higher wins when pins overlap; default: earlier pins win
};
```

With `zoom` on:

- **Buttons**: zoom in, zoom out and reset, at the bottom right of the map.
- **Pointer**: drag to pan, double-click to zoom in around the pointer. A drag keeps going if the pointer leaves the map, and a drag that ends over a country doesn't click it.
- **Wheel**: hold ctrl (or ⌘) and scroll, or pinch on a trackpad, to zoom around the pointer. A plain wheel scrolls the page as usual, so the map never traps page scrolling.
- **Keyboard** (once the map has focus): `+` / `=` zoom in, `-` / `_` zoom out, arrow keys pan, `Escape` resets. The buttons come before the map in the tab order.
- The map always covers its viewport: you can't pan past its edges, with either projection.
- Zoom changes are announced to screen readers through a polite live region.
- Zooming and panning are animated, except while dragging and when the user prefers reduced motion.
- Country borders keep a constant width while zooming (`vector-effect: non-scaling-stroke`).

Country labels are drawn only where the name fits inside the country, larger countries first, at a constant on-screen size that grows slightly as you zoom in. Pins also keep their on-screen size.

`onZoomChange` is called from the interaction that changed the state, so you can store the state in your own component without causing a render loop:

```tsx
const [zoomState, setZoomState] = useState<ZoomState>();

<WorldMap data={data} zoom={{ maxScale: 6 }} onZoomChange={setZoomState} />;
```

Without `zoom`, `richInteraction` behaves exactly as in earlier releases.

### Detailed borders

With `zoom`, the map switches to detailed country borders (Natural Earth 10m) once zoomed in to `detailedGeometryMinScale` (default 2), and back to the default borders below it. The countries, their names and codes, and every callback stay the same; only the outlines get sharper. Disputed areas are assigned as in the default map; for example Crimea is part of Ukraine in both. See the [Map Data Policy](https://github.com/yanivam/react-svg-worldmap/blob/main/docs/map-data-policy.md#detailed-geometry).

The detailed data (about 2.4 MB, 360 kB gzipped) is a separate file, `dist/map-assets/countries-detailed.cjs`, loaded with `import()` the first time it is needed, so it is not part of the default bundle and Vite and webpack emit it as its own chunk. The map shows the default borders until it has loaded, and keeps them if it fails to load. Call `preloadDetailedCountryGeometry()` to load it ahead of time, or pass `zoom={{ detailedGeometry: false }}` to never load it. The countries layer has `data-map-geometry="default"` or `"detailed"` while `zoom` is on. Without `zoom` (including with `richInteraction`), the detailed data is never loaded.

### Region detail

`detailLevel="regions"` draws the regions of the countries in view as dashed borders once zoomed in to `regionDetailMinScale` (default 4). The regions come from a `detailProvider`: the map asks it for each country in view that it `supports`, once per country for the same provider.

```ts
type DetailProvider = {
  supports: (countryCode: ISOCode) => boolean;
  loadRegions: (countryCode: ISOCode) => Promise<DetailProviderResult>;
};

type RegionFeature = {
  id: string; // written to data-region-id
  countryCode: ISOCode;
  name: string; // written to data-region-name
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon; // [longitude, latitude]
};

type RegionCollection = {
  countryCode: ISOCode;
  countryName?: string;
  coverageStatus?: "complete" | "partial" | "experimental";
  regions: RegionFeature[];
  sourceSummary?: string;
  sourceUrl?: string;
};
```

Region geometry is GeoJSON in `[longitude, latitude]` degrees, with the exterior ring clockwise (d3's winding, as produced by `topojson-client`). The map projects it with the current `projection`, so the same provider works with Mercator and Equal Earth. Return `createReadyDetailResult(collection)` when the regions are ready and `createUnavailableDetailResult(countryCode)` when there are none; a rejected promise is reported as `failed`.

```tsx
const provider: DetailProvider = {
  supports: (code) => code.toUpperCase() === "US",
  loadRegions: async (code) => {
    const collection = await fetchUsStates(); // your own data
    return createReadyDetailResult(collection);
  },
};

<WorldMap
  data={data}
  zoom
  detailLevel="regions"
  detailProvider={provider}
  onDetailStatusChange={(status) => console.log(status.status)}
/>;
```

Region borders are drawn in `borderColor` at the `strokeOpacity` of the countries, in a `<g data-map-sublayer="regions" class="worldmap__regions">` inside the countries layer (so the layer order numbers stay the same); style `.worldmap__regions path` with CSS to change them. `onDetailStatusChange` is called from the load itself, so storing the status in your component can't cause a render loop.
