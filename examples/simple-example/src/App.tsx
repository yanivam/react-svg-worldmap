import React from "react"
import "./App.css"
import { WorldMap } from "react-worldmap"

function App() {
  const data1 =
    [
      { "country": "cn", value: 1389618778 }, // china
      { "country": "in", value: 1311559204 }, // india
      { "country": "us", value: 331883986 },  // united states
      { "country": "id", value: 264935824 },  // indonesia
      { "country": "pk", value: 210797836 },  // pakistan
      { "country": "br", value: 210301591 },  // brazil
      { "country": "ng", value: 208679114 },  // nigeria
      { "country": "bd", value: 161062905 },  // bangladesh
      { "country": "ru", value: 141944641 },  // russia
      { "country": "mx", value: 127318112 }   // mexico
    ]

  const data2 =
    [
      { "country": "cn", value: 9770.8 }, // china
      { "country": "in", value: 2010.0 }, // india
      { "country": "us", value: 62794.6 },  // united states
      { "country": "id", value: 3893.6 },  // indonesia
      { "country": "pk", value: 1482.4 },  // pakistan
      { "country": "br", value: 8920.8 },  // brazil
      { "country": "ng", value: 2028.2 },  // nigeria
      { "country": "bd", value: 1698.3 },  // bangladesh
      { "country": "ru", value: 11288.9 },  // russia
      { "country": "mx", value: 9673.4 }   // mexico
    ]

  return (
    < div className="App" >
      < div className="Main">
        <table>
          <tbody>
            <tr>
              <td>
                <WorldMap color="red" title="Top 10 Populous Countries" value-suffix="people" size="lg" data={data1} />
              </td>
              <td>
                <WorldMap color="green" title="Top 10 GDP per Capita" value-prefix="$" size="lg" data={data2} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
