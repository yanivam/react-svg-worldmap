# react-svg-worldmap [![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://img.shields.io/npm/v/react-svg-worldmap.svg?style=flat)](https://www.npmjs.com/package/react-svg-worldmap)

A simple, compact and free React SVG world map.

![simple example](https://raw.githubusercontent.com/yanivam/react-svg-worldmap/master/simple-example.gif)

## Documentation & Examples

We use GitHub pages to provide documentation with ample of live examples.

Give it a try at [yanivam.github.io/react-svg-worldmap](https://yanivam.github.io/react-svg-worldmap).

## Why is it different?

Focus on simple and free.

- Draw countries on a world map.
- Free - Really free with no limits.
- No registration - It is just a pure react component.
- No internet dependency - All the data is local, no calls to a back-end server.
- Easy to learn, easy to use, easy to customize.

## Yet another package for world map...but why?

It all started with a fun project that I was building and needed to draw simple yet beautiful world's map. Searching for solutions I found many potential solutions like MapBox and Google Maps, but they were "too smart" for what I needed. They needed to "call home" for the data, they supported tons of options I didn't need, and while they included react-integrations, they were not completely native to the react world. There was definitely something missing. And that's when react-svg-worldmap started.

## Map Data Policy

The default map bundled with `react-svg-worldmap` is a small-scale thematic visualization for charts and dashboards. It is not presented as a legal or authoritative boundary reference.

The repo's map data policy now separates neutral naming guidance, cartographic geometry, and dispute handling. See [`docs/map-data-policy.md`](docs/map-data-policy.md) for the source hierarchy and the review process for disputed or recognition-sensitive cases.

## Install

### Package requirements

- React `>=16.8`
- `react-dom >=16.8` when your app renders in the browser

### Install command

```
npm install react-svg-worldmap --save
```

## Usage

Here is a simple example:

```tsx
import * as React from "react";
import WorldMap from "react-svg-worldmap";
import "./App.css";

function App() {
  const data = [
    { country: "cn", value: 1389618778 }, // china
    { country: "in", value: 1311559204 }, // india
    { country: "us", value: 331883986 }, // united states
    { country: "id", value: 264935824 }, // indonesia
    { country: "pk", value: 210797836 }, // pakistan
    { country: "br", value: 210301591 }, // brazil
    { country: "ng", value: 208679114 }, // nigeria
    { country: "bd", value: 161062905 }, // bangladesh
    { country: "ru", value: 141944641 }, // russia
    { country: "mx", value: 127318112 }, // mexico
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

## Development

This repo is a Yarn workspace with two packages: `lib` (the component) and `website` (the Docusaurus examples site).

### Prerequisites

- Node >= 18
- Yarn

```
yarn install
```

### 1. Building the package

Builds the library and outputs CJS + ESM bundles to `lib/dist/`:

```
yarn build:package
```

To build and pack a local `.tgz` for testing in another project (run from `lib/`):

```
cd lib
yarn build:local
```

### 2. Running the examples site

The website imports the library from `lib/dist/`, so build the package first.

```
yarn build:package
yarn start:website
```

The dev server starts at `http://localhost:3000`.

### 3. Building the full site for deployment

```
yarn build
```

This runs `build:package` then `build:website` in sequence.

### Notes

- The npm package publishes the package README from `lib/README.md`.
- The bundled package ships ESM, CJS, and TypeScript declaration files from `lib/dist/`.

## Accessibility

The component is designed to be WCAG 2.2 AA compliant at the component level:

- The root `<svg>` is annotated with `role="img"` and `aria-labelledby` pointing to an embedded `<title>` element.
- Each country region SVG element carries its own `<title>` with the country name and value.
- The component ships no decorative elements without `aria-hidden`.

### Responsibilities of the consuming application

Because `<WorldMap>` is a self-contained SVG widget — not a full page — the following page-level landmarks must be provided by the host application:

| Requirement | WCAG criterion | What to do |
| --- | --- | --- |
| Skip link | 2.4.1 Bypass Blocks | Add a visually-hidden `<a href="#main-content">Skip to main content</a>` as the first focusable element in your page shell |
| `<main>` landmark | 1.3.1 Info and Relationships | Wrap the primary page content in `<main id="main-content">` |
| `<nav>` landmark | 1.3.1 Info and Relationships | Wrap your site navigation in `<nav aria-label="Main">` |

The examples site (`website/`) demonstrates all three: `website/src/theme/Root.tsx` injects the skip link app-wide, and every example page wraps its content in `<main id="main-content">`.

## License

MIT
