import React from 'react';
import WorldMap from 'react-svg-worldmap';
import data from '../data/CountryData';

const getHref = (countryName: string) =>
  `https://en.wikipedia.org/wiki/${countryName.replace(/\s/g, '%20')}`;

function App(): JSX.Element {
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
