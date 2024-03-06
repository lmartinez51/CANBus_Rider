import React from 'react';
import { RadialGauge } from 'react-canvas-gauges';
import { ReactComponent as EngIcon } from '../assets/engIcon.svg';

const Tachometer = ({ revs, engLamp }) => {
    const fillColor = engLamp === 1 ? 'red' : 'black';// Cambia el color en función de engLamp

    return (
    <div style={{ position: 'relative' }}>
        <RadialGauge
            units='rpm'
            title='x1000 RPM'
            width={310}
            height={310}
            value={revs/1000}
            valueBox={true}
            valueText={revs}
            valueBoxStroke={10}
            colorValueBoxRect={'black'}
            colorValueBoxRectEnd={'black'}
            colorValueBoxBackground={'black'}
            colorValueText={'#0066FF'}
            colorValueTextShadow={'#0000FF'}
            fontValue={'DSEG7 Classic'}
            fontValueSize={25}
            valueInt={3}
            valueDec={0}
            minValue={0}
            maxValue={8}
            majorTicks={['0', '1', '2', '3', '4', '5', '6', '7', '8']}
            minorTicks={5}
            borders={false}
            strokeTicks={true}
            highlights={[
                { from: 0, to: 6, color: "#284DF1" },
                { from: 6, to: 8, color: "rgba(255, 0, 0, 0.8)" }]}
            colorPlate={'black'}
            borderOuterWidth={2}
            colorBorderOuter={'#0000FF'}
            borderInnerWidth={2}
            colorBorderInner={'#0000FF'}
            colorNumbers={'#eee'}
            colorMajorTicks={'#fff'}
            colorMinorTicks={'#ddd'}
            colorTitle={'#fff'}
            colorUnits={'#fff'}
            borderShadowWidth={0}
            needleType={'arrow'}
            colorNeedleStart={'rgba(237,50,50, 1)'}
            colorNeedleEnd={'rgba(255, 22, 22, .9)'}
            needleWidth={3}
            needleCircleSize={7}
            needleCircleOuter={true}
            needleCircleInner={false}
            animationDuration={1500}
            animationRule={'linear'}
            fontNumbersSize={30}
        />
        <EngIcon style={{ fill: fillColor, width: '60px', height: '94px', position: 'absolute', top: '60%', left: '72%', transform: 'translate(-50%, -50%)' }} />
    </div>
    );
};

export default Tachometer;
