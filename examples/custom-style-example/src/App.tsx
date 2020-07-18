import React from "react"
import "./App.css"
import { WorldMap } from "react-svg-worldmap"

function App() {
  const data =
    [
      { "country": "cn", value: 5 }, // china
      { "country": "us", value: 100 },  // united states
      { "country": "ru", value: 29 },  // russia
    ]
    
  const stylingFunction = (context : ICountryContext) => {
    const opacityLevel = 0.4 + (0.2 * (context.countryValue - context.minValue) / (context.maxValue - context.minValue))
    return { fill: context.country === "UnitedStates" ? "blue" : context.color, fillOpacity: opacityLevel, stroke: "green", strokeWidth: 1, strokeOpacity: 0.2, cursor: "pointer" }
  }

  return (
    < div className="App" >
      < div className="Main">
        <table>
          <tbody>
            <tr>
              <td>
                <WorldMap color={"red"} tooltipBgColor={"#D3D3D3"} title="Custom Style Test" valueSuffix="points" size="lg" data={data} frame={true} styleFunction={stylingFunction}/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
