# Public API Contract: Neutral Geopolitical Disputes

## Package Exports

The package must expose dispute metadata through stable TypeScript exports from the package entry point.

Required exported concepts:

- `DisputeStatus`
- `DisputeTier`
- `DisputeDisplayGuidance`
- `DisputeClassification`
- `disputedTerritories`
- A lookup helper or record keyed by dispute id or territory code

Compatibility requirements:

- Existing default import and existing named type exports continue to work.
- Existing `DataItem`, `Data`, `CountryContext`, and `Props` usage remains source-compatible for consumers that do not read dispute metadata.
- New fields added to render context must be optional so existing callbacks remain valid.

## Dispute Metadata Shape

Each dispute record must provide:

```ts
type DisputeTier = "tier-1";

type DisputeStatus =
  | "disputed"
  | "partially-recognized"
  | "non-self-governing"
  | "politically-sensitive";

type DisputeDisplayGuidance = {
  borderStyle: "solid" | "dashed" | "unchanged";
  labelStrategy: "single" | "dual" | "segment" | "metadata-only";
  tooltipLabel: string;
  defaultDescription: string;
};

type DisputeClassification = {
  id: string;
  name: string;
  tier: DisputeTier;
  status: DisputeStatus;
  recognizedSovereign?: string;
  controllingPower?: string;
  disputeParties: string[];
  territories: string[];
  sourceRationale: string;
  display: DisputeDisplayGuidance;
  reviewStatus: "active" | "deferred" | "maintainer-review-required";
};
```

## Render Context Contract

When a rendered region maps to dispute metadata, the region context passed to consumer callbacks must include optional dispute data.

Affected callbacks:

- `styleFunction`
- `tooltipTextFunction`
- `onClickFunction`
- `hrefFunction`

Required behavior:

- Ordinary regions receive no dispute metadata.
- Dispute-sensitive regions receive enough metadata for consumers to style dashed borders, neutral labels, or dispute-aware tooltips.
- Existing callbacks that ignore the new field behave exactly as before.
- Default SVG title and tooltip behavior remains accessible and neutral.

## Initial Dataset Contract

The first release of this feature must include exactly these Tier 1 disputes:

| ID | Required classification |
| --- | --- |
| `crimea` | Ukraine-recognized and Russia-controlled disputed territory |
| `palestinian-territories` | Disputed or partially recognized with West Bank and Gaza distinguishable |
| `taiwan` | Separately controlled and disputed or politically sensitive |
| `kashmir` | Segmented among India, Pakistan, and China where relevant |
| `western-sahara` | Disputed or non-self-governing; not fully assigned to Morocco |
| `kosovo` | Partially recognized |

## Documentation Contract

Documentation must explain:

- The project does not endorse geopolitical claims.
- The map is a small-scale thematic visualization, not a legal boundary reference.
- Tier 1 is the only supported initial dispute set.
- Tier 2 and Tier 3 are deferred expansion candidates.
- Contributors must meet at least one cutoff criterion before a new dispute is accepted.

## Validation Contract

Before implementation is complete:

- Tests assert all six Tier 1 records exist.
- Tests assert required fields exist for each record.
- Tests assert ordinary consumers can render without using dispute metadata.
- Tests assert render callbacks can access dispute metadata for supported regions.
- Package build emits updated TypeScript declarations for the public exports.
