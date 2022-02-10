"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[239],{3393:function(n,t,e){e.r(t),e.d(t,{default:function(){return y}});var o=e(7378),r=e(9131),a=e(9328),u=e(5646),l=e.n(u),c=[{country:"cn",value:5},{country:"us",value:10},{country:"ru",value:7}],i=function(n){var t=n.countryValue,e=n.countryCode,o=n.minValue,r=n.maxValue,a=n.color;return{fill:"US"===e?"blue":a,fillOpacity:t?.1+1.5*(t-o)/(r-o):0,stroke:"green",strokeWidth:1,strokeOpacity:.2,cursor:"pointer"}};function s(){return o.createElement(l(),{color:"red",tooltipBgColor:"#D3D3D3",title:"Custom Styles Map",valueSuffix:"points",data:c,frame:!0,styleFunction:i})}var m=e(2496);function y(){return o.createElement(r.Z,{title:"Custom styles example"},o.createElement("div",{className:m.Z.main},o.createElement(s,null),o.createElement("div",{className:m.Z.code},o.createElement(a.Z,{className:"language-tsx"},"import React from 'react';\nimport WorldMap, {CountryContext, Data} from 'react-svg-worldmap';\n\nconst data: Data = [\n  {country: 'cn', value: 5}, // china\n  {country: 'us', value: 10}, // united states\n  {country: 'ru', value: 7}, // russia\n];\n\nconst stylingFunction = ({\n  countryValue,\n  countryCode,\n  minValue,\n  maxValue,\n  color,\n}: CountryContext) => {\n  const opacityLevel = countryValue\n    ? 0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue)\n    : 0;\n  return {\n    fill: countryCode === 'US' ? 'blue' : color,\n    fillOpacity: opacityLevel,\n    stroke: 'green',\n    strokeWidth: 1,\n    strokeOpacity: 0.2,\n    cursor: 'pointer',\n  };\n};\n\nexport default function App(): JSX.Element {\n  return (\n    <WorldMap\n      color={'red'}\n      tooltipBgColor={'#D3D3D3'}\n      title=\"Custom Styles Map\"\n      valueSuffix=\"points\"\n      data={data}\n      frame={true}\n      styleFunction={stylingFunction}\n    />\n  );\n}\n"))))}}}]);