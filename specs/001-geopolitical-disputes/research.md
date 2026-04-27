# Research: Neutral Geopolitical Disputes

## Decision: Use The Existing Policy Documents As The Governance Source

Rationale: The constitution already requires geopolitical changes to reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`. Extending those files keeps the decision process visible to contributors and avoids splitting policy across private notes or package internals.

Alternatives considered:

- Create a new standalone policy file: rejected because it would duplicate existing policy concepts and weaken the constitution reference.
- Keep policy only in code comments: rejected because contributors and users need a public, reviewable policy surface.

## Decision: Treat Tier 1 As The Only Initial Dataset Scope

Rationale: The clarified spec names exactly six initial disputes: Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, and Kosovo. Keeping the release to this Tier 1 set provides visible global coverage while avoiding a large, hard-to-review geopolitical expansion.

Alternatives considered:

- Include Tier 2 in the initial release: rejected because it broadens geometry and source-review risk before the core framework is proven.
- Keep the framework without any concrete cases: rejected because users have specific high-visibility expectations and success criteria require all six Tier 1 disputes.

## Decision: Add Package-Owned Dispute Metadata Instead Of Replacing Base Geometry

Rationale: The current package renders checked-in small-scale TopoJSON. Adding metadata allows consumers to identify and style dispute-sensitive regions while preserving existing rendering behavior and avoiding a contentious geometry rewrite in the first release.

Alternatives considered:

- Regenerate topology for all disputed boundaries immediately: rejected because precise disputed boundary geometry would increase scope and political risk.
- Store disputes only in `docs/map-data-overrides.json`: rejected because consumers need package-accessible metadata without parsing documentation assets.

## Decision: Preserve Default Rendering And Add Opt-In Dispute-Aware Styling

Rationale: Existing consumers should continue rendering ordinary thematic maps. Consumers who want dispute-aware presentation can opt into metadata-aware styling, labels, and tooltips through typed context and exported helper data.

Alternatives considered:

- Change default map styling for all consumers: rejected because it risks unexpected visual regressions.
- Add localized map variants by viewer country: rejected because the spec explicitly excludes country-specific localized views for the initial feature.

## Decision: Use Existing TypeScript Types And React Context Surfaces

Rationale: `CountryContext` already drives style, tooltip, link, and click callbacks. Extending it with optional dispute metadata gives consumers a natural path to customize behavior while preserving existing callbacks.

Alternatives considered:

- Add a separate render pass for dispute overlays: deferred because it may be useful later for precise boundaries but is unnecessary for Tier 1 metadata and country-level styling.
- Add a runtime configuration service: rejected because the library must remain lightweight and bundled.

## Decision: Validate With Policy, Metadata, Render, And Package Tests

Rationale: This feature spans docs, data, public exports, and rendering behavior. Tests must cover the six Tier 1 cases, cutoff criteria, context exposure, default compatibility, and documentation/package integrity.

Alternatives considered:

- Manual review only: rejected because regressions in public types or rendering context would be easy to miss.
- Snapshot-only testing: rejected because metadata correctness and policy criteria need explicit assertions.
