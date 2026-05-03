# Quickstart: Regions Package

## Goal

Implement optional region detail on top of the country-level zoom foundation while restoring the core country map to higher-detail generated topology. Default country-only behavior must remain compatible.

## Implementation Flow

1. Verify the active feature:

   ```sh
   .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
   ```

2. Update and validate the country topology generation workflow.

   - Keep the current project source path unless a later clarification changes it.
   - Regenerate `lib/src/countries.topo.ts` with at least 6 decimal places of retained source precision before quality-budgeted optimization.
   - Prefer lossless TopoJSON structural compression first.
   - Apply quality-budgeted simplification or quantization only when validation fixtures prove no material human-visible degradation.
   - Record source input, precision settings, compression steps, optimization settings, validation output, and package-size impact.

3. Add core detail contracts and fallback state.

   - Preserve default country rendering when `detailLevel` and `detailProvider` are omitted.
   - Add provider result states for ready, unavailable, loading, and failed detail.
   - Keep zoom controls, reset, keyboard behavior, and live announcements working in country fallback.

4. Add optional regions package.

   - Create the sibling workspace package.
   - Add coverage metadata and starter region collections.
   - Add a provider helper that satisfies the core detail provider contract.
   - Validate region ids, parent country codes, labels, paths, and coverage metadata.

5. Render ready region detail.

   - Display region boundaries for a focused country when provider data is ready.
   - Display fit-aware region labels.
   - Keep consumer pins geographically anchored.
   - Render a visible region list synchronized with the displayed regions.

6. Update the website example.

   - Rename the example to "Zoom with regions".
   - Use an XL canvas.
   - Add independent controls for capital city overlay and region details.
   - Default region details on and capital city overlay off.

7. Document and validate release surfaces.

   - Document core props, provider setup, optional package install, starter coverage, fallback states, map-data regeneration, and neutrality notes.
   - Update examples and generated README output.
   - Record package and release-note impact.

## Example Consumer Flow

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

Expected behavior:

- Country-only maps still work without importing the optional package.
- The default country map uses regenerated higher-detail country geometry.
- Supported countries can show region detail.
- Unsupported countries keep the country-level view and report unavailable detail.
- Region labels and pins remain readable only when fit rules allow them.

## Focused Validation Commands

Run focused checks during implementation:

```sh
yarn workspace react-svg-worldmap test map-data-generation.test.ts
yarn workspace react-svg-worldmap test detail-provider.test.tsx visible-region-list.test.tsx
yarn workspace @react-svg-worldmap/regions test
yarn workspace react-svg-worldmap build
yarn workspace @react-svg-worldmap/regions build
```

Run release gates before completion:

```sh
yarn lint
yarn format-check
yarn typecheck
yarn spellcheck
yarn test:coverage
yarn build
yarn generate:readme
npm pack --dry-run ./lib
npm pack --dry-run ./regions
```

## Map-Data Regeneration Review

Before release, confirm:

- The generation command and source input are documented.
- `lib/src/countries.topo.ts` is regenerated with at least 6 decimal places of retained source precision before quality-budgeted optimization.
- Country count, ISO codes, and display names match the previous topology unless a policy-reviewed exception is documented.
- Generated topology decodes and renders SVG paths for every country.
- Retained coordinate detail improves compared with the current bundled topology.
- Package-size impact is recorded.
- Country geometry, starter region names, and starter region boundaries are reviewed against `docs/map-data-policy.md`.
- Any sensitive or incomplete coverage is documented in coverage metadata and release notes.
- `docs/map-data-overrides.json` is updated if a case-specific policy decision is needed.
  - Documentation does not imply global, legal, diplomatic, navigational, cadastral, or authoritative map coverage.

## Quality-Budgeted Size Review

Before accepting a smaller optimized topology, confirm:

- Packed core package size is lower than the high-detail baseline.
- Optimized topology still retains at least 6 decimal places of coordinate precision.
- All country records, ISO codes, and display names are preserved.
- All country geometries decode and render SVG paths.
- Fixture checks cover small islands, complex coastlines, borders, and small countries.
- Fixture comparisons show no material human-visible degradation.
- Optimization settings are documented with the validation output.
