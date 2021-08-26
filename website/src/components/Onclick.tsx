import React, {useState} from 'react';
import WorldMap from 'react-svg-worldmap';
import {populationData} from '../data/CountryData';

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

export default function App(): JSX.Element {
  const [state, setState] = useState({
    cName: 'Select Country',
    iso: '',
    val: '',
    pre: '',
    suff: '',
  });

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
        size="lg"
        data={populationData}
        onClickFunction={clickAction}
      />
      <ul>
        <li>Country: {state.cName}</li>
        <li>ISO Code: {state.iso}</li>
        <li>GDP per capita: {state.val}</li>
      </ul>
    </>
  );
}
