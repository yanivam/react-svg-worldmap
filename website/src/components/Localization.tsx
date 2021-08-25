import React from 'react';
import WorldMap from 'react-svg-worldmap';

function App(): JSX.Element {
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

  // spanish translation of country names
  const localizedCountryDictionary: Map<string, string> = new Map([
    ['br', 'Brasil'], // brazil
    ['cn', 'China'], // china
    ['id', 'Indonesia'], // indonesia
    ['in', 'India'], // india
    ['mx', 'México'], // mexico
    ['ng', 'Nigeria'], // nigeria
    ['ru', 'Rusia'], // russia
    ['us', 'Estados Unidos'], // united states
  ]);

  // Spanish number formating for thusdands, milions, and billions
  // E.g. translate the number 1000000 to "1 millónes"
  const localizedNumber = (num: number, digits: number) => {
    const si = [
      {value: 1, symbol: ''},
      {value: 1e3, symbol: ' miles '},
      {value: 1e6, symbol: ' millónes '},
      {value: 1e9, symbol: ' mil millónes '},
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

  // localization callback
  const localizationCallback = (
    countryName: string,
    isoCode: string,
    value: string,
    prefix?: string,
    suffix?: string,
  ) => {
    const localizedCountryName = localizedCountryDictionary.has(
      isoCode.toLocaleLowerCase(),
    )
      ? localizedCountryDictionary.get(isoCode.toLocaleLowerCase())
      : 'Unknown';
    const numberValue = parseInt(value, 10);
    const spanishTranlation =
      localizedCountryName +
      ': ' +
      (prefix ? prefix + ' ' : '') +
      localizedNumber(numberValue, 2) +
      (suffix ? suffix : '');
    return spanishTranlation;
  };

  return (
    <WorldMap
      title="Los diez países principales por población"
      size="xl"
      data={data}
      valueSuffix="personas"
      tooltipTextFunction={localizationCallback}
    />
  );
}

export default App;
