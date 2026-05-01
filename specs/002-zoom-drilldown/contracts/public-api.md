# Public API Contract: Zoom Drill-Down

## Core Package Props - Phase 1 Zoom

The existing map component remains the primary package entry point.

Required additions:

```ts
type DetailLevel = "countries" | "regions";

interface ZoomOptions {
  enabled?: boolean;
  initialScale?: number;
  minScale?: number;
  zoomFactor?: number;
  showControls?: boolean;
  showCountryLabels?: boolean;
  showPins?: boolean;
}

interface Props<T extends string | number = number> {
  zoom?: boolean | ZoomOptions;
  pins?: MapPin[];
  onZoomChange?: (state: ZoomState) => void;
}

interface ZoomState {
  scale: number;
  translate: [number, number];
}
```

Compatibility requirements:

- Omitting `zoom` preserves current country-level behavior.
- `zoom={true}` enables default controls, drag panning, and country labels.
- Zoom in, zoom out, and reset controls remain keyboard-operable.
- Drag panning is available when zooming is enabled.
- Existing props, callbacks, default import, and named exports remain compatible.
- Consumers who do not install region data can continue using the base package.

## Consumer Pin Contract

```ts
interface MapPin {
  id?: string;
  coordinates: readonly [longitude: number, latitude: number];
  caption: string;
  countryCode?: ISOCode;
  kind?: string;
  priority?: number;
}
```

Behavior requirements:

- The core package renders only pins supplied through props; it does not bundle capital city metadata.
- Pin markers and captions render only when fit/collision rules determine they can be displayed clearly.
- Missing, empty, or invalid pins do not prevent country rendering or zooming.
- Documentation or website examples may include sample capital pins/data outside the core package.

## Phase 2 Region Detail Props

Required additions after Phase 1:

```ts
interface Props<T extends string | number = number> {
  detailLevel?: DetailLevel;
  detailProvider?: DetailProvider;
  regionNameTranslations?: RegionNameTranslations;
}
```

Compatibility requirements:

- Omitting `detailLevel` preserves current country-level behavior.
- Phase 2 region detail builds on the Phase 1 zoom state and controls.
- Consumers who do not install region data can continue using zoom in the base package.

## Detail Provider Contract

```ts
type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

interface DetailProvider {
  supports(countryCode: ISOCode): boolean;
  loadRegions(countryCode: ISOCode): Promise<DetailProviderResult>;
}

interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  detailLevel: DetailLevel;
  collection?: RegionCollectionRecord;
  warning?: string;
}
```

Behavior requirements:

- `detailLevel="regions"` without a provider falls back to `countries` and warns the consumer.
- Unsupported country coverage returns an unavailable state without breaking the map.
- Failed provider results recover to a stable map state.

## Region Data Contract

```ts
interface RegionCollectionRecord {
  countryCode: ISOCode;
  englishCountryName: string;
  regions: RegionFeatureRecord[];
}

interface RegionFeatureRecord {
  id: string;
  countryCode: ISOCode;
  labels: {
    englishName: string;
    localizedName?: string;
  };
  path: string;
  centroid?: [number, number];
  bounds?: [[number, number], [number, number]];
  order?: number;
}
```

Validation requirements:

- Region collections must match the requested parent country.
- Region labels must be non-empty.
- Region paths must be renderable.
- Starter coverage must be documented.

## Optional Regions Package

The Phase 2 optional package should expose:

- Normalized region data.
- Coverage metadata.
- A helper that creates a core-compatible detail provider.

Compatibility requirements:

- The core package must not depend on the optional package at runtime.
- Consumers can use a custom provider instead of the optional package.

## Accessibility Contract

The core package must provide:

- Keyboard-operable zoom controls in Phase 1.
- Explicit zoom in/zoom out/reset controls in Phase 1.
- Keyboard-operable drill-down in Phase 2.
- Visible focus treatment.
- Live announcements for scope and detail-status changes.
- Visible-region list in focused region view in Phase 2.
- Reduced-motion-friendly transitions.

## Documentation Contract

Documentation must explain:

- Country-level rendering is the default.
- Phase 1 zooming is opt-in and does not require region data.
- Country labels and consumer-supplied pins are fit/collision gated.
- Phase 2 region drill-down is opt-in.
- Optional regions package installation or provider setup for Phase 2.
- Fallback behavior when provider coverage is unavailable in Phase 2.
- Accessibility controls and keyboard usage.
- Starter coverage limitations.
