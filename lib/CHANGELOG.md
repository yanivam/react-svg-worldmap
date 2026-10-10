# react-svg-worldmap

## 2.2.0

### Minor Changes

- 914e7ed: Add Tier 1 geopolitical dispute metadata (Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, Kosovo). New exports: `disputedTerritories`, `disputeIds`, `disputesByCountryCode`, `getDisputeById`, `getDisputeByCountryCode`, and the `Dispute*` types. Callback context gains an optional `dispute` field for countries linked to a dispute. Metadata only: the default map geometry and rendering are unchanged. The map data policy now documents the Tier 1 scope, inclusion criteria, and review outcomes.

## 2.1.0

### Minor Changes

- d9b6e96: `size="responsive"` now fills the full width of its container instead of stopping at 75% of the smaller viewport dimension. The map measures its `<figure>` rather than the outer wrapper, so the figure's margins no longer make the SVG overflow. To limit the size, constrain the container (for example with `max-width`) or pass a number as `size`.

### Patch Changes

- d9b6e96: Remove duplicated geometry from the bundled world map: France no longer lists Corsica twice (which could leave Corsica unfilled under `fill-rule: evenodd`), and a degenerate single-point polygon in North Korea, zero-length arcs, and repeated points have been dropped. Country shapes are otherwise unchanged.
