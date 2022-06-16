"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[581],{8922:function(n,e,t){t.d(e,{B:function(){return u},t:function(){return a}});var u=[{country:"cn",value:1389618778},{country:"in",value:1311559204},{country:"us",value:331883986},{country:"id",value:264935824},{country:"br",value:210301591},{country:"ng",value:208679114},{country:"ru",value:141944641},{country:"mx",value:127318112}],a=[{country:"cn",value:9770.8},{country:"in",value:2010},{country:"us",value:62794.6},{country:"id",value:3893.6},{country:"br",value:8920.8},{country:"ng",value:2028.2},{country:"ru",value:11288.9},{country:"mx",value:9673.4}]},9540:function(n,e,t){t.r(e),t.d(e,{default:function(){return v}});var u=t(7378),a=t(7582),l=t(8788),r=t(9616),o=t(1194),c=t(8922);function i(n,e){if(void 0===n)return"";for(var t=[{value:1,symbol:""},{value:1e3,symbol:" thousand "},{value:1e6,symbol:" million "},{value:1e9,symbol:" billion "}],u=(0,r.Z)(/\.0+$|(\.[0-9]*[1-9])0+$/,{number:1}),a=t.length-1;a>0;a--)if(n>=t[a].value)return(n/t[a].value).toFixed(e).replace(u,"$1")+t[a].symbol;return""}function m(){var n=(0,u.useState)({cName:"Select Country",iso:"",val:""}),e=n[0],t=n[1],a=u.useCallback((function(n){var e=n.countryName,u=n.countryCode,a=n.countryValue;t({cName:e,iso:u,val:i(a,2)})}),[]);return u.createElement(u.Fragment,null,u.createElement(o.Z,{title:"The ten highest GDP per capita countries",data:c.B,onClickFunction:a}),u.createElement("ul",null,u.createElement("li",null,"Country: ",e.cName),u.createElement("li",null,"ISO Code: ",e.iso),u.createElement("li",null,"GDP per capita: ",e.val)))}var s=t(2496);function v(){return u.createElement(a.Z,{title:"Onclick action example"},u.createElement("div",{className:s.Z.main},u.createElement(m,null),u.createElement("div",{className:s.Z.code},u.createElement(l.Z,{className:"language-tsx"},'import React, { useState } from "react";\nimport type { CountryContext } from "react-svg-worldmap";\nimport WorldMap from "react-svg-worldmap";\nimport { populationData } from "../data/CountryData";\n\n// E.g. format the number 1000000 to "1 thousand"\nfunction formattedNumber(num: number | undefined, digits: number) {\n  if (typeof num === "undefined") return "";\n  const si = [\n    { value: 1, symbol: "" },\n    { value: 1e3, symbol: " thousand " },\n    { value: 1e6, symbol: " million " },\n    { value: 1e9, symbol: " billion " },\n  ];\n  const rx = /\\.0+$|(?<number>\\.[0-9]*[1-9])0+$/;\n  for (let i = si.length - 1; i > 0; i--) {\n    if (num >= si[i]!.value) {\n      return (\n        (num / si[i]!.value).toFixed(digits).replace(rx, "$1") + si[i]!.symbol\n      );\n    }\n  }\n  return "";\n}\n\nexport default function App(): JSX.Element {\n  const [state, setState] = useState({\n    cName: "Select Country",\n    iso: "",\n    val: "",\n  });\n\n  const clickAction = React.useCallback(\n    ({ countryName, countryCode, countryValue }: CountryContext) => {\n      setState({\n        cName: countryName,\n        iso: countryCode,\n        val: formattedNumber(countryValue, 2),\n      });\n    },\n    [],\n  );\n\n  return (\n    <>\n      <WorldMap\n        title="The ten highest GDP per capita countries"\n        data={populationData}\n        onClickFunction={clickAction}\n      />\n      <ul>\n        <li>Country: {state.cName}</li>\n        <li>ISO Code: {state.iso}</li>\n        <li>GDP per capita: {state.val}</li>\n      </ul>\n    </>\n  );\n}\n'))))}}}]);