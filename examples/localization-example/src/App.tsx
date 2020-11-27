import React from "react"
import "./App.css"
import { WorldMap } from "react-svg-worldmap"

function App() {
  const data1 =
    [
      { "country": "cn", spanishTranslation: "China", value: 1389618778 }, // china
      { "country": "in", spanishTranslation: "India", value: 1311559204 }, // india
      { "country": "us", spanishTranslation: "Estados Unidos", value: 331883986 },  // united states
      { "country": "id", spanishTranslation: "Indonesia", value: 264935824 },  // indonesia
      { "country": "br", spanishTranslation: "Brasil", value: 210301591 },  // brazil
      { "country": "ng", spanishTranslation: "Nigeria", value: 208679114 },  // nigeria
      { "country": "ru", spanishTranslation: "Rusia", value: 141944641 },  // russia
      { "country": "mx", spanishTranslation: "México", value: 127318112 }   // mexico
    ]

  const data2 =
    [
      { "country": "cn", spanishTranslation: "China", value: 8202.15 }, // china
      { "country": "in", spanishTranslation: "India", value: 1687.30 }, // india
      { "country": "us", spanishTranslation: "Estados Unidos", value: 52713.24 },  // united states
      { "country": "id", spanishTranslation: "Indonesia", value: 3268.50 },  // indonesia
      { "country": "br", spanishTranslation: "Brasil", value: 7488.61 },  // brazil
      { "country": "ng", spanishTranslation: "Nigeria", value: 1702.58 },  // nigeria
      { "country": "ru", spanishTranslation: "Rusia", value: 9476.52 },  // russia
      { "country": "mx", spanishTranslation: "México", value: 8120.38 }   // mexico
    ]

  const addSuffix = (num: number, digits: number) =>{
      var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: " miles " },
        { value: 1E6, symbol: " millónes " },
        { value: 1E9, symbol: " mil millones " }
      ];
      var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var i;
      for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
          break;
        }
      }
      return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }

  const localizationFunction = (countryName: string, isoCode: string, value: string, prefix?: string, suffix?: string) => {
    let spanishTranlation = ""
    for(const row of data2) {
      if(row.country === isoCode.toLocaleLowerCase()) {
        spanishTranlation = row.spanishTranslation
      }
    }
    if(spanishTranlation !== "") {
      const numberValue = parseInt(value, 10)
      spanishTranlation += prefix ? ": " + prefix + "" + value.slice(0, 1) + "," + value.slice(1) : suffix ? ": " + addSuffix(numberValue, 2) + suffix: value
    }
    return spanishTranlation
  }

  return (
    < div className="App" >
      < div className="Main">
        <table>
          <tbody>
            <tr>
              <td>
                <WorldMap color="red" tooltipBgColor={"blue"} title="Los diez países principales por población" valueSuffix="personas" size="sm" data={data1} frame={true} customTooltipTextFunction={localizationFunction}/>
              </td>
              <td>
                <WorldMap color="green" tooltipBgColor={"purple"} title="Los diez países principales por PIB per cápita" valuePrefix="€" size="md" data={data2} frame={true} customTooltipTextFunction={localizationFunction}/>
              </td>
            </tr>
            <tr>
              <td>
                <WorldMap color="red" tooltipBgColor={"blue"} title="Los diez países principales por población" borderColor={"blue"} frameColor={"pink"} valueSuffix="personas" size="lg" data={data1} frame={true} customTooltipTextFunction={localizationFunction}/>
              </td>
              <td>
                <WorldMap color="green" tooltipBgColor={"purple"} title="Los diez países principales por PIB per cápita" valuePrefix="€" size="xl" data={data2} frame={true} customTooltipTextFunction={localizationFunction}/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
