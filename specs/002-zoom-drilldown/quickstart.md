# Quickstart: Zoom Drill-Down

## Goal

Verify that existing country maps still work by default and that consumers can opt into Phase 1 country-level zooming without region data. Phase 2 later verifies accessible country-to-region drill-down with an optional detail provider.

## Implementation Checklist

1. Preserve default country-level rendering when `detailLevel` is omitted.
2. Add Phase 1 public zoom options to the core package.
3. Add zoom state management for continuous zoom, drag panning, and reset.
4. Add explicit accessible controls for zoom in, zoom out, and reset.
5. Add live announcements for zoom and reset changes.
6. Add country labels by default when zooming is enabled.
7. Add fit-aware and collision-aware country label placement.
8. Add non-contiguous country handling for label placement.
9. Add country-level capital city name and coordinate metadata.
10. Show capital city markers only when the zoomed country area can fit them.
11. Add a featured website and documentation example for Phase 1 zooming as the first examples entry before the sizing demo.
12. Phase 2: add public detail-level and provider types to the core package.
13. Phase 2: add provider fallback behavior for `detailLevel="regions"` without a provider.
14. Phase 2: add visible-region list synchronized with displayed region detail.
15. Phase 2: add optional `@react-svg-worldmap/regions` workspace/package with starter normalized region data and provider helper.
16. Update README, generated `lib/README.md`, docs examples, package exports, and release notes or changeset.

## Example Consumer Flow

```tsx
import WorldMap from "react-svg-worldmap";

<WorldMap data={[{ country: "us", value: 1 }]} zoom />;
```

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
- Country labels remain readable in the featured zoom example.
- Capital city markers appear only when there is enough zoomed country area.
- Base package does not require the optional regions package.
- Phase 2 region drill-down works only when explicitly enabled.
- Phase 2 missing provider and missing coverage states fall back safely.
- Phase 2 keyboard users can use the visible-region list.
