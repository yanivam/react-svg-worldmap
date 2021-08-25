import React from 'react';
import WorldMap, {CountryContext} from 'react-svg-worldmap';

function App(): JSX.Element {
  const data = [
    {country: 'cn', value: 5}, // china
    {country: 'us', value: 10}, // united states
    {country: 'ru', value: 7}, // russia
  ];

  const stylingFunction = (context: CountryContext) => {
    const opacityLevel =
      0.1 +
      (1.5 * (context.countryValue - context.minValue)) /
        (context.maxValue - context.minValue);
    return {
      fill: context.country === 'US' ? 'blue' : context.color,
      fillOpacity: opacityLevel,
      stroke: 'green',
      strokeWidth: 1,
      strokeOpacity: 0.2,
      cursor: 'pointer',
    };
  };

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
