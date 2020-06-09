# react-svg-worldmap [![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://img.shields.io/npm/v/react-svg-worldmap.svg?style=flat)](https://www.npmjs.com/package/react-svg-worldmap) [![Demo: Simple Example](https://img.shields.io/badge/demo-live-red.svg)](https://react-svg-worldmap-simple-example.imfast.io)


A simple, compact and free React SVG world map.

~~~tsx
import { WorldMap } from "react-svg-worldmap"
...
const data =
    [
      { country: "cn", value: 1389618778 }, // china
      { country: "in", value: 1311559204 }, // india
    ]
...
<WorldMap color="red" title="This is My Map" size="lg" data={data} />
~~~

## Why is it different? 
Focus on simple and free. 

* Draw countries on a world map. 
* Free - Really free with no limits. 
* No registration - It is just a pure react component. 
* No internet dependency - All the data is local, no calls to a back-end server. 
* Easy to learn, easy to use, easy to customize. 

## Yet another package for world map...but why?

It all started with a fun project that I was building and needed to draw simple yet beautiful world's map. Searching for solutions I found many potential solutions like MapBox and Google Maps, but they were "too smart" for what I needed. They needed to "call home" for the data, they supported tons of options I didn't need, and while they included react-integrations, they were not completely native to the react world. There was definitely something missing. And that's when react-world-countries-map started. 

## Install

In order to install, run the following command:

~~~
$ npm install react-svg-worldmap --save
~~~

## Usage

Explore the example folder for a simple case for an end-to-end react app using the react-world-countries-map. 

Here is a simple example:

~~~tsx
import React from "react"
import "./App.css"
import { WorldMap } from "react-svg-worldmap"

function App() {
  const data =
    [
      { country: "cn", value: 1389618778 }, // china
      { country: "in", value: 1311559204 }, // india
      { country: "us", value: 331883986 },  // united states
      { country: "id", value: 264935824 },  // indonesia
      { country: "pk", value: 210797836 },  // pakistan
      { country: "br", value: 210301591 },  // brazil
      { country: "ng", value: 208679114 },  // nigeria
      { country: "bd", value: 161062905 },  // bangladesh
      { country: "ru", value: 141944641 },  // russia
      { country: "mx", value: 127318112 }   // mexico
    ]

  return (
    <div className="App" >
       <WorldMap color="red" title="Top 10 Populous Countries" value-suffix="people" size="lg" data={data} />
    </div>
  )
}
~~~

## Customization

### Data
The only mandatory prop. Data contains an array of country/value objects, with values for countries that you have values for, (countries without a value will be blank). The country code is a 2 character string representing the country ([ISO alpha-2] (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)) and value is a number.

Example of valid data prop:

~~~tsx
  const data =
    [
      { country: "cn", value: 1 }, // china
      { country: "in", value: 2 }, // india
      { country: "us", value: 3 }  // united states
    ]
~~~

### Optional Props

| Prop             | Type    | Description |
| ---------------- | ------- | ----------- |
| size             | string  | The size of your map, either "sm", md", or "lg" |
| title            | string  | Any string for the title of your map |
| color            | string  | Color for highlighted countries. A standard color string. E.g. "red" or "#ff0000" |
| tooltipBgColor   | string  | Tooltip background color |
| tooltipTextColor | string  | Tooltip text color |
| valuePrefix      | string  | A string to prefix values in tooltips. E.g. "$" |
| valueSuffix      | string  | A string to suffix values in tooltips. E.g. "USD" |
| frame           | boolean | true/false for drawing a border around the map |
| frameColor      | string  | Frame color |
| borderColor      | string  | Border color around each individual country. "black" by default |

## License
MIT
