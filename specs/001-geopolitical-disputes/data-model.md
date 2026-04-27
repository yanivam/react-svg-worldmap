# Data Model: Neutral Geopolitical Disputes

## Territory

Represents a geographic unit available through the world map package.

Fields:

- `code`: Existing package country or territory code when one exists.
- `name`: Display name used by the current map.
- `disputeId`: Optional link to a dispute classification.
- `disputeRole`: Optional role such as recognized sovereign, controlling power, claimant, segment, or sensitive entity.

Validation rules:

- Existing country codes remain valid for ordinary package data.
- A territory may omit `disputeId` when it has no dispute classification.
- A Tier 1 territory represented in the map must link to a dispute classification or be documented as geometry-deferred.

## Dispute Classification

Represents a project policy decision for a disputed or partially recognized case.

Fields:

- `id`: Stable kebab-case identifier.
- `name`: Human-readable dispute name.
- `tier`: Initial support tier; Tier 1 is required for this feature.
- `status`: One of `disputed`, `partially-recognized`, `non-self-governing`, or `politically-sensitive`.
- `recognizedSovereign`: Optional recognized sovereign or baseline position.
- `controllingPower`: Optional controlling power where materially different from recognized sovereignty.
- `disputeParties`: Non-empty list of parties relevant to the project classification.
- `territories`: Non-empty list of affected territories or segments.
- `sourceRationale`: Short public rationale tied to credible international, legal, treaty, diplomatic, state-level, or major mapping-platform treatment.
- `display`: Display guidance for borders, fill, labels, and tooltip wording.
- `reviewStatus`: `active`, `deferred`, or `maintainer-review-required`.

Validation rules:

- Every Tier 1 dispute must include `id`, `tier`, `status`, `disputeParties`, `territories`, `sourceRationale`, and `display`.
- Tier 1 disputes must be exactly: Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, and Kosovo.
- `sourceRationale` must be public and auditable; it must not rely on private maintainer judgment alone.
- `display` must avoid language that endorses one claimant.

## Initial Tier 1 Dispute Set

Required records:

- `crimea`: Ukraine-recognized, Russia-controlled disputed territory.
- `palestinian-territories`: Disputed or partially recognized; West Bank and Gaza distinguishable.
- `taiwan`: Separately controlled and disputed or politically sensitive.
- `kashmir`: Segmented among India, Pakistan, and China where relevant.
- `western-sahara`: Disputed or non-self-governing; not fully assigned to Morocco.
- `kosovo`: Partially recognized.

Validation rules:

- All six records must exist before release.
- No Tier 2 or Tier 3 record is required for this feature.
- Deferred candidates may be documented but must not be implied as supported initial data.

## Display Guidance

Represents how consumers can present dispute-sensitive regions.

Fields:

- `borderStyle`: `solid`, `dashed`, or `unchanged`.
- `labelStrategy`: `single`, `dual`, `segment`, or `metadata-only`.
- `tooltipLabel`: Neutral display string suitable for a tooltip or accessible title.
- `defaultDescription`: Short neutral explanation for documentation.

Validation rules:

- Default ordinary map rendering remains compatible with existing consumers.
- Dispute-aware display guidance must be available to style functions and tooltip functions.
- Tooltip and title wording must preserve existing SVG accessibility behavior.

## Geopolitical Proposal

Represents a contributor request that changes policy, metadata, names, boundaries, or dispute status.

Fields:

- `affectedTerritories`: One or more territories or dispute identifiers.
- `requestedChange`: Boundary, name, sovereignty, classification, display, or documentation change.
- `evidence`: Public sources supplied by the contributor.
- `cutoffCriteriaMet`: At least one accepted inclusion criterion.
- `reviewOutcome`: Accept, request evidence, redirect, reject, or defer.

Validation rules:

- A proposal outside Tier 1 must be deferred unless it is only documentation of future candidates.
- A claim that meets no cutoff criteria must be rejected.
- Requests to silently flip sovereignty must be rejected or redirected to explicit dispute representation.

## State Transitions

```text
candidate -> evidence-review -> active
candidate -> evidence-review -> rejected
candidate -> deferred
active -> maintainer-review-required
maintainer-review-required -> active
```

Rules:

- Tier 1 records enter `active` only after metadata, policy rationale, display guidance, and tests are complete.
- Future Tier 2 or Tier 3 candidates remain `deferred` until separately planned.
- Any contradiction between metadata and policy moves the case to `maintainer-review-required`.
