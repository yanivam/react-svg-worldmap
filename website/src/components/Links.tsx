import React from 'react';
import WorldMap, {CountryContext} from 'react-svg-worldmap';
import {populationData} from '../data/CountryData';

const getHref = ({countryName}: CountryContext) => {
  return {
    href: `https://en.wikipedia.org/wiki/${countryName.replace(/\s/g, '%20')}`,
    target: '_blank',
  };
};

export default function App(): JSX.Element {
  return (
    <WorldMap
      title="The ten highest GDP per capita countries"
      data={populationData}
      hrefFunction={getHref}
    />
  );
}
