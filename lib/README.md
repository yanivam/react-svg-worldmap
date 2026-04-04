## Overview

`react-svg-worldmap` is designed for teams that want a simple client-side world map without a hosted map service, API dependency, or heavyweight geographic stack. The package ships a bundled map and exposes a small React API for coloring countries, attaching interactions, and rendering values.

## Why teams use it

- Bundled map data with no runtime network requests
- Small API surface focused on thematic data visualization
- Works with standard React applications without a map platform dependency
- Ships ESM, CJS, and TypeScript declaration files

## Documentation & Examples

Live examples and package documentation are available at [yanivam.github.io/react-svg-worldmap](https://yanivam.github.io/react-svg-worldmap).

## Install

### Minimum requirements

- React `>=16.8`
- `react-dom >=16.8` for browser-rendered applications

### Install from npm

```bash
npm install react-svg-worldmap
```

## Usage

```tsx
import * as React from "react";
import WorldMap from "react-svg-worldmap";
import "./App.css";

function App() {
  const data = [
    { country: "cn", value: 1389618778 },
    { country: "in", value: 1311559204 },
    { country: "us", value: 331883986 },
    { country: "id", value: 264935824 },
    { country: "pk", value: 210797836 },
    { country: "br", value: 210301591 },
    { country: "ng", value: 208679114 },
    { country: "bd", value: 161062905 },
    { country: "ru", value: 141944641 },
    { country: "mx", value: 127318112 },
  ];

  return (
    <div className="App">
      <WorldMap
        color="red"
        title="Top 10 Populous Countries"
        valueSuffix="people"
        size="lg"
        data={data}
      />
    </div>
  );
}
```

## Data Sources And Neutrality Policy

The bundled map is a small-scale thematic visualization for charts and dashboards. It is not presented as a legal, diplomatic, or authoritative boundary reference.

The project uses a documented source hierarchy instead of treating one raw dataset as authoritative for every geopolitical question:

1. `UNSD M49` and `UNTERM` for neutral naming, codes, and terminology
2. `Natural Earth Admin 0 Countries` for the bundled small-scale geometry
3. A repo-maintained overrides register for disputed or recognition-sensitive cases

This project aims to stay neutral by documenting how naming, geometry, and disputed territories are handled. For sensitive cases, maintainers prefer reviewable documentation and coarse small-scale representation over silent or over-precise political claims.

Source attribution and policy details:

- [Map data policy](https://github.com/yanivam/react-svg-worldmap/blob/main/docs/map-data-policy.md)
- [Sensitive-case overrides register](https://github.com/yanivam/react-svg-worldmap/blob/main/docs/map-data-overrides.json)
- [Natural Earth Admin 0 Countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/)
- [UNSD M49](https://unstats.un.org/unsd/methodology/m49/)
- [UNTERM](https://unterm.un.org/)

## Notes

- Country codes use ISO 3166-1 alpha-2 values such as `us`, `fr`, and `jp`.
- The default map is bundled locally with the package.
- The component does not fetch map geometry from a remote API at runtime.

## Accessibility

The component is designed to be WCAG 2.2 AA compliant at the component level:

- The root `<svg>` is annotated with `role="img"` and `aria-labelledby` pointing to an embedded `<title>` element.
- Each country region SVG element carries its own `<title>` with the country name and value.
- The component ships no decorative elements without `aria-hidden`.

### Responsibilities of the consuming application

Because `<WorldMap>` is a self-contained SVG widget and not a full page, the host application should provide page-level landmarks:

| Requirement | WCAG criterion | What to do |
| --- | --- | --- |
| Skip link | 2.4.1 Bypass Blocks | Add a visually-hidden `<a href="#main-content">Skip to main content</a>` as the first focusable element in your page shell |
| `<main>` landmark | 1.3.1 Info and Relationships | Wrap the primary page content in `<main id="main-content">` |
| `<nav>` landmark | 1.3.1 Info and Relationships | Wrap your site navigation in `<nav aria-label="Main">` |
