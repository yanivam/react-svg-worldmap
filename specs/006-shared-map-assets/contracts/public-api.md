# Public API Contract: Shared Core Map Assets

## Package Installation

Installing `react-svg-worldmap` alone must continue to provide country-level map rendering. No new country-map package, peer dependency, hosted asset, runtime service, or consumer configuration step may be required.

The optional `@react-svg-worldmap/regions` package remains separate and opt-in. This feature must not make it a dependency of the core package.

## Import And Require Compatibility

The following consumer patterns must continue to resolve and expose the same documented API surface:

```ts
import WorldMap from "react-svg-worldmap";
import { WorldMap } from "react-svg-worldmap";
```

```js
const worldmap = require("react-svg-worldmap");
```

TypeScript declaration entry points must continue to match the JavaScript exports and must not expose new required country-asset configuration.

## Rendering Compatibility

Country-only maps must render when only `react-svg-worldmap` is installed.

Zoomed detailed-country rendering must continue to load the detailed country topology when required by existing zoom behavior.

Optional region rendering must keep the existing opt-in behavior and must continue to work when `@react-svg-worldmap/regions` is installed and supplied by the consumer.

Hover, labels, pins, accessibility title behavior, and public map props are not part of the artifact-layout change and must remain behaviorally compatible.

## Package Contents Contract

The core package may include package-internal country topology assets. Those assets are implementation details and do not create a new public import contract unless explicitly documented later.

The package must include every file needed by its published JavaScript and declaration files. Published JavaScript must not reference missing `.map` files.

The expected size budget is:

- Packed size: `<= 1.2 MB`
- Unpacked size: `<= 7.875 MB`

## Failure Contract

If a country map asset cannot be loaded in a supported environment, the failure must be diagnosable through an error path or test-visible failure. The package must not silently render incorrect geography.

## Documentation Contract

Consumer-facing docs and release notes must explain:

- That country-level maps still ship in `react-svg-worldmap`
- That the regions package remains optional
- The package-size change
- The source-map policy
- The semantic-version impact and compatibility rationale
