import React, { useEffect, useState } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import "./ECUsDiagram.css"
import io from 'socket.io-client'

const ENDPOINT = 'http://localhost:8080/'

export default function ECUsDiagram() {
  const [coolantTemp, setCoolantTemp] = useState (0)
//   const [nodeDataArray, setNodeDataArray] = useState([
//     { key: '1', name: 'Node 1', source: 'cat1.png' },
//     { key: '2', parent: '1', name: 'Node 2', source: 'cat2.png' },
//     // Agrega más nodos aquí
//   ]);

  const nodeDataArray = [
    { key: 'CPU', text: 'CPU', movable: false, isReadOnly: true},
    { key: 'coolantTemp', text: `Coolant Temp: ${coolantTemp}`, parent: 'CPU' },
    // Agrega más nodos aquí
  ];

//   const linkDataArray = [
//     { from: 'vin', to: 'coolantTemp' },
//     // Agrega más enlaces aquí
//   ];


  useEffect(() => {
    // Aquí podrías cargar los datos del diagrama desde tu backend
    // Escuchar el evento del socket para actualizar los datos
    const socket = io(ENDPOINT, {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      },
      autoConnect: true,
      reconnection: true, // Habilitar la reconexión automática
      reconnectionAttempts: Infinity, // Número de intentos de reconexión
      reconnectionDelay: 1000, // Tiempo de espera antes de intentar la reconexión
    })

    socket.on('obdData', (data) => {
      setCoolantTemp(data.coolantTemp)
    });

    // Limpiar el evento del socket al desmontar el componente
    return () => {
      socket.off('obdData');
      socket.disconnect();
    };
  }, [])

  function handleModelChange(changes) {
    // Aquí podrías manejar los cambios en el modelo del diagrama
    // Por ejemplo, podrías actualizar el estado del diagrama o enviar los cambios a tu backend
  }

  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      'initialContentAlignment': new go.Spot(0.35, 0.5),
      'undoManager.isEnabled': true,
      'allowVerticalScroll': false,
      'allowHorizontalScroll': false,
      model: $(go.TreeModel)
    });

    diagram.nodeTemplate =
        $(go.Node, 'Auto',
        new go.Binding('movable', 'movable'),
        new go.Binding('isReadOnly', 'isReadOnly'), 
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 1, fill: 'white' }),
        $(go.TextBlock, { margin: 8 }, new go.Binding('text')),
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
