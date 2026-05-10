# Public API Contract: Smooth Zoom Performance

## WorldMap Zoom Contract

The default import from `react-svg-worldmap` remains the main React component. Existing zoom-related props and behavior remain supported.

Required user-visible behavior:

- A zoom-control click must provide visible feedback within the performance target for representative maps.
- A zoom-control click must complete the visible zoom update within the maximum target for representative maps.
- Rapid repeated zoom clicks must end at the final requested zoom state.
- Reset must continue to restore the full-world view in one action.
- Hover identity, labels, pins, region overlays, and interaction targets must remain consistent with the rendered map.

Required accessibility behavior:

- The SVG title/accessibility behavior must remain compatible with the documented package behavior.
- Interaction targets must not report a country or region identity that conflicts with the visible shape.
- Any deferred visual detail must not leave stale or contradictory accessible names once the visible update completes.

## Performance Measurement Contract

The repository must expose a repeatable validation path for representative zoom responsiveness.

Required report content:

- Scenario name.
- Number of measured interactions.
- Typical click-to-visible-feedback timing.
- Maximum click-to-visible-completion timing.
- Clear pass/fail status for the 250 ms typical and 500 ms maximum targets.

Required representative scenarios:

- Full-world zoom in and zoom out.
- Detailed zoom with labels or pins.
- Zoom level where optional region detail is available.
- Rapid repeated zoom clicks.

## Documentation Contract

Documentation must describe performance expectations in user-facing terms.

Rules:

- Do not promise the target for arbitrary consumer configurations with unbounded data, labels, pins, styles, or container constraints.
- Document the representative scenarios used to validate the target.
- If the implementation changes public behavior, package contents, or release expectations, update `README.md`, `lib/README.md`, API docs, examples, changelog, and README generation as applicable.

## Escalation Contract

The initial implementation must prioritize progressive SVG optimization and immediate perceptual motion.

Escalation to a separate high-performance renderer or tile-like data architecture is allowed only when:

- Representative measurements show the initial approach cannot meet the 250 ms typical and 500 ms maximum targets.
- The plan documents accessibility, bundle-size, release, and compatibility impact.
- The alternative remains optional or otherwise preserves the existing SVG contract unless a breaking change is explicitly approved.
