---
"react-svg-worldmap": minor
---

`size="responsive"` now fills the full width of its container instead of stopping at 75% of the smaller viewport dimension. The map measures its `<figure>` rather than the outer wrapper, so the figure's margins no longer make the SVG overflow. To limit the size, constrain the container (for example with `max-width`) or pass a number as `size`.
