import React from 'react';
import WorldMap from 'react-svg-worldmap';
import {populationData} from '../../data/CountryData';

export default function App(): JSX.Element {
  return (
    <WorldMap
      color="red"
      tooltipBgColor={'blue'}
      title="Top 10 Populous Countries Large Map"
      borderColor={'blue'}
      frameColor={'pink'}
      valueSuffix="people"
      size="lg"
      data={populationData}
      frame={true}
    />
  );
}
