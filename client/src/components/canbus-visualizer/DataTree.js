// DataTree.js
import React, { useEffect, useRef, useState } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import "./DataTree.css"

function initDiagram() {
  const $ = go.GraphObject.make;
  const diagram = $(go.Diagram, {
    'undoManager.isEnabled': true,
    model: $(go.TreeModel)
  });

  diagram.nodeTemplate =
    $(go.Node, 'Auto',
      $(go.Shape, 'RoundedRectangle', { strokeWidth: 0, fill: 'white' }),
      $(go.TextBlock, { margin: 8 }, new go.Binding('text'))
    );

  return diagram;
}

export default function DataTree() {
  const myDiagram = useRef();
  const [update, setUpdate] = useState(0); // agrega esta línea

  useEffect(() => {
    const nodeDataArray = [
      { key: 'vin', text: 'VIN: 0' },
      { key: 'coolantTemp', text: 'Coolant Temperature: 0', parent: 'vin' },
      // Agrega más nodos aquí
    ];
    myDiagram.current.model = new go.TreeModel(nodeDataArray);
    setUpdate(prevUpdate => prevUpdate + 1);
  }, []);

  return (
    <ReactDiagram
      initDiagram={initDiagram}
      divClassName='diagram-component'
      ref={myDiagram}
      key={update} // agrega esta línea
    />
  );
}
