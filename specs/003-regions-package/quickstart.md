# Quickstart: Regions Package

## Goal

Implement optional region detail on top of the country-level zoom foundation without changing default country-only behavior.

## Implementation Flow

1. Verify the active feature:

   ```sh
   .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
   ```

2. Add core detail contracts and fallback state.

   - Preserve default country rendering when `detailLevel` and `detailProvider` are omitted.
   - Add provider result states for ready, unavailable, loading, and failed detail.
   - Keep zoom controls, reset, keyboard behavior, and live announcements working in country fallback.

3. Add optional regions package.

   - Create the sibling workspace package.
   - Add coverage metadata and starter region collections.
   - Add a provider helper that satisfies the core detail provider contract.
   - Validate region ids, parent country codes, labels, paths, and coverage metadata.

4. Render ready region detail.

   - Display region boundaries for a focused country when provider data is ready.
   - Display fit-aware region labels.
   - Keep consumer pins geographically anchored.
   - Render a visible region list synchronized with the displayed regions.

5. Document and validate release surfaces.

   - Document core props, provider setup, optional package install, starter coverage, fallback states, and neutrality notes.
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
- Supported countries can show region detail.
- Unsupported countries keep the country-level view and report unavailable detail.
- Region labels and pins remain readable only when fit rules allow them.

## Validation Commands

Run focused checks during implementation:

```sh
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

## Neutrality Review

Before release, confirm:

- Starter region names and boundaries are reviewed against `docs/map-data-policy.md`.
- Any sensitive or incomplete coverage is documented in coverage metadata and release notes.
- `docs/map-data-overrides.json` is updated if a case-specific policy decision is needed.
- Documentation does not imply global or authoritative region coverage.
