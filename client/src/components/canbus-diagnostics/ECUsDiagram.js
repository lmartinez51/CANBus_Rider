import React from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react'
import "./ECUsDiagram.css"
import iconCPU from './assets/cpu.png'
import iconBattery from './assets/battery.png'

export default function ECUsDiagram({ coolantTemp, revs, speed, fuel, voltage}) {

  const nodeDataArray = [
    { key: 'CPU', source: iconCPU, hasImage: true, movable: false, isReadOnly: true, loc: "570 325"},
    { key: 'coolantTemp', hasImage: false, text: `Temp:`, value: `${coolantTemp} °C`, movable: false, parent: 'CPU', loc: "370 420"},
    { key: 'revs', hasImage: false, text: `Engine:`, value: `${revs} RPM`, movable: false, parent: 'CPU', loc: "428 325"},
    { key: 'speed', hasImage: false, text: `Speed:`, value: `${speed} Km/h`, movable: false, parent: 'CPU', loc: "510 475"},
    { key: 'fuel', hasImage: false, text: `Fuel:`, value: `${fuel} %`, movable: false, parent: 'CPU', loc: "1265 325"},
    { key: 'voltage', source: iconBattery, hasImage: true, value: `${voltage}`, parent: 'CPU', loc: "610 360"},
  ]

  function handleModelChange(changes) {
    // Aquí podrías manejar los cambios en el modelo del diagrama
    // Por ejemplo, podrías actualizar el estado del diagrama o enviar los cambios a tu backend
  }

  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      'initialContentAlignment': new go.Spot(0.53, 0.82), //new go.Spot(0.35, 0.5),
      'undoManager.isEnabled': true,
      'allowVerticalScroll': false,
      'allowHorizontalScroll': false,
      model: $(go.TreeModel)
    })

    diagram.nodeTemplate =
      $(go.Node, 'Auto',
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('movable', 'movable'),
        new go.Binding('isReadOnly', 'isReadOnly'), 
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 1, stroke: 'black', fill: 'white' }),
        $(go.Panel, "Horizontal",
        // Usa una función de enlace para determinar si se debe mostrar la imagen
        $(go.Picture, 
            new go.Binding('source'),
            new go.Binding('visible', 'key', function(k) { return k === 'CPU' || k === 'voltage'; }),
            { margin: new go.Margin(0, 2, 0, 2), width: 24, height: 24, imageAlignment: go.Spot.Left}
        ),
        // Usa una función de enlace para determinar si se deben mostrar los textos
        $(go.TextBlock, 
            new go.Binding('text'),
            new go.Binding('visible', 'key', function(k) { return k !== 'CPU' && k !== 'voltage'; }),
            { margin: new go.Margin(6, 6, 3, 6), stroke: 'black'}
        ),
        $(go.TextBlock, 
            new go.Binding('text', 'value'),
            new go.Binding('visible', 'key', function(k) { return k !== 'CPU'; }),
            { margin: new go.Margin(6, 6, 3, 6), stroke: 'red', font: 'bold 12px sans-serif' }
        )
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
