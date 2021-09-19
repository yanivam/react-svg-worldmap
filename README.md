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

## Install

In order to install, run the following command:

```
$ npm install react-svg-worldmap --save
```

## Usage

Here is a simple example:

```tsx
import React from 'react';
import WorldMap from 'react-svg-worldmap';
import './App.css';

function App() {
  const data = [
    {country: 'cn', value: 1389618778}, // china
    {country: 'in', value: 1311559204}, // india
    {country: 'us', value: 331883986}, // united states
    {country: 'id', value: 264935824}, // indonesia
    {country: 'pk', value: 210797836}, // pakistan
    {country: 'br', value: 210301591}, // brazil
    {country: 'ng', value: 208679114}, // nigeria
    {country: 'bd', value: 161062905}, // bangladesh
    {country: 'ru', value: 141944641}, // russia
    {country: 'mx', value: 127318112}, // mexico
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

## License

MIT
