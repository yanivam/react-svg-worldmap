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
  const getHref = (countryName: string) =>
    `https://en.wikipedia.org/wiki/${countryName.replace(/\s/g, '%20')}`;

  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      size="xl"
      data={data}
      hrefFunction={getHref}
    />
  );
}

export default App;
