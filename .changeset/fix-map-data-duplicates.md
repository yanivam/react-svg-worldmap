---
"react-svg-worldmap": patch
---

Remove duplicated geometry from the bundled world map: France no longer lists Corsica twice (which could leave Corsica unfilled under `fill-rule: evenodd`), and a degenerate single-point polygon in North Korea, zero-length arcs, and repeated points have been dropped. Country shapes are otherwise unchanged.
