# Research: Zoom Drill-Down

## Decision: Keep The Country-Level Map As The Default

Rationale: Existing consumers expect a lightweight bundled world map. Defaulting to country-level behavior avoids requiring new data packages, provider setup, or interaction changes during upgrade.

Alternatives considered:

- Enable drill-down automatically: rejected because it would change established behavior and add fallback warnings for users who did not opt in.
- Replace the country map with a region-capable shell: rejected because it would raise bundle and complexity risk for the default use case.

## Decision: Make Zooming The Phase 1 Opt-In

Rationale: Zooming, panning, labels, and country city details can be delivered without expanding the package into region-level map data. This reduces release risk and gives Phase 2 a stable viewport and interaction model to build on.

Alternatives considered:

- Build region drill-down first: rejected because the user specifically wants Phase 1 to avoid region-level details.
- Enable zooming automatically: rejected because it would change established behavior for existing consumers.

## Decision: Support Continuous Zoom And Drag Panning In The Core

Rationale: The interaction should feel like a map exploration tool rather than a fixed set of preset views. Continuous zoom with stable reset behavior gives consumers a flexible base while still keeping the default rendering unchanged.

Alternatives considered:

- Country-only click-to-focus: rejected because it does not cover panning or repeated zoom workflows.
- A finite zoom-step enum: rejected because it conflicts with the requested infinite zoom behavior.

## Decision: Add Country Labels By Default When Zoom Is Enabled

Rationale: Labels are expected once users zoom into the map. They must be filtered by country area, label size, visible viewport, and collision with other labels so the zoomed map remains readable.

Alternatives considered:

- Render every country label: rejected because dense regions would overlap immediately.
- Require consumers to provide labels: rejected because Phase 1 should be usable out of the box.

## Decision: Handle Non-Contiguous Countries As Multiple Geometry Parts

Rationale: Countries such as the United States should not use a single misleading bounding box or centroid that spans detached territory. Label placement should evaluate candidate parts and prioritize the readable main visible landmass while still accounting for other visible parts.

Alternatives considered:

- Use the existing full-country centroid only: rejected because it can place labels over empty space.
- Suppress all non-contiguous country labels: rejected because large countries still need labels when space permits.

## Decision: Include Country-Level Capital And Largest-City Metadata In Phase 1

Rationale: Capital and largest-city details provide useful extra context at high zoom without introducing a full point-of-interest or city layer. They are metadata tied to the country record and are shown only when the zoomed country area can fit them without unacceptable overlap.

Alternatives considered:

- Keep all city and capital data out of Phase 1: rejected by the updated scope.
- Render all cities as a layer: rejected because it would expand the scope beyond country-level metadata.

## Decision: Add An Async Detail Provider Boundary In Phase 2

Rationale: Even when region data is package-backed, an async provider lets the core handle loading, unavailable coverage, and failures consistently. It also leaves room for future local lazy loading or remote/static assets without redesigning the public model.

Alternatives considered:

- Synchronous direct import from the optional package: rejected because it couples the core to one delivery mechanism.
- Remote-first loading: rejected because the feature must require no hosted service or network access.

## Decision: Put Region Data In An Optional Workspace Package In Phase 2

Rationale: A separate regions package preserves the base package's small default footprint and makes detailed geography an explicit consumer choice. This mirrors the neutral-map-policy plan's policy-first pattern: keep the default artifact stable and move sensitive/large optional data into clearly documented surfaces.

Alternatives considered:

- Bundle all regions into `react-svg-worldmap`: rejected because it would increase the base package for all consumers.
- One package per country: rejected because it would fragment installation and maintenance.

## Decision: Provide Accessible Controls In The Core

Rationale: Zoom and later drill-down cannot rely on pointer gestures or irregular SVG targets. Explicit controls, keyboard operation, focus management, and live announcements are required for equivalent use. Phase 2 region detail adds visible-region list navigation when regions are displayed.

Alternatives considered:

- Leave controls to consumers: rejected because accessibility would become inconsistent and hard to validate.
- Pointer-only zooming: rejected because it fails the component-level accessibility goal.

## Decision: Use Collision-Aware Default Labels

Rationale: Country labels and later region labels are useful only when readable. Greedy collision-aware placement with priority ordering is sufficient for this feature and avoids adopting a heavyweight cartographic label engine.

Alternatives considered:

- Render every label: rejected because labels overlap in dense regions.
- Omit labels entirely: rejected because labels are part of the expected zoom value and accessible visible context.
- Curved or dense city labeling: rejected for Phase 1 because city rendering is limited to country-level capital/largest-city details.

## Decision: Treat Region Data As A Neutrality-Reviewed Map Data Change

Rationale: Region names, boundaries, and codes can carry political meaning. The feature must follow `docs/map-data-policy.md` and `docs/map-data-overrides.json` whenever region data affects sensitive cases.

Alternatives considered:

- Treat region data as purely technical: rejected because sub-country boundaries and names can still create geopolitical claims.
