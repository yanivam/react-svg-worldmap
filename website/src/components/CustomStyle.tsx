import React from 'react';
import WorldMap, {CountryContext, Data} from 'react-svg-worldmap';

const data: Data = [
  {country: 'cn', value: 5}, // china
  {country: 'us', value: 10}, // united states
  {country: 'ru', value: 7}, // russia
];

const stylingFunction = ({
  countryValue,
  countryCode,
  minValue,
  maxValue,
  color,
}: CountryContext) => {
  const opacityLevel = countryValue
    ? 0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue)
    : 0;
  return {
    fill: countryCode === 'US' ? 'blue' : color,
    fillOpacity: opacityLevel,
    stroke: 'green',
    strokeWidth: 1,
    strokeOpacity: 0.2,
    cursor: 'pointer',
  };
};

export default function App(): JSX.Element {
  return (
    <WorldMap
      color={'red'}
      tooltipBgColor={'#D3D3D3'}
      title="Custom Styles Map"
      valueSuffix="points"
      data={data}
      frame={true}
      styleFunction={stylingFunction}
    />
  );
}
