import React from 'react';
import WorldMap, {CountryContext} from 'react-svg-worldmap';

const data = [
  {country: 'cn', value: 5}, // china
  {country: 'us', value: 10}, // united states
  {country: 'ru', value: 7}, // russia
];

const stylingFunction = ({
  countryValue,
  minValue,
  maxValue,
  country,
  color,
}: CountryContext) => {
  const opacityLevel =
    0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue);
  return {
    fill: country === 'US' ? 'blue' : color,
    fillOpacity: opacityLevel,
    stroke: 'green',
    strokeWidth: 1,
    strokeOpacity: 0.2,
    cursor: 'pointer',
  };
};

function App(): JSX.Element {
  return (
    <WorldMap
      color={'red'}
      tooltipBgColor={'#D3D3D3'}
      title="Custom Styles Map"
      valueSuffix="points"
      size="lg"
      data={data}
      frame={true}
      styleFunction={stylingFunction}
    />
  );
}

export default App;
