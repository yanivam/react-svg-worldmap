# Research: Smooth Zoom Performance

## Decision: Start With Progressive SVG Optimization Plus Perceptual Motion

**Rationale**: The package has much less data than a full map platform and already has a React/SVG public contract. The most conservative path is to make the first visible response cheap, keep the SVG renderer, and defer or reuse secondary work. This aligns with the clarification that heavier renderer or tile-like architecture should be escalation only.

**Alternatives considered**:

- Separate canvas/WebGL renderer: potentially fast, but adds complexity, accessibility duplication, bundle risk, and a second rendering contract.
- Tile-like data architecture: useful for very large map data, but likely premature for this package's current country/region scale.
- No animation, only compute optimization: may improve total time but can still feel stalled if the first visible feedback waits for all detail.

## Decision: Measure User-Visible Timing, Not Only Internal Computation

**Rationale**: The user problem is perceived delay after clicking zoom. The benchmark must measure click-to-visible-feedback and click-to-visible-completion so an implementation cannot pass while still feeling frozen.

**Alternatives considered**:

- Unit-only timing around helper functions: useful for diagnosis, but insufficient to validate user experience.
- Manual stopwatch testing only: helpful for spot checks, but not repeatable enough to prevent regressions.

## Decision: Representative Scenarios Cover Three Zoom States

**Rationale**: The slow path may vary by visible detail. The scenario set must include full-world view, detailed country geometry/labels, and a state where optional region detail is available. Rapid repeated clicks are included because queued updates can expose state consistency defects.

**Alternatives considered**:

- Test only the zoom example: simpler, but may miss dense detail and optional-region regressions.
- Test every custom configuration: not feasible because consumers can provide unbounded labels, pins, data, and styles.

## Decision: Preserve SVG Accessibility And Public API

**Rationale**: The constitution requires an accessible, lightweight React library. The initial performance work should not change how users opt into zoom or how assistive technologies see the SVG output.

**Alternatives considered**:

- Replace SVG with a non-SVG default: could improve rendering speed but would violate the core package value unless proven necessary and designed as a compatible option.
- Add a required hosted map dependency: rejected by the spec and constitution.

## Decision: Escalate Only On Benchmark Evidence

**Rationale**: Canvas/WebGL or tile-like data splitting should remain available if the A+B approach cannot hit 250 ms typical and 500 ms maximum, but the plan should not spend complexity before measurements justify it.

**Alternatives considered**:

- Commit to WebGL immediately: high cost and likely unnecessary for the current data volume.
- Commit to a tile-like architecture immediately: may fit too closely to Google Maps scale rather than this package's scale.

## Decision: Product Lessons From Major Map Platforms

**Rationale**: Google Maps documentation describes raster maps as grids of server-generated image tiles and vector maps as client-side WebGL rendering that supports smoother fractional zoom. The transferable lessons are not the hosted service itself, but progressive detail, cached work, continuous camera motion, and keeping interactions decoupled from expensive detail rendering.

**Alternatives considered**:

- Copy Google Maps architecture directly: rejected because this package is a bundled thematic SVG component, not a full map platform.
- Ignore map-platform lessons: rejected because the current 1-2 second delay is exactly the kind of perceived-latency problem progressive map rendering patterns address.
