import React, { useRef, useEffect} from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import iconCPU from './assets/cpu.png';
import './ECUsDiagram.css';

// Function to determine the range from the given ECU value in decimal
function getRangeFromECU(ecuValueInDecimal) {
  if (isNaN(ecuValueInDecimal)) {
      throw new Error('Invalid input: ECU value must be a number')
  }

  if (ecuValueInDecimal < 0 || ecuValueInDecimal > 2047) {
      throw new Error('Invalid input: ECU value out of range (0-2047)')
  }

  return ecuValueInDecimal <= 511 ? '000-1FF' :
      ecuValueInDecimal <= 1023 ? '200-3FF' :
      ecuValueInDecimal <= 1535 ? '400-5FF' :
      '600-7FF';
}

function calculatePosition(ecu) {
  try {
    const ecuValueInDecimal = parseInt(ecu, 16) // Convert ECU to decimal
    const ecuRange = getRangeFromECU(ecuValueInDecimal) // Get the range

    const coordenatesPerRange = {
      '000-1FF': { x: -(ecuValueInDecimal), y: -(ecuValueInDecimal / 2) },
      '200-3FF': { x: (ecuValueInDecimal / 2), y: -(ecuValueInDecimal / 4) },
      '400-5FF': { x: -(ecuValueInDecimal / 3), y: (ecuValueInDecimal / 6) },
      '600-7FF': { x: (ecuValueInDecimal / 4), y: (ecuValueInDecimal / 8) },
      'Invalid': { x: 0, y: 0 }
    }

    return coordenatesPerRange[ecuRange]
  } catch (error) {
    console.error(error.message)
    return { x: 0, y: 0 }
  }
}

export default function ECUsDiagram({ data, onNodeSniff, onStopSniff}) {
  const diagramRef = useRef(null)

  // Function to handle changes in node data and update node color accordingly
  function handleNodeChange(ecu) {
    const diagram = diagramRef.current
    const model = diagram.model
    const nodeData = model.findNodeDataForKey(ecu)
    model.setDataProperty(nodeData, 'changeCount', nodeData.changeCount + 1)
    console.log(`El conteo actual de ${ecu} es: ${nodeData.changeCount}`)
    const node = diagram.findNodeForKey(ecu)
    if (node) {
        changeNodeColor(node, nodeData.changeCount)
    }
  }

  // Function to change the color of a node based on the change count
  function changeNodeColor(node, changeCount) {
      const shape = node.findObject("SHAPE")
      if (shape) {
          if (changeCount > 1 && changeCount < 200) {
              shape.fill = "limegreen"
          } else if (changeCount > 1000) {
              shape.fill = "red"
          }
      }
  }

  function initDiagram() {

    const $ = go.GraphObject.make
    const model = $(go.TreeModel)

    // listen for change in the payload
    model.addChangedListener(function(e) {
      if (e.change === go.ChangedEvent.Property && e.propertyName === 'value') {
        handleNodeChange(e.object.key)
      }
    })
    
    const diagram = $(go.Diagram, {
      'initialContentAlignment': new go.Spot(.5, .5),
      'undoManager.isEnabled': true,
      'allowVerticalScroll': false,
      'allowHorizontalScroll': false,
      model: model,
    })
        
    // This is the actual HTML context menu:
    var cxElement = document.getElementById("contextMenu");

    // an HTMLInfo object is needed to invoke the code to set up the HTML cxElement
    var myContextMenu = $(go.HTMLInfo, {
      show: showContextMenu,
      hide: hideContextMenu
    });

    diagram.nodeTemplate =
    $(go.Node, 'Auto',
      { contextMenu: myContextMenu },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding('movable', 'movable'),
      new go.Binding('isReadOnly', 'isReadOnly'),
      $(go.Shape, 'RoundedRectangle', { name: 'SHAPE', strokeWidth: 1, stroke: 'black' },
          new go.Binding('fill', 'color')
        ),
      $(go.Panel, 'Horizontal',
        $(go.Picture,
          new go.Binding('source'),
          new go.Binding('visible', 'key', function(k) { return k === 'ECU'; }),
          { margin: new go.Margin(0, 2, 0, 2), width: 24, height: 24, imageAlignment: go.Spot.Left }
        ),
        $(go.TextBlock,
          new go.Binding('text', 'text'),
          new go.Binding('visible', 'key', function(k) { return k !== 'ECU'; }),
          { margin: new go.Margin(6, 6, 3, 6), stroke: 'black', font: 'bold 12px sans-serif' }
        ),
        $(go.TextBlock,
          new go.Binding('text', 'value'),
          new go.Binding('visible', 'key', function(k) { return k !== 'ECU'; }),
          { margin: new go.Margin(6, 6, 3, 6), stroke: 'blue', font: 'bold 12px sans-serif' }
        )
      ), 
    )

    diagram.contextMenu = myContextMenu;
    // We don't want the div acting as a context menu to have a (browser) context menu!
    cxElement.addEventListener("contextmenu", e => {
      e.preventDefault();
      return false;
    }, false);

    function showContextMenu(obj, diagram, tool) {
      var cmd = diagram.commandHandler;
      var hasMenuItem = false;
      function maybeShowItem(elt, pred) {
        if (pred) {
          elt.style.display = "block";
          hasMenuItem = true;
        } else {
          elt.style.display = "none";
        }
      }
      maybeShowItem(document.getElementById("selectAll"), cmd.canSelectAll())
      maybeShowItem(document.getElementById("delete"), cmd.canDeleteSelection())
      maybeShowItem(document.getElementById("sniff"), obj != null)
      maybeShowItem(document.getElementById("stop"), obj != null)
      
      // Now show the whole context menu element
      if (hasMenuItem) {
        cxElement.style.display = "block";
        // we don't bother overriding positionContextMenu, we just do it here:
        var mousePt = diagram.lastInput.viewPoint;
        cxElement.style.left = mousePt.x + 5 + "px";
        cxElement.style.top = mousePt.y + "px";
      }
    }

    function hideContextMenu() {
      cxElement.style.display = "none";
    }
    
    // // This is the general menu command handler, parameterized by the name of the command.
    function cxcommand(event, val) {
      if (val === undefined) val = event.currentTarget.id;
      var diagramM = diagram;
      switch (val) {
        case "selectAll": diagramM.commandHandler.selectAll(); break;
        case "delete": diagramM.commandHandler.deleteSelection(); break;
        case "sniff": {handleNodeSniffContextMenu(diagram); break;}
        default: break;
      }
      diagramM.currentTool.stopTool();
    }

    document.getElementById('selectAll').addEventListener('click', function() {
      cxcommand(null, 'selectAll');
    });
    document.getElementById('delete').addEventListener('click', function() {
      cxcommand(null, 'delete');
    });
    document.getElementById('sniff').addEventListener('click', function() {
      cxcommand(null, 'sniff');
    });

    diagram.linkTemplate =
      $(go.Link,
        $(go.Shape, { strokeWidth: 1, stroke: 'black' })
      )

    // Nodo inicial al modelo del diagrama
    model.addNodeData({
      key: 'ECU',
      source: iconCPU,
      hasImage: true,
      movable: false,
      isReadOnly: true,
      loc: '0 0',
      color: "white"
    })

    diagramRef.current = diagram
    return diagram
  }

  useEffect(() => {
    const diagram = diagramRef.current;
    if (diagram && data && data.length) {
      const model = diagram.model
      data.forEach(({ ecu, payload }) => {
        let existingNodeData = model.findNodeDataForKey(ecu)
        if (!existingNodeData) {
          const nodeData = {
            key: ecu,
            text: ecu,
            value: payload,
            movable: true,
            isReadOnly: false,
            parent: 'ECU',
            loc: go.Point.stringify(calculatePosition(ecu)),
            color: "white",
            changeCount: 1, // Inicializamos el contador de cambios en 0
          }
          model.addNodeData(nodeData)
        } else  if (payload && existingNodeData.value !== payload) {
            model.setDataProperty(existingNodeData, 'value', payload) // Actualizamos el payload en el modelo.
        }
      })
    }
  }, [data])

  function handleNodeSniffContextMenu(diagram) {
    diagram.startTransaction('change color');
    diagram.selection.each((selectedNode) => {
      if (selectedNode instanceof go.Node) {
        // ignore any selected Links and simple Parts
        // Examine and modify the data, not the Node directly.
        const data = selectedNode.data;
        onNodeSniff(data.key);
        // Call setDataProperty to support undo/redo as well as
        // automatically evaluating any relevant bindings.
        diagram.model.setDataProperty(data, 'color', "limegreen");
  
        // Change the color of all other nodes to '#666666'
        diagram.nodes.each((node) => {
          if (node !== selectedNode) {
            diagram.model.setDataProperty(node.data, 'color', '#666666');
            node.pickable = false; 
          }
        });
      }
    });
    diagram.commitTransaction('change color');
  }
  
  return (
    <div id="myDiagram" style={{ position: 'absolute', height: '680px', width: '1600px', margin: '10px', zIndex: 2}}>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName='diagram-ECU-component'
        style={{ border: 'none' }}
        //onContextMenu={(node) => handleNodeSniffContextMenu(node)}
      />
      <div id="contextMenu" style={{ display: 'none', position: 'absolute' }}>
        <button id="sniff">Sniff</button>
        <button id="stop" onClick={() => {
          onStopSniff()
            .then(() => {
              const model = diagramRef.current.model
              model.startTransaction("change color")
              // Cambia el color de todos los nodos a blanco
              diagramRef.current.nodes.each(function(node) {
                model.setDataProperty(node.data, 'color', 'white')
                node.pickable = true;
              });
              model.commitTransaction("change color")
            })
            .catch(error => {
              console.error('There was an error while trying to stop the sniffer.', error)
            })
          }}>Stop
        </button>
        <button id="selectAll">Select All</button>
        <button id="delete">Delete</button>
      </div>
    </div>
  );  
}
