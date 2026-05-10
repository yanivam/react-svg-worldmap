# Research: Shared Core Map Assets

## Decision: Keep Country Data In The Core Package

**Rationale**: Backward compatibility requires country-level maps to work after installing only `react-svg-worldmap`. Moving country topology to a new optional package would reduce the core package more aggressively, but it would force a new installation and configuration path for existing consumers.

**Alternatives considered**:

- New optional country-map package: rejected because it breaks the compatibility requirement.
- Hosted map assets: rejected because the library is expected to work without a hosted map service.
- Keep current duplicated entry-bundle data: rejected because it preserves the `10.5 MB` unpacked-size baseline.

## Decision: Use Package-Internal Shared Assets For Large Topology Payloads

**Rationale**: The current build duplicates large topology payloads in both public module outputs. Keeping one copy of each topology tier as package-internal assets lets ESM and CommonJS wrappers share the same published data while preserving public entry points.

**Alternatives considered**:

- Enable code splitting only: useful for runtime loading, but dual ESM/CJS outputs can still duplicate large chunks in the tarball.
- Thin wrapper around one module format: could reduce duplication, but increases compatibility risk for CommonJS and TypeScript consumers.
- Inline compression strings in both entry bundles: improves packed size but not inspectability, and may add runtime parse/decode cost.

## Decision: Remove Missing Source-Map References From Published JavaScript

**Rationale**: Local `.map` files are large and are not currently included in the package. Publishing them would make debugging clearer but would work against the unpacked-size goal. The safer release policy is to avoid `sourceMappingURL` references in published JavaScript unless the corresponding files are intentionally shipped.

**Alternatives considered**:

- Publish all source maps: rejected for this feature because local maps would add substantial unpacked size.
- Keep current references without publishing maps: rejected because it causes avoidable consumer warnings.
- Disable source maps for all local builds: rejected if it harms maintainer debugging unnecessarily; the release policy can be enforced at package output time.

## Decision: Treat Topology Metadata As Low Priority For Size Reduction

**Rationale**: Prior inspection showed topology metadata is only a few kilobytes per tier, while topology payloads are measured in megabytes. The implementation should avoid spending complexity on metadata deduplication unless package inspection proves it contributes meaningfully.

**Alternatives considered**:

- Normalize all metadata into separate shared files: rejected as premature unless measurements change.
- Rewrite topology schema: rejected because it risks accidental map-data behavior changes.

## Decision: Validate Compatibility Before Declaring The Change Shippable

**Rationale**: Package artifact layout changes can fail in consumer environments even when unit tests pass. Validation must include default import, named imports, CommonJS require, TypeScript declarations, website build, country-only rendering, detailed zoom rendering, optional regions, and source-map/package-content inspection.

**Alternatives considered**:

- Rely on unit tests only: rejected because package exports and npm file lists are release-surface behavior.
- Rely on size inspection only: rejected because size reductions are not acceptable if consumer loading breaks.

## Decision: Measure User-Visible Performance Risk

**Rationale**: Shared assets may affect startup, lazy loading, and zoom detail loading. The implementation must prove it does not meaningfully regress the smooth zoom expectations, especially the first visible response and detailed render completion path.

**Alternatives considered**:

- Optimize only package size: rejected because the previous feature established responsiveness as a core quality bar.
- Defer performance evaluation until release: rejected because package layout can change runtime loading behavior.
