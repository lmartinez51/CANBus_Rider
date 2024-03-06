import React, { useEffect } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import "./SimpleDiagram.css"

function SimpleDiagram() {
//   const [nodeDataArray, setNodeDataArray] = useState([
//     { key: '1', name: 'Node 1', source: 'cat1.png' },
//     { key: '2', parent: '1', name: 'Node 2', source: 'cat2.png' },
//     // Agrega más nodos aquí
//   ]);

  const nodeDataArray = [
    { key: 'CPU', text: 'CPU', movable: false, isReadOnly: true},
    { key: 'vin', text: 'VIN: 0', parent: 'CPU' },
    { key: 'coolantTemp', text: 'Coolant Temperature: 0', parent: 'CPU' },
    // Agrega más nodos aquí
  ];

//   const linkDataArray = [
//     { from: 'vin', to: 'coolantTemp' },
//     // Agrega más enlaces aquí
//   ];


  useEffect(() => {
    // Aquí podrías cargar los datos del diagrama desde tu backend
    // Por ahora, dejaremos los datos de prueba que definimos arriba
  }, []);

  function handleModelChange(changes) {
    // Aquí podrías manejar los cambios en el modelo del diagrama
    // Por ejemplo, podrías actualizar el estado del diagrama o enviar los cambios a tu backend
  }

  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      'initialContentAlignment': go.Spot.Center,
      'undoManager.isEnabled': true,
      model: $(go.TreeModel)
    });

    diagram.nodeTemplate =
        $(go.Node, 'Auto',
        new go.Binding('movable', 'movable'),
        new go.Binding('isReadOnly', 'isReadOnly'), 
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 0, fill: 'white' }),
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
    />
  );
}

export default SimpleDiagram;
