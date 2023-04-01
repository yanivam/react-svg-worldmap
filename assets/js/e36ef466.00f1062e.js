"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[581],{8922:(e,t,n)=>{n.d(t,{B:()=>a,t:()=>u});const a=[{country:"cn",value:1389618778},{country:"in",value:1311559204},{country:"us",value:331883986},{country:"id",value:264935824},{country:"br",value:210301591},{country:"ng",value:208679114},{country:"ru",value:141944641},{country:"mx",value:127318112}],u=[{country:"cn",value:9770.8},{country:"in",value:2010},{country:"us",value:62794.6},{country:"id",value:3893.6},{country:"br",value:8920.8},{country:"ng",value:2028.2},{country:"ru",value:11288.9},{country:"mx",value:9673.4}]},9540:(e,t,n)=>{n.r(t),n.d(t,{default:()=>d});var a=n(7378),u=n(8788),l=n(6538),r=n(5646),o=n(8922);function c(e,t){if(void 0===e)return"";const n=[{value:1e9,text:" billion "},{value:1e6,text:" million "},{value:1e3,text:" thousand "},{value:1,text:""}].find((t=>e>=t.value));return n?(e/n.value).toFixed(t).replace(/\.0+$|(?<number>\.[0-9]*[1-9])0+$/,"$1")+n.text:""}function i(){const[e,t]=(0,a.useState)({cName:"Select Country",iso:"",val:""}),n=a.useCallback((e=>{let{countryName:n,countryCode:a,countryValue:u}=e;t({cName:n,iso:a,val:c(u,2)})}),[]);return a.createElement(a.Fragment,null,a.createElement(r.ZP,{title:"The ten highest GDP per capita countries",data:o.B,onClickFunction:n}),a.createElement("ul",null,a.createElement("li",null,"Country: ",e.cName),a.createElement("li",null,"ISO Code: ",e.iso),a.createElement("li",null,"GDP per capita: ",e.val)))}const m='import * as React from "react";\nimport { useState } from "react";\nimport type { CountryContext } from "react-svg-worldmap";\nimport WorldMap from "react-svg-worldmap";\nimport { populationData } from "../data/CountryData";\n\n// E.g. format the number 1000000 to "1 thousand"\nfunction formattedNumber(num: number | undefined, digits: number) {\n  if (typeof num === "undefined") return "";\n  const magnitude = [\n    { value: 1e9, text: " billion " },\n    { value: 1e6, text: " million " },\n    { value: 1e3, text: " thousand " },\n    { value: 1, text: "" },\n  ].find((magnitude) => num >= magnitude.value);\n  if (magnitude) {\n    return (\n      (num / magnitude.value)\n        .toFixed(digits)\n        .replace(/\\.0+$|(?<number>\\.[0-9]*[1-9])0+$/, "$1") + magnitude.text\n    );\n  }\n  return "";\n}\n\nexport default function App(): JSX.Element {\n  const [state, setState] = useState({\n    cName: "Select Country",\n    iso: "",\n    val: "",\n  });\n\n  const clickAction = React.useCallback(\n    ({ countryName, countryCode, countryValue }: CountryContext) => {\n      setState({\n        cName: countryName,\n        iso: countryCode,\n        val: formattedNumber(countryValue, 2),\n      });\n    },\n    [],\n  );\n\n  return (\n    <>\n      <WorldMap\n        title="The ten highest GDP per capita countries"\n        data={populationData}\n        onClickFunction={clickAction}\n      />\n      <ul>\n        <li>Country: {state.cName}</li>\n        <li>ISO Code: {state.iso}</li>\n        <li>GDP per capita: {state.val}</li>\n      </ul>\n    </>\n  );\n}\n';var s=n(2496);function d(){return a.createElement(u.Z,{title:"Onclick action example"},a.createElement("div",{className:s.Z.main},a.createElement(i,null),a.createElement("div",{className:s.Z.code},a.createElement(l.Z,{className:"language-tsx"},m))))}}}]);