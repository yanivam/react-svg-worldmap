# react-svg-worldmap

## 2.1.0

### Minor Changes

- d9b6e96: `size="responsive"` now fills the full width of its container instead of stopping at 75% of the smaller viewport dimension. The map measures its `<figure>` rather than the outer wrapper, so the figure's margins no longer make the SVG overflow. To limit the size, constrain the container (for example with `max-width`) or pass a number as `size`.

### Patch Changes

- d9b6e96: Remove duplicated geometry from the bundled world map: France no longer lists Corsica twice (which could leave Corsica unfilled under `fill-rule: evenodd`), and a degenerate single-point polygon in North Korea, zero-length arcs, and repeated points have been dropped. Country shapes are otherwise unchanged.
