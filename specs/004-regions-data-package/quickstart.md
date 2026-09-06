# Quickstart: Optional Regions Data Package

## Developer Setup

```bash
yarn install
```

## Focused Rendering Validation

Run core tests that should cover the current rendering failure:

```bash
yarn workspace react-svg-worldmap test WorldMap.test.tsx country-hit-targets.test.tsx geometry-tiers.test.ts zoom-drag.test.tsx zoom-interaction.test.tsx zoom-controls.test.tsx
```

Expected coverage:

- SVG layer order is ocean/background, countries, regions, labels, pins, interaction targets.
- Country paths render above the ocean/background and preserve closed land fills.
- Region overlays render above country geometry as dotted lines.
- Labels and pins render above geometry.
- Interaction targets use the visible country identity.
- Russia, United States, Mexico, Nigeria, and Brazil do not regress in visible rendering or hover identity.

## Optional Regions Validation

```bash
yarn workspace @react-svg-worldmap/regions test
```

Expected coverage:

- All 23 target countries are complete.
- No target country is experimental or partial.
- Region paths are non-empty and renderable.
- MIT license metadata and package license file are present.
- Website examples no longer use placeholder region data.

## Website Example Validation

```bash
yarn workspace website typecheck
yarn build:website
```

Manual smoke path:

1. Open the zoom-with-regions example.
2. Confirm the map uses the XL canvas.
3. Toggle regions, capital cities, and AWS locations independently.
4. Confirm no below-map region list appears.
5. Confirm AWS pins appear globally and fallback labels include `(location not published)` where appropriate.

## Full Validation

```bash
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

## Documentation Checks

Update and verify:

- `README.md`
- `lib/README.md` via `yarn generate:readme`
- `regions/README.md`
- `docs/api.md`
- `docs/customization.md`
- `docs/examples.md`
- `docs/map-data-policy.md`
- `docs/RELEASING.md`
- `CHANGELOG.md`

Map documentation must state that the output is a lightweight SVG thematic map, not an authoritative legal, diplomatic, cadastral, navigational, or Google Maps-equivalent basemap.
