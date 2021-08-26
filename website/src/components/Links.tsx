import React from 'react';
import WorldMap from 'react-svg-worldmap';
import {populationData} from '../data/CountryData';

const getHref = (countryName: string) =>
  `https://en.wikipedia.org/wiki/${countryName.replace(/\s/g, '%20')}`;

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      size="lg"
      data={populationData}
      hrefFunction={getHref}
    />
  );
}
