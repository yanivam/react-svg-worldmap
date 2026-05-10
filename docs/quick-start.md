---
sidebar_position: 2
---

# Quick start

## Install

Install the core package:

```bash npm2yarn
npm install react-svg-worldmap
```

Optional region overlays are published separately:

```bash npm2yarn
npm install @react-svg-worldmap/regions
```

## Usage

Here is a simple example:

```tsx
import * as React from "react";
import "./App.css";
import WorldMap from "react-svg-worldmap";

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

The only mandatory prop is `data`. It contains country/value objects for the countries you want to color. Countries without a value use the default no-data land color. Country codes use ISO 3166-1 alpha-2 values such as `us`, `fr`, and `jp`; `value` can be a number or string.

## Zoom and region detail

Enable zoom when users need closer inspection:

```tsx
<WorldMap data={data} zoom />
```

Region detail is opt-in. Install `@react-svg-worldmap/regions`, create a provider, and pass it to the map:

```tsx
import WorldMap from "react-svg-worldmap";
import { createRegionsDetailProvider } from "@react-svg-worldmap/regions";

const detailProvider = createRegionsDetailProvider();

<WorldMap
  data={[{ country: "US", value: 1 }]}
  zoom
  detailLevel="regions"
  detailProvider={detailProvider}
/>;
```

Region overlays appear at `4x` zoom and above. Unsupported countries keep the country-level view.

## Class components

```jsx
import * as React from "react";
import { Component } from "react";
import WorldMap from "react-svg-worldmap";

export default class App extends Component {
  render() {
    // ...
    const data = [
      { country: "cn", value: 1389618778 }, // china
      { country: "in", value: 1311559204 }, // india
    ];
    // ...
    return (
      <div id="root">
        <WorldMap color="green" title="This is My Map" size="lg" data={data} />
      </div>
    );
  }
}
```
