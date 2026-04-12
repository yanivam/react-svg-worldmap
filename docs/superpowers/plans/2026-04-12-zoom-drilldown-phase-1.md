# Zoom Drill-Down Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in `detailLevel="regions"` mode to `react-svg-worldmap` with accessible drill-down, an optional regions data package, safe fallback to `countries`, and collision-aware default labels for country and region views.

**Architecture:** Keep the current world-country map behavior as the runtime default through `detailLevel="countries"`. Introduce an async detail-provider boundary in the core package, back it with a new npm workspace that ships normalized region data, and layer on guided zoom controls, a visible-region list, and priority-based label placement using pragmatic greedy collision detection rather than a heavyweight cartographic engine.

**Tech Stack:** React 18, TypeScript, d3-geo, topojson-client, Vitest, Testing Library, Yarn workspaces, Docusaurus docs

---

### Task 1: Reconcile the design artifacts with the approved phase 1 scope

**Files:**

- Modify: `docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md`
- Create: `docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md`

- [x] **Step 1: Update the design spec to match the new product decisions**

Revise `docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md` so it explicitly states:

```md
## Updated Phase 1 Decisions

- Use `detailLevel` instead of `precision`.
- Default to `detailLevel="countries"` for backward compatibility.
- Treat `detailLevel="regions"` as opt-in.
- If regions detail is requested but the regions package/provider is unavailable, fall back to countries and log a console warning.
- Keep capitals and largest cities out of phase 1.
- Include collision-aware default labels in phase 1.
- Show region labels only after drill-down into a country.
```

- [x] **Step 2: Add a short “Google Maps inspirations” note to the spec**

Append a subsection that narrows the inspiration down to explicit heuristics:

```md
### Labeling Inspirations

Phase 1 borrows these ideas:

- progressive disclosure by zoom/scope
- collision avoidance
- stable label visibility
- priority ordering: country before region

Phase 1 does not attempt:

- curved labels
- dense city labeling
- continuous tile-map behavior
```

- [x] **Step 3: Verify the spec and plan files are discoverable**

Run: `find docs/superpowers -maxdepth 3 -type f | sort` Expected: both `docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md` and `docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md` appear

- [x] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md
git commit -m "docs: align zoom drill-down phase 1 spec and plan"
```

### Task 2: Add the new regions workspace and shared detail contracts

**Files:**

- Modify: `package.json`
- Create: `regions/package.json`
- Create: `regions/tsconfig.json`
- Create: `regions/tsup.config.ts`
- Create: `regions/src/index.ts`
- Create: `regions/src/types.ts`
- Create: `regions/src/coverage.ts`
- Create: `regions/src/providers/createRegionsDetailProvider.ts`
- Modify: `lib/package.json`
- Modify: `lib/src/types.ts`
- Create: `lib/src/detail/types.ts`
- Create: `lib/src/detail/createMissingDetailProviderWarning.ts`
- Test: `lib/src/__tests__/components.test.tsx`

- [x] **Step 1: Register the new workspace**

Update the root `package.json` workspaces to include the new package:

```json
{
  "workspaces": ["lib", "regions", "website"]
}
```

- [x] **Step 2: Scaffold the regions package**

Create `regions/package.json` with an intentionally minimal public surface:

```json
{
  "name": "@react-svg-worldmap/regions",
  "version": "0.0.0",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/index.js",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/index.d.cts"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest run src/__tests__/coverage.test.ts"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^4.7.4",
    "vitest": "^1.6.0"
  }
}
```

- [x] **Step 3: Define the shared detail-level and provider contracts in the core package**

Create `lib/src/detail/types.ts` with concrete phase 1 types:

```ts
import type { ISOCode } from "../types.js";

export type DetailLevel = "countries" | "regions";
export type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

export interface RegionLabelSet {
  englishName: string;
  localizedName?: string;
}

export interface RegionFeatureRecord {
  id: string;
  countryCode: ISOCode;
  labels: RegionLabelSet;
  path: string;
  centroid?: [number, number];
  bounds?: [[number, number], [number, number]];
  order?: number;
}

export interface RegionCollectionRecord {
  countryCode: ISOCode;
  englishCountryName: string;
  regions: RegionFeatureRecord[];
}

export interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  detailLevel: DetailLevel;
  collection?: RegionCollectionRecord;
  warning?: string;
}

export interface DetailProvider {
  supports(countryCode: ISOCode): boolean;
  loadRegions(countryCode: ISOCode): Promise<DetailProviderResult>;
}
```

- [x] **Step 4: Extend the public `Props` contract with `detailLevel` and provider hooks**

Update `lib/src/types.ts` so `Props` grows in a forward-compatible way:

```ts
import type { DetailLevel, DetailProvider } from "./detail/types.js";

export interface RegionNameTranslations {
  [countryCode: string]: Record<string, string>;
}

export interface Props<T extends string | number = number> {
  // existing props...
  detailLevel?: DetailLevel;
  detailProvider?: DetailProvider;
  regionNameTranslations?: RegionNameTranslations;
}
```

- [x] **Step 5: Add fallback warning helper**

Create `lib/src/detail/createMissingDetailProviderWarning.ts`:

```ts
import type { DetailLevel } from "./types.js";

export function createMissingDetailProviderWarning(
  detailLevel: DetailLevel,
): string | null {
  if (detailLevel !== "regions") return null;
  return '[react-svg-worldmap] detailLevel="regions" requested without a regions detail provider. Falling back to detailLevel="countries".';
}
```

- [x] **Step 6: Add a contract-level test for the new prop defaults**

Add a test case to `lib/src/__tests__/components.test.tsx` that asserts:

```ts
it("defaults detailLevel to countries when omitted", () => {
  render(<WorldMap data={[]} />);
  expect(screen.getByRole("img")).toHaveAttribute("aria-label", "World map");
});
```

and a second case:

```ts
it("does not throw when detailLevel=regions is provided without a provider", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(<WorldMap data={[]} detailLevel="regions" />);
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('Falling back to detailLevel="countries"'),
  );
  warn.mockRestore();
});
```

- [x] **Step 7: Run the focused core tests**

Run: `yarn workspace react-svg-worldmap test --runInBand` Expected: the updated prop-contract tests pass and no new type errors appear

- [x] **Step 8: Commit**

```bash
git add package.json regions lib/package.json lib/src/types.ts lib/src/detail lib/src/__tests__/components.test.tsx
git commit -m "feat: add regions workspace and detail provider contracts"
```

### Task 3: Build the phase 1 regions package with normalized region data and package-backed provider

**Files:**

- Create: `regions/src/data/regions.json`
- Create: `regions/src/data/regions.ts`
- Create: `regions/src/normalizeRegionCollection.ts`
- Create: `regions/src/__tests__/coverage.test.ts`
- Modify: `regions/src/index.ts`
- Modify: `regions/src/coverage.ts`
- Modify: `regions/src/providers/createRegionsDetailProvider.ts`
- Test: `regions/src/__tests__/coverage.test.ts`

- [x] **Step 1: Add a starter normalized data source**

Create `regions/src/data/regions.ts` around a normalized export shape:

```ts
import type { RegionCollectionRecord } from "../types.js";

export const regionCollections: Record<string, RegionCollectionRecord> = {
  US: {
    countryCode: "US",
    englishCountryName: "United States",
    regions: [],
  },
};
```

Use a real generated dataset for the actual implementation, but keep the runtime API shape exactly like this. Keep the phase 1 dataset limited to region boundaries and English names only; capitals and largest-city metadata remain phase 2.

- [x] **Step 2: Implement the provider helper**

Create `regions/src/providers/createRegionsDetailProvider.ts`:

```ts
import { regionCollections } from "../data/regions.js";
import type { DetailProvider, DetailProviderResult } from "../types.js";

export function createRegionsDetailProvider(): DetailProvider {
  return {
    supports(countryCode) {
      return countryCode.toUpperCase() in regionCollections;
    },
    async loadRegions(countryCode): Promise<DetailProviderResult> {
      const key = countryCode.toUpperCase();
      const collection = regionCollections[key];
      if (!collection) {
        return {
          status: "unavailable",
          layer: "regions",
          detailLevel: "regions",
        };
      }
      return {
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection,
      };
    },
  };
}
```

Create `regions/src/types.ts` with a structurally compatible contract that does not import from `lib` internals:

```ts
export type DetailLevel = "countries" | "regions";
export type DetailLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "failed";

export interface RegionFeatureRecord {
  id: string;
  countryCode: string;
  labels: {
    englishName: string;
    localizedName?: string;
  };
  path: string;
  centroid?: [number, number];
  bounds?: [[number, number], [number, number]];
  order?: number;
}

export interface RegionCollectionRecord {
  countryCode: string;
  englishCountryName: string;
  regions: RegionFeatureRecord[];
}

export interface DetailProviderResult {
  status: DetailLayerStatus;
  layer: "regions";
  detailLevel: DetailLevel;
  collection?: RegionCollectionRecord;
  warning?: string;
}

export interface DetailProvider {
  supports(countryCode: string): boolean;
  loadRegions(countryCode: string): Promise<DetailProviderResult>;
}
```

- [x] **Step 3: Export coverage helpers**

Implement `regions/src/coverage.ts` with:

```ts
import { regionCollections } from "./data/regions.js";

export const supportedRegionCountryCodes = Object.freeze(
  Object.keys(regionCollections).sort(),
);
```

- [x] **Step 4: Add package tests for coverage and provider behavior**

Create `regions/src/__tests__/coverage.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { supportedRegionCountryCodes } from "../coverage.js";
import { createRegionsDetailProvider } from "../providers/createRegionsDetailProvider.js";

describe("regions package coverage", () => {
  it("exports sorted supported country codes", () => {
    expect(supportedRegionCountryCodes).toEqual(
      [...supportedRegionCountryCodes].sort(),
    );
  });

  it("returns unavailable when a country has no region dataset", async () => {
    const provider = createRegionsDetailProvider();
    await expect(provider.loadRegions("ZZ" as never)).resolves.toMatchObject({
      status: "unavailable",
      layer: "regions",
    });
  });
});
```

- [x] **Step 5: Run the regions package build and tests**

Run: `yarn workspace @react-svg-worldmap/regions build` Expected: `dist/index.js`, `dist/index.cjs`, and type declarations are created

Run: `yarn workspace @react-svg-worldmap/regions test` Expected: both coverage/provider tests pass

- [x] **Step 6: Commit**

```bash
git add regions
git commit -m "feat: add package-backed regions detail provider"
```

### Task 4: Add the core drill-down state machine and data-loading flow

**Files:**

- Create: `lib/src/detail/useDetailCollection.ts`
- Create: `lib/src/detail/useDrilldownState.ts`
- Create: `lib/src/detail/getEffectiveDetailLevel.ts`
- Modify: `lib/src/index.tsx`
- Modify: `lib/src/__tests__/WorldMap.test.tsx`
- Test: `lib/src/__tests__/WorldMap.test.tsx`

- [x] **Step 1: Add the detail-level fallback helper**

Create `lib/src/detail/getEffectiveDetailLevel.ts`:

```ts
import type { DetailLevel, DetailProvider } from "./types.js";
import { createMissingDetailProviderWarning } from "./createMissingDetailProviderWarning.js";

export function getEffectiveDetailLevel(
  requestedDetailLevel: DetailLevel | undefined,
  detailProvider: DetailProvider | undefined,
): DetailLevel {
  if ((requestedDetailLevel ?? "countries") !== "regions") return "countries";
  if (detailProvider) return "regions";
  const warning = createMissingDetailProviderWarning("regions");
  if (warning) console.warn(warning);
  return "countries";
}
```

- [x] **Step 2: Add an async hook for loading region detail**

Create `lib/src/detail/useDetailCollection.ts`:

```ts
import * as React from "react";
import type { ISOCode } from "../types.js";
import type { DetailProvider, DetailProviderResult } from "./types.js";

const IDLE_RESULT: DetailProviderResult = {
  status: "idle",
  layer: "regions",
  detailLevel: "countries",
};

export function useDetailCollection(
  activeCountryCode: ISOCode | null,
  provider: DetailProvider | undefined,
  enabled: boolean,
) {
  const [result, setResult] = React.useState<DetailProviderResult>(IDLE_RESULT);

  React.useEffect(() => {
    if (!enabled || !activeCountryCode || !provider) {
      setResult(IDLE_RESULT);
      return;
    }
    let cancelled = false;
    setResult({ status: "loading", layer: "regions", detailLevel: "regions" });
    provider.loadRegions(activeCountryCode).then((next) => {
      if (!cancelled) setResult(next);
    });
    return () => {
      cancelled = true;
    };
  }, [activeCountryCode, enabled, provider]);

  return result;
}
```

- [x] **Step 3: Add the drill-down state hook**

Create `lib/src/detail/useDrilldownState.ts` with explicit world-to-country behavior:

```ts
import * as React from "react";
import type { ISOCode } from "../types.js";

export function useDrilldownState() {
  const [activeCountryCode, setActiveCountryCode] =
    React.useState<ISOCode | null>(null);

  return {
    activeCountryCode,
    enterCountry(countryCode: ISOCode) {
      setActiveCountryCode(countryCode);
    },
    reset() {
      setActiveCountryCode(null);
    },
    canGoBack: activeCountryCode != null,
  };
}
```

- [x] **Step 4: Integrate `detailLevel` into `lib/src/index.tsx` without changing default output**

Update the component signature to read:

```ts
const {
  // existing props...
  detailLevel = "countries",
  detailProvider,
  regionNameTranslations,
} = props;
```

and derive:

```ts
const effectiveDetailLevel = getEffectiveDetailLevel(
  detailLevel,
  detailProvider,
);
const drilldown = useDrilldownState();
const detailResult = useDetailCollection(
  drilldown.activeCountryCode,
  detailProvider,
  effectiveDetailLevel === "regions",
);
```

Do not replace the current country rendering yet. In this task, only wire the state, fallback, and async loading model.

- [x] **Step 5: Add tests for fallback and async loading**

Add to `lib/src/__tests__/WorldMap.test.tsx`:

```ts
it("warns and falls back to countries when detailLevel=regions has no provider", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(<WorldMap data={DATA} detailLevel="regions" />);
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

it("requests region details after selecting a country in regions mode", async () => {
  const loadRegions = vi.fn().mockResolvedValue({
    status: "ready",
    layer: "regions",
    detailLevel: "regions",
    collection: {
      countryCode: "US",
      englishCountryName: "United States",
      regions: [],
    },
  });
  const provider = { supports: () => true, loadRegions };
  render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );
  await userEvent.click(screen.getByLabelText("United States"));
  expect(loadRegions).toHaveBeenCalledWith("US");
});
```

- [x] **Step 6: Run targeted tests**

Run: `yarn workspace react-svg-worldmap test` Expected: the new detail-level and async-loading tests pass alongside the existing world-map tests

- [x] **Step 7: Commit**

```bash
git add lib/src/index.tsx lib/src/detail lib/src/__tests__/WorldMap.test.tsx
git commit -m "feat: add drill-down state and detail loading flow"
```

### Task 5: Add accessible zoom controls, live announcements, and visible-region list

**Files:**

- Create: `lib/src/components/ZoomControls.tsx`
- Create: `lib/src/components/VisibleRegionList.tsx`
- Create: `lib/src/components/LiveAnnouncer.tsx`
- Modify: `lib/src/index.tsx`
- Modify: `lib/src/components/Region.tsx`
- Modify: `lib/src/__tests__/WorldMap.test.tsx`
- Modify: `lib/src/__tests__/Region.test.tsx`

- [ ] **Step 1: Add accessible zoom controls**

Create `lib/src/components/ZoomControls.tsx`:

```tsx
import * as React from "react";

interface ZoomControlsProps {
  canDrillIn: boolean;
  canGoBack: boolean;
  onZoomIn(): void;
  onZoomOut(): void;
  onBack(): void;
  onReset(): void;
}

export default function ZoomControls(props: ZoomControlsProps) {
  return (
    <div aria-label="Map zoom controls">
      <button
        type="button"
        onClick={props.onZoomIn}
        disabled={!props.canDrillIn}>
        Zoom in
      </button>
      <button type="button" onClick={props.onZoomOut}>
        Zoom out
      </button>
      <button type="button" onClick={props.onBack} disabled={!props.canGoBack}>
        Back
      </button>
      <button type="button" onClick={props.onReset}>
        Reset
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add the visible-region list**

Create `lib/src/components/VisibleRegionList.tsx`:

```tsx
import * as React from "react";
import type { RegionFeatureRecord } from "../detail/types.js";

interface VisibleRegionListProps {
  regions: RegionFeatureRecord[];
  onSelect(regionId: string): void;
}

export default function VisibleRegionList({
  regions,
  onSelect,
}: VisibleRegionListProps) {
  if (regions.length === 0) return null;
  return (
    <section aria-label="Visible regions">
      <ul>
        {regions.map((region) => (
          <li key={region.id}>
            <button type="button" onClick={() => onSelect(region.id)}>
              {region.labels.localizedName ?? region.labels.englishName}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Add live announcements**

Create `lib/src/components/LiveAnnouncer.tsx`:

```tsx
import * as React from "react";

export default function LiveAnnouncer({ message }: { message: string }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clipPath: "inset(50%)",
      }}>
      {message}
    </div>
  );
}
```

- [ ] **Step 4: Integrate controls and announcements into `WorldMap`**

Update `lib/src/index.tsx` so that:

```tsx
<ZoomControls
  canDrillIn={effectiveDetailLevel === "regions"}
  canGoBack={drilldown.canGoBack}
  onZoomIn={() => drilldown.enterCountry("US")}
  onZoomOut={() => drilldown.reset()}
  onBack={() => drilldown.reset()}
  onReset={() => drilldown.reset()}
/>
<LiveAnnouncer
  message={
    drilldown.activeCountryCode == null
      ? "Showing world map"
      : `Zoomed into ${drilldown.activeCountryCode}`
  }
/>
```

Replace the temporary `"US"` stub during implementation with the selected country context from the current region interaction.

- [ ] **Step 5: Keep region paths keyboard-operable when they act as drill-down triggers**

Modify `lib/src/components/Region.tsx` so the existing button-like behavior is reused for drill-down mode and stays compatible with:

```ts
const isInteractive = Boolean(
  onClickFunction ?? resolvedHref ?? canEnterRegionMode,
);
```

Do not create a second keyboard interaction path for countries; reuse the existing `role="button"` + `Enter`/`Space` activation behavior.

- [ ] **Step 6: Add tests for controls and live-region behavior**

Add to `lib/src/__tests__/WorldMap.test.tsx`:

```ts
it("renders zoom controls in regions mode", () => {
  render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
});

it("announces drill-down state changes", async () => {
  render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );
  await userEvent.click(screen.getByLabelText("United States"));
  expect(screen.getByText(/Zoomed into/)).toBeInTheDocument();
});
```

- [ ] **Step 7: Run accessibility-facing tests**

Run: `yarn workspace react-svg-worldmap test` Expected: the control, keyboard, and announcer tests pass without regressing current accessibility coverage

- [ ] **Step 8: Commit**

```bash
git add lib/src/components lib/src/index.tsx lib/src/__tests__/WorldMap.test.tsx lib/src/__tests__/Region.test.tsx
git commit -m "feat: add accessible drill-down controls"
```

### Task 6: Add region rendering and synchronized region-list behavior

**Files:**

- Create: `lib/src/detail/projectRegionFeatures.ts`
- Create: `lib/src/detail/getCountryViewport.ts`
- Modify: `lib/src/index.tsx`
- Modify: `lib/src/__tests__/WorldMap.test.tsx`
- Modify: `lib/src/__tests__/utils.test.ts`

- [ ] **Step 1: Add a viewport helper for country drill-down**

Create `lib/src/detail/getCountryViewport.ts`:

```ts
export interface CountryViewport {
  scale: number;
  translateX: number;
  translateY: number;
}

export function getCountryViewport(
  bounds: [[number, number], [number, number]],
): CountryViewport {
  const [[minX, minY], [maxX, maxY]] = bounds;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  return {
    scale: Math.min(6, Math.max(2, 480 / Math.max(width, height))),
    translateX: -minX,
    translateY: -minY,
  };
}
```

- [ ] **Step 2: Add a projection helper for region features**

Create `lib/src/detail/projectRegionFeatures.ts`:

```ts
import type { RegionCollectionRecord } from "./types.js";

export function projectRegionFeatures(collection: RegionCollectionRecord) {
  return collection.regions.map((region) => ({
    id: region.id,
    label: region.labels.localizedName ?? region.labels.englishName,
    path: region.path,
  }));
}
```

- [ ] **Step 3: Render region paths only after drill-down succeeds**

Update `lib/src/index.tsx` so the render path follows:

```tsx
const regionDetail =
  detailResult.status === "ready" ? detailResult.collection : undefined;
const renderedRegions = regionDetail ? projectRegionFeatures(regionDetail) : [];
```

and render those region paths inside the zoomed group only when:

```ts
effectiveDetailLevel === "regions" &&
  drilldown.activeCountryCode != null &&
  detailResult.status === "ready";
```

- [ ] **Step 4: Synchronize the visible-region list with the rendered region set**

Use the same `regionDetail?.regions` array as the single source of truth for both SVG region rendering and `VisibleRegionList`.

Do not derive one list from screen state and the other from raw provider data. Both should read from the same normalized collection to avoid naming or order drift.

- [ ] **Step 5: Add tests for drill-down rendering**

Add to `lib/src/__tests__/WorldMap.test.tsx`:

```ts
it("renders a visible-region list after ready region detail loads", async () => {
  render(
    <WorldMap
      data={DATA}
      detailLevel="regions"
      detailProvider={providerWithRegions}
    />,
  );
  await userEvent.click(screen.getByLabelText("United States"));
  expect(
    await screen.findByRole("region", { name: "Visible regions" }),
  ).toBeInTheDocument();
});
```

and add a fallback case:

```ts
it("keeps the world map visible when region detail is unavailable", async () => {
  render(
    <WorldMap
      data={DATA}
      detailLevel="regions"
      detailProvider={providerUnavailable}
    />,
  );
  await userEvent.click(screen.getByLabelText("China"));
  expect(screen.getByRole("img")).toHaveAttribute(
    "aria-label",
    expect.stringContaining("World map"),
  );
});
```

- [ ] **Step 6: Run regression tests**

Run: `yarn workspace react-svg-worldmap test` Expected: existing country rendering tests still pass and the new synchronized region rendering tests pass

- [ ] **Step 7: Commit**

```bash
git add lib/src/detail lib/src/index.tsx lib/src/__tests__/WorldMap.test.tsx lib/src/__tests__/utils.test.ts
git commit -m "feat: render region detail after drill-down"
```

### Task 7: Add collision-aware default labels with translation fallback

**Files:**

- Create: `lib/src/labels/types.ts`
- Create: `lib/src/labels/measureLabel.ts`
- Create: `lib/src/labels/placeLabels.ts`
- Create: `lib/src/labels/getDefaultLabels.ts`
- Modify: `lib/src/index.tsx`
- Modify: `lib/src/components/TextLabel.tsx`
- Modify: `lib/src/__tests__/WorldMap.test.tsx`
- Create: `lib/src/__tests__/labels.test.ts`

- [ ] **Step 1: Define label priorities and candidate records**

Create `lib/src/labels/types.ts`:

```ts
export type LabelLayer = "country" | "region";

export interface LabelCandidate {
  id: string;
  text: string;
  x: number;
  y: number;
  priority: number;
  layer: LabelLayer;
  minScale: number;
}

export interface PlacedLabel extends LabelCandidate {
  width: number;
  height: number;
}
```

- [ ] **Step 2: Add deterministic text measurement and greedy collision placement**

Create `lib/src/labels/measureLabel.ts`:

```ts
export function measureLabel(text: string) {
  const width = Math.max(24, text.length * 7);
  return { width, height: 14 };
}
```

Create `lib/src/labels/placeLabels.ts`:

```ts
import type { LabelCandidate, PlacedLabel } from "./types.js";
import { measureLabel } from "./measureLabel.js";

export function placeLabels(
  candidates: LabelCandidate[],
  currentScale: number,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const sorted = [...candidates]
    .filter((candidate) => currentScale >= candidate.minScale)
    .sort((a, b) => b.priority - a.priority);

  for (const candidate of sorted) {
    const size = measureLabel(candidate.text);
    const next: PlacedLabel = { ...candidate, ...size };
    const collides = placed.some(
      (label) =>
        Math.abs(label.x - next.x) < (label.width + next.width) / 2 &&
        Math.abs(label.y - next.y) < (label.height + next.height) / 2,
    );
    if (!collides) placed.push(next);
  }

  return placed;
}
```

- [ ] **Step 3: Build phase 1 default-label generation with translation fallback**

Create `lib/src/labels/getDefaultLabels.ts`:

```ts
import type { LabelCandidate } from "./types.js";

export function getDefaultLabels(args: {
  countryCandidates: LabelCandidate[];
  regionCandidates: LabelCandidate[];
  regionTranslations?: Record<string, string>;
  hasCompleteRegionTranslations: boolean;
}) {
  const translatedRegions = args.regionCandidates.map((candidate) => ({
    ...candidate,
    text:
      args.hasCompleteRegionTranslations &&
      args.regionTranslations?.[candidate.id]
        ? args.regionTranslations[candidate.id]
        : candidate.text,
  }));

  return [...args.countryCandidates, ...translatedRegions];
}
```

- [ ] **Step 4: Integrate automatic labels ahead of `textLabelFunction` overrides**

Update `lib/src/index.tsx` so the component computes automatic labels when the consumer has not provided `textLabelFunction`, and keep the current custom label escape hatch:

```ts
const automaticLabels = placeLabels(defaultCandidates, scale);
const renderedLabels =
  textLabelFunction === defaultTextLabelFunction
    ? automaticLabels
    : textLabelFunction(width);
```

Country labels should appear at world level. Region labels should only be added to `defaultCandidates` after a successful drill-down into one country.

- [ ] **Step 5: Add tests for label placement and translation fallback**

Create `lib/src/__tests__/labels.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { placeLabels } from "../labels/placeLabels.js";

describe("placeLabels", () => {
  it("keeps the higher-priority label when two labels collide", () => {
    const placed = placeLabels(
      [
        {
          id: "country",
          text: "United States",
          x: 100,
          y: 100,
          priority: 10,
          layer: "country",
          minScale: 1,
        },
        {
          id: "region",
          text: "California",
          x: 102,
          y: 102,
          priority: 5,
          layer: "region",
          minScale: 1,
        },
      ],
      2,
    );
    expect(placed.map((label) => label.id)).toEqual(["country"]);
  });
});
```

Add to `lib/src/__tests__/WorldMap.test.tsx`:

```ts
it("falls back to English region labels when translations are partial", async () => {
  render(
    <WorldMap
      data={DATA}
      detailLevel="regions"
      detailProvider={providerWithRegions}
      regionNameTranslations={{ US: { CA: "California", NY: "New York" } }}
    />,
  );
  await userEvent.click(screen.getByLabelText("United States"));
  expect(await screen.findByText("California")).toBeInTheDocument();
});
```

- [ ] **Step 6: Run the label-focused tests**

Run: `yarn workspace react-svg-worldmap test` Expected: label placement tests pass and current `textLabelFunction` behavior remains intact

- [ ] **Step 7: Commit**

```bash
git add lib/src/labels lib/src/index.tsx lib/src/components/TextLabel.tsx lib/src/__tests__/labels.test.ts lib/src/__tests__/WorldMap.test.tsx
git commit -m "feat: add collision-aware default map labels"
```

### Task 8: Polish the UX, docs, examples, and verification surface

**Files:**

- Modify: `README.md`
- Modify: `lib/README.md`
- Modify: `docs/api.md`
- Modify: `docs/examples.md`
- Modify: `website/package.json`
- Create: `website/src/components/RegionsDrilldown.tsx`
- Create: `website/src/pages/examples/regions-drilldown.tsx`
- Modify: `website/src/pages/examples/styles.module.css`
- Modify: `website/src/react-svg-worldmap.d.ts`
- Modify: `project-words.txt`
- Test: `lib/src/__tests__/WorldMap.test.tsx`

- [ ] **Step 1: Document the new public API**

Update `docs/api.md` and `lib/README.md` to include:

```md
### `detailLevel`

- `"countries"`: default, current world-map behavior
- `"regions"`: enables drill-down when a regions provider is supplied

If `detailLevel="regions"` is used without an available provider, the component falls back to `"countries"` and logs a warning.
```

- [ ] **Step 2: Add a regions drill-down example to the website**

First update `website/package.json` so the website workspace can import the new package:

```json
{
  "dependencies": {
    "@react-svg-worldmap/regions": "0.0.0"
  }
}
```

Create `website/src/components/RegionsDrilldown.tsx` with:

```tsx
import * as React from "react";
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const provider = createRegionsDetailProvider();

export default function RegionsDrilldown() {
  return (
    <WorldMap
      data={[
        { country: "us", value: 100 },
        { country: "ca", value: 80 },
      ]}
      title="Regions drill-down"
      detailLevel="regions"
      detailProvider={provider}
    />
  );
}
```

- [ ] **Step 3: Add documentation for label behavior**

Add a note to `docs/examples.md`:

```md
Default labels are collision-aware and priority-based:

- country labels at world level
- region labels only after drill-down
- English fallback when provided translations are incomplete for the active region layer
```

- [ ] **Step 4: Run the full verification set**

Run: `yarn test` Expected: all library tests pass

Run: `yarn build:package` Expected: the core library builds successfully with the new `detailLevel` API

Run: `yarn workspace @react-svg-worldmap/regions build` Expected: the regions package builds successfully

Run: `yarn typecheck` Expected: website typecheck passes with the new example and declaration updates

- [ ] **Step 5: Review the final diff**

Run: `git diff --stat` Expected: the diff includes only the phase 1 drill-down architecture, regions package, labels, tests, docs, and example files described in this plan

- [ ] **Step 6: Commit**

```bash
git add README.md lib/README.md docs/api.md docs/examples.md website/src/components/RegionsDrilldown.tsx website/src/pages/examples/regions-drilldown.tsx website/src/pages/examples/styles.module.css website/src/react-svg-worldmap.d.ts project-words.txt
git commit -m "feat: document and demo regions drill-down phase 1"
```

### Task 9: Final phase 1 verification and release-readiness review

**Files:**

- Test: `lib/src/__tests__/WorldMap.test.tsx`
- Test: `lib/src/__tests__/labels.test.ts`
- Test: `regions/src/__tests__/coverage.test.ts`
- Test: `docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md`
- Test: `docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md`

- [ ] **Step 1: Re-run the final command set**

Run: `yarn test` Expected: all library tests pass

Run: `yarn build:package` Expected: success

Run: `yarn workspace @react-svg-worldmap/regions build` Expected: success

- [ ] **Step 2: Inspect package-size direction**

Run: `du -sh lib/dist regions/dist` Expected: both directories exist; `regions/dist` is materially larger than `lib/dist`, confirming the data split is working as intended

- [ ] **Step 3: Confirm spec-to-plan coverage**

Run: `rg -n "detailLevel|fallback|labels|regions package|visible-region list|console warning" docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md` Expected: every approved phase 1 requirement appears in both the spec and the plan

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-05-zoom-drilldown-design.md docs/superpowers/plans/2026-04-12-zoom-drilldown-phase-1.md
git commit -m "chore: finalize zoom drill-down phase 1 plan coverage"
```
