# Quickstart: Zoom Drill-Down

## Goal

Verify that existing country maps still work by default and that consumers can opt into Phase 1 country-level zooming without region data. Phase 2 later verifies accessible country-to-region drill-down with an optional detail provider.

## Implementation Checklist

1. Preserve default country-level rendering when `detailLevel` is omitted.
2. Add Phase 1 public zoom options to the core package.
3. Add zoom state management for continuous zoom, drag panning, and reset.
4. Add explicit accessible controls for zoom in, zoom out, and reset.
5. Add live announcements for zoom and reset changes.
6. Keep country border strokes at a constant screen-space thickness during repeated zoom in/out actions.
7. Add country labels by default when zooming is enabled.
8. Add automatic clamped zoom-aware country label sizing with `ZoomOptions` overrides.
9. Add fit-aware and collision-aware country label placement.
10. Add non-contiguous country handling for label placement.
11. Add a public consumer-supplied pin API for longitude/latitude coordinates and captions.
12. Show pin markers and captions only when the zoomed area can fit them.
13. Add a featured website and documentation example for Phase 1 zooming as the first examples entry before the sizing demo.
14. Phase 2: add public detail-level and provider types to the core package.
15. Phase 2: add provider fallback behavior for `detailLevel="regions"` without a provider.
16. Phase 2: add visible-region list synchronized with displayed region detail.
17. Phase 2: add optional `@react-svg-worldmap/regions` workspace/package with starter normalized region data and provider helper.
18. Update README, generated `lib/README.md`, docs examples, package exports, and release notes or changeset.

## Example Consumer Flow

```tsx
import WorldMap from "react-svg-worldmap";

<WorldMap data={[{ country: "us", value: 1 }]} zoom />;
```

Sample capital pins may be used in the website/docs zoom example, but that sample data must live outside the core package and be passed through the same consumer pin API.

## Phase 2 Region Consumer Flow

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const provider = createRegionsDetailProvider();

<WorldMap
  data={[{ country: "us", value: 1 }]}
  zoom
  detailLevel="regions"
  detailProvider={provider}
/>;
```

## Verification Commands

Run from the repository root after implementation:

```bash
yarn lint
yarn format-check
yarn typecheck
yarn spellcheck
yarn test:coverage
yarn build
yarn generate:readme
npm pack --dry-run ./lib
```

After Phase 2 implementation, also run:

```bash
yarn workspace @react-svg-worldmap/regions build
```

## Expected Results

- Existing country-level examples work without changes.
- Phase 1 zoom works only when explicitly enabled.
- Keyboard users can zoom in, zoom out, and reset.
- Pointer users can drag-pan the zoomed country-level map.
- Repeated zoom-in actions do not increase country border stroke thickness on screen.
- Repeated zoom-in actions increase country label screen-space size within configured bounds.
- Country labels remain readable in the featured zoom example.
- Consumer-supplied pin markers and captions appear only when there is enough zoomed area.
- Base package does not require the optional regions package.
- Phase 2 region drill-down works only when explicitly enabled.
- Phase 2 missing provider and missing coverage states fall back safely.
- Phase 2 keyboard users can use the visible-region list.
