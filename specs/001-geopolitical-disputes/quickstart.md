# Quickstart: Neutral Geopolitical Disputes

## Goal

Verify that the package exposes the Tier 1 dispute dataset, preserves default map rendering, and lets consumers opt into dispute-aware styling and tooltips.

## Implementation Checklist

1. Update `docs/map-data-policy.md` with the Tier 1 scope, cutoff rule, deferred tiers, and non-endorsement language.
2. Update `docs/map-data-overrides.json` so the six Tier 1 disputes have auditable policy records.
3. Add package dispute metadata in `lib/src/disputes.ts`.
4. Export dispute types and data from `lib/src/index.tsx`.
5. Extend render context types so callbacks can receive optional dispute metadata.
6. Preserve existing default rendering when consumers do not use dispute metadata.
7. Add tests for metadata completeness, context exposure, default compatibility, and docs policy expectations.
8. Regenerate package README if exported API documentation changes.
9. Add a changeset describing the public package and policy impact.

## Example Consumer Flow

```tsx
import WorldMap, { disputedTerritories } from "react-svg-worldmap";

<WorldMap
  data={[{ country: "UA", value: 1 }]}
  styleFunction={(context) => {
    if (context.dispute?.display.borderStyle === "dashed") {
      return { strokeDasharray: "4 2" };
    }

    return {};
  }}
  tooltipTextFunction={(context) =>
    context.dispute?.display.tooltipLabel ?? context.countryName
  }
/>;

console.log(disputedTerritories.crimea.status);
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
```

Also verify package contents if public exports change:

```bash
npm pack --dry-run ./lib
```

## Expected Results

- All six Tier 1 disputes are present and documented.
- Ordinary map rendering remains unchanged for consumers who ignore dispute metadata.
- Dispute-aware consumers can style or label supported regions from callback context.
- No new runtime dependency is required.
- Generated TypeScript declarations include the new public types and exports.
