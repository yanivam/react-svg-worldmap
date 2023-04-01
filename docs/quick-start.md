---
sidebar_position: 2
---

# Quick start

## Install

In order to install, run the following command:

```bash npm2yarn
npm install react-svg-worldmap --save
```

## Usage

Explore the example folder for a simple case for an end-to-end react app using the react-svg-worldmap.

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
        value-suffix="people"
        size="lg"
        data={data}
      />
    </div>
  );
}
```

The only mandatory prop is `data`, which contains an array of country/value objects, with values for countries that you have values for. (Countries without a value will be blank.) The country code is a 2 character string representing the country ([ISO alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)) and `value` is a number or string.

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
