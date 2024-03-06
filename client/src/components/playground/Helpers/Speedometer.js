import React from 'react';
import { RadialGauge } from 'react-canvas-gauges';
import { ReactComponent as HazardIcon } from '../assets/hazardIcon.svg';

const Speedometer = ({ speed, distance, hazardLamp }) => {
    const fillColor = hazardLamp === 1 ? 'red' : 'black';// Cambia el color en función de engLamp
    console.log(`Hazard Value: ${hazardLamp}`)

    return (
    <div style={{ position: 'relative' }}>
      <RadialGauge
        units='km/h'
        width={310}
        height={310}
        marginRight={20}
        value={speed}
        minValue={0}
        maxValue={220}
        majorTicks={['0', '20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220']}
        minorTicks={2}
        borders={false}
        strokeTicks={true}
        highlights={[
          { from: 0, to: 180, color: "#284DF1" },
          { from: 180, to: 220, color: "rgba(255, 0, 0, .8)" }
        ]}
        colorPlate={'black'}
        borderOuterWidth={2}
        colorBorderOuter={'#0000FF'}
        borderInnerWidth={2}
        colorBorderInner={'#0000FF'}
        colorMajorTicks={'#fff'}
        colorMinorTicks={'#ddd'}
        colorTitle={'#fff'}
        colorUnits={'#fff'}
        colorNumbers={'#eee'}
        colorNeedleStart={'rgba(237,50,50, 1)'}
        colorNeedleEnd={'rgba(255, 22, 22, .9)'}
        valueBox={true}
        valueBoxStroke={10}
        colorValueBoxRect={'black'}
        colorValueBoxRectEnd={'black'}
        colorValueBoxBackground={'black'}
        colorValueText={'#0066FF'}
        colorValueTextShadow={'#0000FF'}
        fontValue={'DSEG7 Classic'}
        fontValueSize={25}
        valueText={distance}
        valueInt={3}
        valueDec={0}
        borderShadowWidth={0}
        needleType={'arrow'}
        needleWidth={3}
        needleCircleSize={7}
        needleCircleOuter={true}
        needleCircleInner={false}
        animation={true}
        animationDuration={500}
        animationRule={'bounce'}
        fontNumbersSize={30}
        animationValue={true}
        animateOnInit={true}
      />
        <HazardIcon style={{ fill: fillColor, width: '35px', height: '35px', position: 'absolute', top: '33%', left: '50%', transform: 'translate(-50%, -50%)' }} />
    </div>
    );
};
export default Speedometer;
