import type React from "react";
import type GeoJSON from "geojson";

// ISO 3166-1 alpha-2 codes for every country in the world map.
// Kept as a const tuple so that `ISOCode` is a precise string-literal union
// rather than plain `string`, giving consumers autocomplete and typo-checking.
/* prettier-ignore */
const ISO_CODES = ["FJ","TZ","EH","CA","US","KZ","UZ","PG","ID","AR","CL","CD","SO","KE","SD","TD","HT","DO","RU","BS","FK","NO","GL","TL","ZA","LS","MX","UY","BR","BO","PE","CO","PA","CR","NI","HN","SV","GT","BZ","VE","GY","SR","FR","EC","PR","JM","CU","ZW","BW","NA","SN","ML","MR","BJ","NE","NG","CM","TG","GH","CI","GN","GW","LR","SL","BF","CF","CG","GA","GQ","ZM","MW","MZ","SZ","AO","BI","IL","LB","MG","PS","GM","TN","DZ","JO","AE","QA","KW","IQ","OM","VU","KH","TH","LA","MM","VN","KP","KR","MN","IN","BD","BT","NP","PK","AF","TJ","KG","TM","IR","SY","AM","SE","BY","UA","PL","AT","HU","MD","RO","LT","LV","EE","DE","BG","GR","TR","AL","HR","CH","LU","BE","NL","PT","ES","IE","NC","SB","NZ","AU","LK","CN","TW","IT","DK","GB","IS","AZ","GE","PH","MY","BN","SI","FI","SK","CZ","ER","JP","PY","YE","SA","CY","MA","EG","LY","ET","DJ","UG","RW","BA","MK","RS","ME","XK","TT","SS"] as const;
export type ISOCode =
  (typeof ISO_CODES)[number] | Lowercase<(typeof ISO_CODES)[number]>;
export type SizeOption = "sm" | "md" | "lg" | "xl" | "xxl";
/** Map projection. `"mercator"` is the default. */
export type ProjectionOption = "mercator" | "equalEarth";

/**
 * The SVG layers of the map, in paint order (first is drawn at the back).
 * Each layer is a direct child `<g>` of the map's `<svg>` with
 * `data-map-layer="<id>"` and `data-map-layer-order="<index>"`. The order
 * numbers only describe relative paint order; later releases may insert
 * layers between them.
 */
export const mapRenderingLayers = [
  "ocean",
  "countries",
  "disputed-territories",
  "labels",
  "country-labels",
  "pins",
] as const;

export type MapRenderingLayerId = (typeof mapRenderingLayers)[number];

export const mapRenderingLayerOrder = Object.fromEntries(
  mapRenderingLayers.map((layer, index) => [layer, index]),
) as Record<MapRenderingLayerId, number>;

/**
 * The pan and zoom of the map. `scale` is the zoom level (1 shows the whole
 * map) and `translate` is the offset of the map in SVG pixels.
 */
export interface ZoomState {
  scale: number;
  translate: [number, number];
}

/** Options for the `zoom` prop. Every field is optional. */
export interface ZoomOptions {
  /** Set to `false` to turn zoom off while keeping the options object. */
  enabled?: boolean;
  /** Zoom level on first render. Default `1`. */
  initialScale?: number;
  /** Lowest zoom level. Default `1`. */
  minScale?: number;
  /** Highest zoom level. Default `8`. */
  maxScale?: number;
  /** Zoom per step (button, key or double-click). Default `2`. */
  zoomFactor?: number;
  /** Show the zoom in / zoom out / reset buttons. Default `true`. */
  showControls?: boolean;
  /** Show country names that fit inside their country. Default `true`. */
  showCountryLabels?: boolean;
  /** Country label size at zoom level 1, in pixels. Default `12`. */
  countryLabelMinFontSize?: number;
  /** Largest country label size, in pixels. Default `20`. */
  countryLabelMaxFontSize?: number;
  /** How fast labels grow as you zoom in (exponent). Default `0.35`. */
  countryLabelZoomGrowthRate?: number;
  /** Show the `pins` prop's pins. Default `true`. */
  showPins?: boolean;
  /**
   * Load the detailed (Natural Earth 10m) country borders when zoomed in to
   * `detailedGeometryMinScale` or more. They load once, on first use, as a
   * separate file. Default `true`.
   */
  detailedGeometry?: boolean;
  /** Zoom level at which the detailed borders are drawn. Default `2`. */
  detailedGeometryMinScale?: number;
  /**
   * Zoom level at which `detailLevel="regions"` loads and draws regions.
   * Default `4`.
   */
  regionDetailMinScale?: number;
}

/** `"regions"` draws a `detailProvider`'s regions when zoomed in. */
export type DetailLevel = "countries" | "regions";

export type DetailStatus =
  "idle" | "loading" | "ready" | "unavailable" | "failed";

export type RegionCoverageStatus = "complete" | "partial" | "experimental";

/**
 * One region (state, province, ...) of a country. The geometry is GeoJSON in
 * `[longitude, latitude]` degrees, like the bundled countries, and the map
 * projects it with the current `projection`. Rings follow d3's winding: the
 * exterior ring is clockwise.
 */
export interface RegionFeature {
  /** Stable id, written to the path's `data-region-id`. */
  id: string;
  countryCode: ISOCode;
  name: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

/** The regions of one country, as returned by a `DetailProvider`. */
export interface RegionCollection {
  countryCode: ISOCode;
  countryName?: string;
  coverageStatus?: RegionCoverageStatus;
  regions: readonly RegionFeature[];
  /** Where the region data comes from, for attribution. */
  sourceSummary?: string;
  sourceUrl?: string;
}

/** The state of the region layer, or of one country's regions. */
export interface DetailProviderResult {
  status: DetailStatus;
  layer: "regions";
  countryCode?: ISOCode;
  coverageStatus?: RegionCoverageStatus;
  /** Set when `status` is `"ready"`. */
  collection?: RegionCollection;
  warning?: string;
}

/**
 * Supplies region geometry for `detailLevel="regions"`. The map asks for the
 * countries in view once it is zoomed in to `regionDetailMinScale`, at most
 * once per country for a given provider.
 */
export interface DetailProvider {
  supports: (countryCode: ISOCode) => boolean;
  loadRegions: (countryCode: ISOCode) => Promise<DetailProviderResult>;
}

/** A marker drawn at a longitude / latitude with a caption. */
export interface MapPin {
  /** Stable key. Defaults to the caption and index. */
  id?: string;
  /** `[longitude, latitude]` in degrees. Invalid coordinates are skipped. */
  coordinates: readonly [number, number];
  caption: string;
  /** Written to the pin's `data-country-code` attribute. */
  countryCode?: ISOCode;
  /** Written to the pin's `data-map-pin` attribute. Default `"pin"`. */
  kind?: string;
  /**
   * When pins overlap, the one with the higher priority is kept. Defaults to
   * the order of the `pins` array (earlier pins win).
   */
  priority?: number;
}

/** A country label that fits inside its country, in map coordinates. */
export interface CountryLabelCandidate {
  countryCode: ISOCode;
  countryName: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  priority: number;
}

export interface DataItem<T extends string | number = number> {
  country: ISOCode;
  value: T;
}

export type Data<T extends string | number = number> = DataItem<T>[];

export type DisputeTier = "tier-1";

export type DisputeStatus =
  | "disputed"
  | "partially-recognized"
  | "non-self-governing"
  | "politically-sensitive";

export type DisputeReviewStatus =
  "active" | "deferred" | "maintainer-review-required";

export type DisputeBorderStyle = "solid" | "dashed" | "unchanged";

export type DisputeLabelStrategy =
  "single" | "dual" | "segment" | "metadata-only";

export interface DisputeDisplayGuidance {
  borderStyle: DisputeBorderStyle;
  labelStrategy: DisputeLabelStrategy;
  tooltipLabel: string;
  defaultDescription: string;
}

export interface DisputeClassification {
  id: string;
  name: string;
  tier: DisputeTier;
  status: DisputeStatus;
  recognizedSovereign?: string | undefined;
  controllingPower?: string | undefined;
  disputeParties: readonly string[];
  territories: readonly string[];
  sourceRationale: string;
  /** The dispute's standing in United Nations resolutions and processes. */
  unStanding: string;
  display: DisputeDisplayGuidance;
  reviewStatus: DisputeReviewStatus;
}

/** Context for one disputed-territory shape drawn by the overlay. */
export interface DisputedTerritoryContext {
  /** Territory id, e.g. `"crimea"` or `"aksai-chin"`. */
  territoryId: string;
  territoryName: string;
  /**
   * Natural Earth administration note, e.g.
   * "Admin. by Russia; Claimed by Ukraine". Empty when none.
   */
  administration: string;
  dispute: DisputeClassification;
}

export interface CountryContext<T extends string | number = number> {
  countryCode: ISOCode;
  countryName: string;
  countryValue?: T | undefined;
  color: string;
  minValue: number;
  maxValue: number;
  prefix: string;
  suffix: string;
  dispute?: DisputeClassification | undefined;
}

export interface Props<T extends string | number = number> {
  data: DataItem<T>[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  strokeOpacity?: number;
  backgroundColor?: string;
  tooltipBgColor?: string;
  tooltipTextColor?: string;
  rtl?: boolean;
  /**
   * - number: exact pixel width
   * - "responsive": fill the available container width
   * - "sm" | "md" | "lg" | "xl" | "xxl": preset cap, shrinks if smaller
   */
  size?: SizeOption | "responsive" | number;
  /**
   * Map projection. `"mercator"` (default) or `"equalEarth"`, an equal-area
   * projection that shows countries at their true relative size.
   */
  projection?: ProjectionOption;
  frame?: boolean;
  /** Optional class for the wrapper div (for CSP or custom layout). */
  containerClassName?: string;
  /** Optional class for each region path (for CSP or custom styling). */
  regionClassName?: string;
  frameColor?: string;
  borderColor?: string;
  richInteraction?: boolean;
  /**
   * Opt-in zoom and pan: buttons, drag to pan, double-click, keyboard, and
   * ctrl / ⌘ + wheel (or trackpad pinch). Also draws country labels.
   * `true` uses the defaults; pass an object to change them.
   */
  zoom?: boolean | ZoomOptions;
  /** Called with the new state each time the zoom or pan changes. */
  onZoomChange?: (state: ZoomState) => void;
  /**
   * `"regions"` draws the regions of the countries in view, from
   * `detailProvider`, as a dashed overlay once zoomed in to
   * `zoom.regionDetailMinScale` (default 4). Needs `zoom`. Default
   * `"countries"`.
   */
  detailLevel?: DetailLevel;
  /** Where region geometry comes from, for `detailLevel="regions"`. */
  detailProvider?: DetailProvider;
  /**
   * Called when region loading starts, finishes or fails for a country, and
   * with `"idle"` when regions are hidden again. Called from the load, not
   * from an effect, so a parent that stores the status can't cause a loop.
   */
  onDetailStatusChange?: (status: DetailProviderResult) => void;
  /** Markers drawn at longitude / latitude. Shown with or without zoom. */
  pins?: readonly MapPin[];
  /** Fill colour of the pin markers. Default `"#b91c1c"`. */
  pinColor?: string;
  /** Colour of the pin captions. Default `"#1f2937"`. */
  pinTextColor?: string;
  /** Pin outline and caption halo colour. Default `"#fff"`. */
  pinOutlineColor?: string;
  /** Colour of the country labels shown with zoom. Default `"#222"`. */
  labelColor?: string;
  /** Optional halo drawn behind the country labels. Default: none. */
  labelHaloColor?: string;
  /**
   * Draw the disputed territories (Crimea, Kashmir areas, West Bank, Gaza,
   * Western Sahara, Kosovo, Taiwan) as an overlay above the countries.
   * Off by default.
   */
  showDisputedTerritories?: boolean;
  /** Fill and border colour of the disputed-territory overlay. */
  disputedTerritoryColor?: string;
  disputedTerritoryTooltipFunction?: (
    context: DisputedTerritoryContext,
  ) => string;
  onDisputedTerritoryClick?: (
    context: DisputedTerritoryContext & {
      event: React.MouseEvent<SVGElement, Event>;
    },
  ) => void;

  styleFunction?: (context: CountryContext<T>) => React.CSSProperties;

  onClickFunction?: (
    context: CountryContext<T> & { event: React.MouseEvent<SVGElement, Event> },
  ) => void;

  tooltipTextFunction?: (context: CountryContext<T>) => string;

  hrefFunction?: (
    context: CountryContext<T>,
  ) => React.ComponentProps<"a"> | string | undefined;

  textLabelFunction?: (
    width: number,
  ) => ({ label: string } & React.ComponentProps<"text">)[];
}
