import React from 'react';
import { RadialGauge } from 'react-canvas-gauges';
import { ReactComponent as TempIcon } from '../assets/tempIcon.svg';

const Thermometer = ({engTemp}) => {
    const fillColor = engTemp > 105 ? 'red' : 'white'; // Cambia el color en función del nivel de combustible
    return (
    <div>
        <TempIcon style={{ fill: fillColor, width: '19px', height: '26px', position: 'absolute', marginLeft: '60px' }} />
        <RadialGauge
            units='°C'
            colorUnits={'#fff'}
            title='Temp'
            colorTitle={'#fff'}
            width={120}
            height={120}
            value={engTemp/210}
            minValue={0}
            maxValue={1}
            majorTicks={['C', '', 'H']}
            minorTicks={2}
            startAngle= {35}
            ticksAngle= {120}
            valueBox= {false}
            borders={false}
            strokeTicks={true}
            highlights={[{ from: 0.5, to: 1, color: "rgba(200, 50, 50, .75)" }]}
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
    
export default Thermometer;
