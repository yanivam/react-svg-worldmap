---
sidebar_position: 1
slug: /
---

# Introduction

:::tip New in 2.3.0: Equal Earth projection

The equal-area Equal Earth projection is now generally available. Add `projection="equalEarth"` to draw countries at their true relative size. Mercator stays the default, so existing maps do not change. See [Projections](./customization.md#projections) and the [Equal Earth example](/examples/equal-earth).

:::

## Why is it different?

Focus on simple and free.

- Draw countries on a world map.
- Free - Really free with no limits.
- No registration - It is just a pure react component.
- No internet dependency - All the data is local, no calls to a back-end server.
- Easy to learn, easy to use, easy to customize.
- Two projections: the familiar Mercator (default) and the equal-area Equal Earth.

## Yet another package for world map...but why?

It all started with a fun project that I was building and needed to draw simple yet beautiful world's map. Searching for solutions I found many potential solutions like MapBox and Google Maps, but they were "too smart" for what I needed. They needed to "call home" for the data, they supported tons of options I didn't need, and while they included react-integrations, they were not completely native to the react world. There was definitely something missing. And that's when react-svg-worldmap started.
