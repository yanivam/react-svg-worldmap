---
sidebar_position: 1
slug: /
---

# Introduction

## Why is it different?

`react-svg-worldmap` focuses on simple, local, SVG-based thematic maps.

- Draw countries on a world map.
- Free with no registration or hosted map account.
- Pure React component with ESM, CJS, and TypeScript declarations.
- No internet dependency for map geometry at runtime.
- Optional zoom, labels, pins, and region detail when the application needs more inspection.
- Easy to learn, easy to use, easy to customize.

## Yet another package for world map...but why?

It started with a project that needed a simple world map inside a React application. Many map platforms solve navigation, routing, tiles, satellite views, and geocoding. This package is deliberately narrower: render a bundled thematic world map, color countries from application data, and keep the default experience local and lightweight.

## Current release

Release `2.1.0` adds smoother staged zoom rendering and an optional `@react-svg-worldmap/regions` package for reviewed first-level region overlays in 23 target countries. Country-only maps still work without the optional package.
