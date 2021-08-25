import React, {useState} from 'react';
import WorldMap from 'react-svg-worldmap';

function App(): JSX.Element {
  const [state, setState] = useState({
    cName: 'Select Country',
    iso: '',
    val: '',
    pre: '',
    suff: '',
  });

  // data array
  const data = [
    {country: 'cn', value: 1389618778}, // china
    {country: 'in', value: 1311559204}, // india
    {country: 'us', value: 331883986}, // united states
    {country: 'id', value: 264935824}, // indonesia
    {country: 'br', value: 210301591}, // brazil
    {country: 'ng', value: 208679114}, // nigeria
    {country: 'ru', value: 141944641}, // russia
    {country: 'mx', value: 127318112}, // mexico
  ];
  // E.g. format the number 1000000 to "1 thousand"
  const formattedNumber = (num: number, digits: number) => {
    const si = [
      {value: 1, symbol: ''},
      {value: 1e3, symbol: ' thousand '},
      {value: 1e6, symbol: ' million '},
      {value: 1e9, symbol: ' billion '},
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    for (let i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        return (
          (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
        );
      }
    }
  };

  const clickAction = (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    countryName: string,
    isoCode: string,
    value: string,
  ) => {
    const numberValue = parseInt(value, 10);
    const fNumber = formattedNumber(numberValue, 2);
    setState({
      cName: countryName,
      iso: isoCode,
      val: fNumber,
      pre: '',
      suff: '',
    });
  };

  return (
    <>
      <WorldMap
        title="The ten highest GDP per capita countries"
        size="xl"
        data={data}
        onClickFunction={clickAction}
      />
      <div>
        <p>Country: {state.cName}</p>
        <p>Iso Code: {state.iso}</p>
        <p>GDP per capita: {state.val}</p>
      </div>
    </>
  );
}

export default App;
