# Research: Optional Regions Data Package

## Decision: Use An Explicit SVG Rendering Layer Stack

The renderer will expose predictable SVG group order:

1. Ocean/background layer
2. Country land/fill and country border layer
3. Optional dotted region overlay layer
4. Label layer
5. Pin layer
6. Interaction/accessibility target layer

**Rationale**: The current visual defect may be caused by accidental ordering between ocean/background, country geometry, region overlays, and hit targets. A formal layer stack removes ambiguity and makes DOM order testable. It also matches common map rendering practice: background first, base geography next, overlays and annotations above.

**Alternatives considered**:

- Keep current order and only adjust fills/strokes. Rejected because it would not make layering regressions observable.
- Add a separate clipping/masking system. Deferred because SVG group ordering is simpler, lower risk, and sufficient for the stated issue unless closed-shape validation still fails.

## Decision: Keep Ocean As The Base Background Field

The ocean layer should be represented as the map's base field using the default `#A0D7EB` sea/background color. Country land shapes paint above it using the default no-data land color `#F4F2F2` or user-provided styles.

**Rationale**: This keeps the package lightweight and avoids introducing a new world-ocean geometry asset. The important contract is that countries are closed visible shapes above the ocean field and regions never replace country fills.

**Alternatives considered**:

- Generate a full world polygon with land holes. Rejected for now because it adds geometry complexity and package size without first proving that group order plus closed country paths is insufficient.
- Hosted/raster basemap. Rejected by the spec and constitution.

## Decision: Keep Interaction Targets Separate But Identity-Aligned

Interaction/accessibility targets may be rendered in a dedicated top layer, but they must carry country identity derived from the same rendered country record and must not use a different geometry that swallows unrelated countries.

**Rationale**: A separate top layer can preserve pointer behavior when labels, pins, or region overlays are present. The Russia hover bug requires identity and geometry alignment tests, not only visual tests.

**Alternatives considered**:

- Attach all interactions only to visible country paths. Viable, but less flexible for future accessibility/pointer tuning and may conflict with overlays.
- Keep current hit-test behavior untested. Rejected because the user-visible failure is an interaction/rendering mismatch.

## Decision: Preserve Existing Geometry Disclosure Thresholds

Reduced country geometry remains active below `2x`, detailed country geometry at or above `2x`, and optional regions at or above `4x` when selected and readable.

**Rationale**: The new layer stack should not increase initial parse cost or undo the package-size work. Layer order is orthogonal to geometry disclosure and must work for both country tiers.

**Alternatives considered**:

- Always load detailed country geometry to simplify rendering. Rejected because it increases initial memory/parse cost.
- Load regions earlier. Rejected because it increases clutter and parse cost before regions are useful.

## Decision: Test Layer Order Structurally And Behaviorally

Validation will inspect SVG group order and identity attributes, then pair that with rendering/hit-test regressions for Russia, United States, Mexico, Nigeria, and Brazil.

**Rationale**: Structural tests catch the layering contract directly. Behavioral tests catch the user-visible outcome if geometry or hit targets are still wrong.

**Alternatives considered**:

- Screenshot-only testing. Deferred because the existing test stack is DOM/Vitest based and structural tests are faster and less brittle.
- Manual visual review only. Rejected because it would not prevent regressions.
