# Quickstart: Optional Regions Data Package

## Goal

Deliver real optional first-level region data through `@react-svg-worldmap/regions`, keep the core country map unchanged by default, and update the zoom and sizing examples to consume the optional package instead of placeholder shapes.

## Implementation Flow

1. Review current region provider behavior.

   ```sh
   yarn workspace react-svg-worldmap test detail-provider.test.tsx
   yarn workspace @react-svg-worldmap/regions test
   ```

2. Replace placeholder starter data with target-country data.

   - Add reviewable generated region collections for all target countries.
   - Target countries are United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia.
   - Keep the coverage catalog and record shape international so target and future countries with states, provinces, territories, cantons, departments, emirates, or equivalent first-level regions can use the same path.
   - Record coverage status, expected counts, source summaries, source URLs or references where appropriate, and review notes.
   - Ensure generated paths are in the core map coordinate system.

3. Validate region records.

   - Every region has `id`, `countryCode`, `name`, and a non-empty renderable `path`.
   - Complete coverage countries match expected region counts.
   - Partial, experimental, unavailable, and single-region target countries have explicit review notes.
   - Coverage metadata is exported and filterable.
   - Single-region countries remain representable without fake internal boundaries.

4. Update core rendering only where the generic region layer requires it.

   - Render internal region borders as dotted lines by default.
   - Keep country borders and fills visible.
   - Reuse country-label placement expectations for region labels.
   - Hide region labels when zoom or available area makes them unreadable.
   - Preserve country tooltips, clicks, pins, values, dispute metadata, zoom controls, and accessibility states.

5. Update examples.

   - Replace inline region placeholder data in `website/src/components/ZoomExample.tsx` with `createRegionsDetailProvider` from the optional package.
   - Update sizing examples so at least one large-size example demonstrates the optional regions package.
   - Remove the visible below-map region list from sizing examples; sizing samples should not print headings such as "United States regions", coverage lines, or all region names below the map.
   - Keep region detail controls and capital city overlay controls usable together.

6. Update docs and release notes.

   - Update `README.md` package-facing docs and regenerate `lib/README.md`.
   - Update `regions/README.md`.
   - Update `docs/api.md`, `docs/examples.md`, `docs/customization.md`, and map-data policy docs.
   - Update changelog/release notes and package-size measurements.

## Expected Consumer Usage

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const detailProvider = createRegionsDetailProvider();

<WorldMap
  title="Zoom with regions"
  data={[{ country: "US", value: 1 }]}
  size="xl"
  zoom
  detailLevel="regions"
  detailProvider={detailProvider}
/>;
```

Country-only consumers keep using the core package without importing `@react-svg-worldmap/regions`. Package dry-runs should show that the core package tarball does not include the target-country region data; those files belong only to `@react-svg-worldmap/regions`.

## Validation Commands

Run focused checks while implementing:

```sh
yarn workspace @react-svg-worldmap/regions test
yarn workspace react-svg-worldmap test detail-provider.test.tsx
yarn workspace react-svg-worldmap test visible-region-list.test.tsx
yarn workspace react-svg-worldmap test zoom-labels.test.tsx
yarn workspace website typecheck
```

Run full release-oriented validation before completion:

```sh
yarn generate:readme
yarn workspace react-svg-worldmap test
yarn workspace @react-svg-worldmap/regions test
yarn typecheck
yarn lint
yarn format-check
yarn spellcheck
yarn test:coverage
yarn build
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions
```

## Manual Review Checklist

- All 23 target countries have coverage records, source summaries, and review notes.
- Countries marked `complete` include all expected first-level regions for that country.
- Region boundaries are dotted and visibly subordinate to country borders.
- Region labels do not appear at unreadable zoom levels.
- Zoom-with-regions example uses the optional package.
- Sizing example demonstrates optional regions data without crowding the map and without rendering the visible below-map region list.
- Region coverage model remains international and does not rely on United States-only assumptions.
- Core package dry-run size is not increased by optional region data.
- Optional package dry-run includes only intended package files.
- Documentation states that region data is thematic and non-authoritative.

## Target Countries

| Group | Countries |
| --- | --- |
| Americas | United States, Canada, Mexico, Brazil, Argentina, Venezuela |
| Europe | Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia |
| Asia | India, Pakistan, United Arab Emirates, Malaysia, Iraq |
| Africa | Nigeria, Ethiopia, South Africa, Sudan |
| Oceania | Australia, Micronesia |
