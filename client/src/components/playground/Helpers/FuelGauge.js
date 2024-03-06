import React from 'react';
import { RadialGauge } from 'react-canvas-gauges';
import { ReactComponent as GasIcon } from '../assets/gasIcon.svg';

const FuelGauge = ({fuel}) => {
    const fillColor = fuel > 25 ? 'white' : (fuel > 10 ? '#FFBF00' : 'red'); // Cambia el color en función del nivel de combustible

  return (
    <div>
      <GasIcon style={{ fill: fillColor, width: '24px', height: '24px', position: 'absolute', marginLeft: '35px' }} />
      <RadialGauge
        title='Fuel'
        colorTitle={'#fff'}
        width={120}
        height={120}
        value={1 - (fuel / 100)}
        minValue={0}
        maxValue={1}
        majorTicks={['F', '1/2', 'E']}
        minorTicks={4}
        startAngle= {205}
        ticksAngle= {120}
        valueBox= {false}
        borders={false}
        strokeTicks={true}
        highlights={[{ from: 0.875, to: 1, color: "rgba(200, 50, 50, .75)" }]}
        colorPlate={'rgba(0,0,0,0)'}
        colorNumbers={'#fff'}
        colorMajorTicks={'#fff'}
        colorMinorTicks={'#fff'}
        borderShadowWidth={0}
        colorNeedleStart={'rgba(237,50,50, 1)'}
        colorNeedleEnd={'rgba(255, 22, 22, .9)'}
        needleType={'arrow'}
        needleWidth={3}
        needleCircleSize={7}
        needleCircleOuter={true}
        needleCircleInner={false}
        animationDuration={1500}
        animationRule={'linear'}
        fontNumbersSize={30}
      />
    </div>
  );
};

export default FuelGauge;
