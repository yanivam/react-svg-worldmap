# Quickstart: Smooth Zoom Performance

## Goal

Validate that zoom-control interactions feel smooth in representative map states without changing the public SVG map experience.

## Baseline

1. Start from branch `005-smooth-zoom-performance`.
2. Run the focused zoom behavior tests:

   ```bash
   yarn workspace react-svg-worldmap test zoom-controls.test.tsx zoom-interaction.test.tsx zoom-state.test.ts geometry-tiers.test.ts
   ```

3. Record the current observed zoom timing in the representative zoom example if a benchmark helper is available.

## Implementation Checks

1. Add or update a representative zoom performance scenario covering:
   - full-world zoom;
   - detailed zoom with labels or pins;
   - optional region detail availability;
   - rapid repeated zoom clicks.
2. Confirm the report includes:
   - typical click-to-visible-feedback timing;
   - maximum click-to-visible-completion timing;
   - pass/fail status for the 250 ms and 500 ms targets.
3. Keep SVG accessibility and public zoom behavior equivalent while optimizing internal scheduling, caching, and progressive detail.
4. Verify that the immediate map transform updates before deferred detail by checking `data-zoom-scale`, `data-detail-zoom-scale`, and `data-zoom-render-phase` in the focused tests.

## Focused Validation

```bash
yarn workspace react-svg-worldmap test zoom-controls.test.tsx zoom-interaction.test.tsx zoom-state.test.ts geometry-tiers.test.ts zoom-performance.test.tsx
yarn workspace react-svg-worldmap test WorldMap.test.tsx zoom-labels.test.tsx country-hit-targets.test.tsx
yarn workspace website typecheck
```

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
yarn generate:readme
npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib
```

## Escalation Rule

Do not start with a separate canvas/WebGL renderer or tile-like data architecture. Consider those only if measured results show progressive SVG optimization plus immediate perceptual motion cannot meet the 250 ms typical and 500 ms maximum targets.
