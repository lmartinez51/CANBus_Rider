import React from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import "./ECUsDiagram.css"
import iconCPU from './assets/cpu.png'

export default function ECUsDiagram({ coolantTemp, revs, speed, fuel}) {

  const nodeDataArray = [
    { key: 'CPU', source: iconCPU, movable: false, isReadOnly: true, loc: "610 280"},
    { key: 'coolantTemp', text: `Temp: `, value: `${coolantTemp} °C`, movable: false, parent: 'CPU', loc: "380 372"},
    { key: 'revs', text: `Engine: `, value: `${revs} RPM`, movable: false, parent: 'CPU', loc: "420 290"},
    { key: 'speed', text: `Speed: `, value: `${speed} Km/h`, movable: false, parent: 'CPU', loc: "504 425"},
    { key: 'fuel', text: `Fuel: `, value: `${fuel} %`, movable: false, parent: 'CPU', loc: "1265 280"}
  ];

  function handleModelChange(changes) {
    // Aquí podrías manejar los cambios en el modelo del diagrama
    // Por ejemplo, podrías actualizar el estado del diagrama o enviar los cambios a tu backend
  }

  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      'initialContentAlignment': new go.Spot(0.53, 0.7), //new go.Spot(0.35, 0.5),
      'undoManager.isEnabled': true,
      'allowVerticalScroll': false,
      'allowHorizontalScroll': false,
      model: $(go.TreeModel)
    });

    diagram.nodeTemplate =
        $(go.Node, 'Auto',
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('movable', 'movable'),
        new go.Binding('isReadOnly', 'isReadOnly'), 
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 1, fill: 'white' }),
        $(go.Picture, { margin: 3, width: 24, height: 24, background: 'white'}, new go.Binding('source')),
        //$(go.TextBlock, { margin: 8, stroke: 'red' }, new go.Binding('text')),
        $(go.Panel, "Horizontal",
        $(go.TextBlock, { margin: 8 }, new go.Binding('text')),
        $(go.TextBlock, { margin: 8, stroke: 'blue', font: 'bold 12px sans-serif' }, new go.Binding('text', 'value'))
      )

      );

    diagram.linkTemplate =
    $(go.Link,
        $(go.Shape, { strokeWidth: 1, stroke: 'black' })  // Define el grosor y el color de la línea
    );

  return diagram;
  }

  return (
    <ReactDiagram
      initDiagram={initDiagram}
      divClassName='diagram-component'
      nodeDataArray={nodeDataArray}
      onModelChange={handleModelChange}
      style={{ border: 'none' }}
    />
  );
}
