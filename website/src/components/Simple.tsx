import React from 'react';
import WorldMap from 'react-svg-worldmap';
import populationData from '../data/CountryData';

const data2 = [
  {country: 'cn', value: 9770.8}, // china
  {country: 'in', value: 2010.0}, // india
  {country: 'us', value: 62794.6}, // united states
  {country: 'id', value: 3893.6}, // indonesia
  {country: 'br', value: 8920.8}, // brazil
  {country: 'ng', value: 2028.2}, // nigeria
  {country: 'ru', value: 11288.9}, // russia
  {country: 'mx', value: 9673.4}, // mexico
];

function App(): JSX.Element {
  return (
    <div className="App">
      <div className="Main">
        <WorldMap
          color="red"
          tooltipBgColor={'blue'}
          title="Top 10 Populous Countries Small Map"
          valueSuffix="people"
          size="sm"
          data={populationData}
          frame={true}
        />
        <WorldMap
          color="green"
          tooltipBgColor={'purple'}
          title="Top 10 GDP per Capita Medium Map"
          valuePrefix="$"
          size="md"
          data={data2}
          frame={true}
        />
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
        <WorldMap
          color="green"
          tooltipBgColor={'purple'}
          title="Top 10 GDP per Capita Extra Large Map"
          valuePrefix="$"
          size="xl"
          data={data2}
          frame={true}
        />
        <WorldMap
          color="yellow"
          tooltipBgColor={'black'}
          title="Top 10 GDP per Capita Extra Extra Large Map"
          valuePrefix="$"
          size="xxl"
          data={data2}
          frame={true}
        />
        <WorldMap
          color="pink"
          tooltipBgColor={'black'}
          title="Top 10 GDP per Capita Responsive Map"
          valuePrefix="$"
          size="responsive"
          data={data2}
          frame={true}
        />
      </div>
      <div style={{position: 'fixed', bottom: 0, right: 10}}>
        <p>Scroll For</p>
        <p>More Sizes!</p>
      </div>
    </div>
  );
}

export default App;
