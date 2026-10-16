import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import React, { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { useTable, useGlobalFilter, useSortBy } from 'react-table'
import Table from 'react-bootstrap/Table'
import {COLUMNS} from './Helpers/Columns'
import ContextValues from './Helpers/SignalContext'
import { MVECUs } from "./Helpers/MVECUs"
import "./Table.css"
import { GlobalFilter } from './Helpers/GlobalFilter'
import axios from 'axios'
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./Helpers/FileProcessingWorker'
const url = 'http://localhost:8080/upload'
const playUrl = 'http://localhost:8080/play'
let eventSource;  

export default function CANTable() {
  
  const [message, setMessage] = useState([])
  const [ecuState, setEcuState] = useState("")
  const [info, setInfo] = useState([])
  const [fileName, setFileName] = useState('')
  const [logFileName, setLogFileName] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })
  const contextMenuRef = useRef(null)
  const { setSignal } = useContext(ContextValues)
  const [lsb, setLsb] = useState('')
  const [scale, setScale] = useState('')
  const [offset, setOffset] = useState('')
  const [newValue, setNewValue] = useState('')
  const [result, setResult] = useState('')
  const [bitPosition, setBitPosition] = useState('')
  const worker = new Worker()

  // Modifica el nombre de la clase dependiendo del valor de ecuState
  let ecuClass = `ecuValue ${ecuState ? 'withValue' : 'withoutValue'}`;
  let hexValueClass = `hexValue ${result ? 'withValue' : 'withoutValue'}`;  
  let bitPosClass = `bitPosValue ${bitPosition ? 'withValue' : 'withoutValue'}`;

  /* Effect to terminate the File Processing Worker */
  useEffect(() => {
    // Cuando el componente se desmonte, termina el Web Worker
    return () => {
        worker.terminate()
    }
  // eslint-disable-next-line 
  }, [])

  /* Efect to handle the click of the mouse to close the Copy Row context menu */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        closeContextMenu()
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const hexValue = inverseCalculator(parseFloat(newValue), parseInt(lsb), parseFloat(scale), parseFloat(offset))
    const bitPosition = calculateBitPosition(parseInt(lsb))
    setResult(hexValue)
    setBitPosition(bitPosition)
  }
  
  const calculateBitPosition = (lsb) => {
    let lowerBound = Math.floor(lsb / 8) * 8
    let upperBound = lowerBound + 7
    return `${lowerBound}-${upperBound}`
  }

  const handleClear = () => {
    setLsb('')
    setScale('')
    setOffset('')
    setNewValue('')
    setResult('')
    setBitPosition('')
  }

  const inverseCalculator = (newValue, lsb, scale, offset) => {
    console.log(`New Value: ${newValue}`)
    console.log(`LSB: ${lsb}`)
    // Restar el offset y dividir por la escala
    let originalAfterShift = (newValue - offset) / scale
  
    // Realizar un desplazamiento de bits a la izquierda
    let original = originalAfterShift << (lsb % 8)
  
    // Convertir el resultado a hexadecimal
    let dataHex = original.toString(16).toUpperCase()
    console.log(`Hex Value: ${dataHex}`)
    // Asegúrate de que el resultado tenga al menos dos caracteres
    dataHex = dataHex.padStart(2, '0')
    console.log(`Hex Value: ${dataHex}`)
    return dataHex
  }
  
  const handleMessage = (ecu, values, dt1, dt2, dt3, dt4, dt5, dt6, dt7, dt8) => {
    // En caso de que se abren raw packets. Verificar si ecu y values son undefined. 
    if (ecu === undefined || values === undefined) {
      // Si alguno es undefined, terminar la ejecución de la función
      return;
    }
    setMessage([]);
    setEcuState(ecu); // Aquí se establece el valor de ECU
    console.log(`Valores: ${values}`)
    var signal='';
    var valueUnit = null;
    var value='';
    var unit='';
    var signalValue = null;
    var datos = values.replace('{','').replace('}','').split(", ");
    for(var i in datos){
      signalValue = datos[i].split(": ");
      signal = signalValue[0];
      valueUnit = signalValue[1].split(" ");
      value = valueUnit[0];
      unit = valueUnit[1];
      
      const parsedMessage = {
      Signal: signal,
      Value: value,
      Unit: unit,
      };
    
      setMessage((infodata) => [...infodata, parsedMessage]);
    }
  }

  const handleRightClick = (event, row) => {
    event.preventDefault()

    setSelectedRow(row)
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 })
  }

  const copyRow = () => {
    if (selectedRow) {
      const rowValues = Object.values(selectedRow.original)
      const formattedRowString = `${rowValues[0]} ${rowValues[1]} ${rowValues[2]}#${rowValues.slice(3).join('')}` 
      navigator.clipboard.writeText(formattedRowString)
        .then(() => {
          console.log('Row copied to clipboard');
          closeContextMenu(); // Close the context menu
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        })
    }
  }

  async function handleSavePackets () {
    var packet = ''
    info.map((x,y)=> (
      packet+=x.time+" "+x.can+" "+x.id+"#"+x.dt1+x.dt2+x.dt3+x.dt4+x.dt5+x.dt6+x.dt7+x.dt8+"\n"))
    const blob = new Blob([packet], {type:"text/plain"});
    const options = {
      suggestedName:'test.log',
      types: [
        {
          description: 'Log files',
          accept: {
            'text/plain': ['.log'],
          },
        },
      ],
      excludeAcceptAllOption: true,
    }
    try {
    const handle = await window.showSaveFilePicker(options);
    setFileName(handle.name);
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log("Packets file saved.");
    return handle;
    } catch (err) {
      console.error(err.name, err.message)
    }
  }

  function handlePlayTraffic () {
    eventSource = new EventSource(playUrl)
    //Reset table values
    setInfo([]);
    setMessage([]);
    eventSource.onmessage = (e) => {
      const parsedData = JSON.parse(e.data)
      setInfo((data) => [...data,parsedData])
    }
  };
  
  function handleStopTraffic () {
    eventSource.close(); 
    console.log("Connection closed");
  }

  /* Function to open raw log files - Optimized with the use of a worker */
  async function handleOpenPackets () {
    const options = {
      types: [
        {
          description: 'Log files',
          accept: {
            'text/plain': ['.log'],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    }
    try {
      const [fileHandle] = await window.showOpenFilePicker(options);
      setLogFileName(fileHandle.name)
      const fileName = fileHandle.name; // Almacena el nombre del archivo en una variable local
      // Reset table values
      setInfo([])
      setMessage([])
      setEcuState("")
      // Enviar el archivo al worker para su procesamiento
      const file = await fileHandle.getFile()
      worker.postMessage(file);

      // Send the file name to the backend only if it's available
      if (fileName) {
        // Send the file name to the backend
        console.log(`File Name: ${fileName}`) // Ahora debería imprimir el nombre del archivo
        const data = {params: {fileName: fileName}}
        axios.post(url, data).then((response) => {
          console.log(response.data.message) // Response from the backend to confirm the file name was received
        })
        .catch((error) => {
          console.log(error)
        })
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Escuchar mensajes del worker
  worker.addEventListener('message', (event) => {
    // Recibir los datos procesados del worker
    const parsedData = event.data;
    // Agregar los datos procesados al estado existente
    setInfo(info => [...info, ...parsedData]);
  })
    
  function handleReplayPackets () {
    //Reset table values
    setInfo([])
    setMessage([])
    const replayEventSource = new EventSource(playUrl)
    let data = [];
    replayEventSource.addEventListener('message', function(e) {
      const parsedData = JSON.parse(e.data)
      data = [...data, parsedData];
    })
    replayEventSource.addEventListener('close', function(e) {
      setInfo(data);
      replayEventSource.close();
      console.log("canplayer connection closed")
    })
    replayEventSource.addEventListener('error', function(e) {
      console.error("An error occurred: ", e);
    })
    return () => {
      console.log('Component unmounted. Event Source finished')
      replayEventSource.close()
    }
  }

  async function handleOpenPlay () {
    const options = {
      types: [
        {
          description: 'Log files',
          accept: {
            'text/plain': ['.log'],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    }
    try {
      const [fileHandle] = await window.showOpenFilePicker(options);
      setLogFileName(fileHandle.name)
      const fileName = fileHandle.name; // Almacena el nombre del archivo en una variable local
      // Reset table values
      setInfo([])
      setMessage([])
      setEcuState("")
      // Send the file name to the backend
      console.log(`File Name: ${fileName}`) // Ahora debería imprimir el nombre del archivo
      const data = {params: {fileName: fileName}}
      axios.post(url, data).then((response) => {
        console.log(response.data.message) // Response from the backend to confirm the file name was received
      })
      .catch((error) => {
        console.log(error)
      })
    } catch (err) {
      console.error(err);
    }
    const replayEventSource = new EventSource(playUrl)
    let data = [];
    replayEventSource.addEventListener('message', function(e) {
      const parsedData = JSON.parse(e.data)
      data = [...data, parsedData];
    })
    replayEventSource.addEventListener('close', function(e) {
      setInfo(data);
      replayEventSource.close();
      console.log("canplayer connection closed")
    })
    replayEventSource.addEventListener('error', function(e) {
      console.error("An error occurred: ", e);
    })
    return () => {
      console.log('Component unmounted. Event Source finished')
      replayEventSource.close()
    }
  }
  
  const data = useMemo(() => [...info], [info])
  const columns = useMemo(() => COLUMNS, [])

  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setInfo(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
  }
    
    // State and functions returned from useTable to build the UI
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      state,
      setGlobalFilter,
    } = useTable({
        columns,
        data,
        updateMyData,
        initialState: {
            hiddenColumns: ["values"],
        },
    }, useGlobalFilter, useSortBy);

    // Render the UI for the table
    return (
      <>
        {/* TABLE MENU */}
        <div className="packetDropdowns">
        <Navbar collapseOnSelect expand="lg" bg="transparent" variant="dark">
            <Navbar.Collapse>
              <div className="navigationBottomBar">
                <Nav>
                  <NavDropdown title="File" id="file-dropdown">
                    <NavDropdown.Item onClick={handleOpenPlay}>
                      Open Log File and Play
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={handleSavePackets}>
                      Save Log File
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Messages" id="packets-dropdown">
                    <NavDropdown.Item onClick={handleReplayPackets}>
                      Play & Decode
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Live Traffic">
                    <NavDropdown.Item onClick = {handlePlayTraffic}>
                      Start
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick = {handleStopTraffic}>
                      Stop
                    </NavDropdown.Item>
                  </NavDropdown>
                  <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter}/>
                </Nav>
              </div>
            </Navbar.Collapse>
        </Navbar>
        </div>
        {/* TABLE*/}
        <Table className="rawDataTable margins" striped bordered hover responsive variant = "dark" {...getTableProps()}>
            <thead className="headerHeight">
            {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="customRow">
                  <th width='40'>No.</th>
                  {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps)}>{column.render('Header')}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                  </th>
                ))}
                </tr>
            ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
                prepareRow(row)
                return (
                <tr key={i} className="rawrow" onClick = {() => handleMessage(row.original.ecu, row.original.values, row.original.dt1,
                row.original.dt2, row.original.dt3, row.original.dt4, row.original.dt5, row.original.dt6, row.original.dt7, row.original.dt8)} onContextMenu={(event) => handleRightClick(event, row)} {...row.getRowProps()}>
                  <td width='40'>{i+1}</td>
                    {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    })}
                </tr>
                )
            })}
            </tbody>
        </Table>
        {contextMenu.visible && (
          <div style={{ top: contextMenu.y, left: contextMenu.x }} ref={contextMenuRef} className="context-menu">
            <button onClick={copyRow}>Copy Row</button>
         </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '310px' }}>
          <div className="decodedTableContainer">
            <div className="decodedTitleContainer">
                <h5 className="tableTitle">Decoded Values</h5>
            </div>
            <Table className="decodedTable dtmargins" striped bordered hover responsive variant = "dark">
              <thead>
                <tr>
                  <th>Message</th>
                  <th className={ecuClass} colSpan={2}>{ecuState}</th>
                </tr>
                <tr>
                  <th>Signal</th>
                  <th>Values</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody className="tbodyHeight">
                  {message.map(({Signal, Value, Unit}, idx) => (
                    <tr key={idx} className= 'signals' onClick={() => setSignal(Signal)}>
                      <td>{Signal}</td>
                      <td>{Value}</td>
                      <td>{Unit}</td>
                    </tr>
                    ))}
              </tbody>
            </Table>
          </div>
          <form className="calcForm formMargin" onSubmit={handleSubmit}>
            <div className="titleContainer">
              <h5 className="tableTitle">BitWise Whisperer</h5>
              <h4 className="tableSubtitle"><span className="italicText">Selected Message: {ecuState}</span></h4>
            </div>
            <Table className="calcTable marginLeft"striped bordered hover responsive variant="dark">
              <thead className="customCalcHeader">
                <tr className="customCalcRow">
                  <th className="bitPosHeader">Bit Position</th>
                  <th className={bitPosClass}>{bitPosition}</th>
                  <th className="hexValueHeader">New Hex Val</th>
                  <th className={hexValueClass}>{result}</th>
                </tr>
                <tr>
                  <th className="lsb">LSB</th>
                  <th className="scale">Scale</th>
                  <th className="offset">Offset</th>
                  <th className="newValue">Expected Val</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input className="calcTableInput" aria-label="Least Significant Bit" value={lsb} onChange={e => setLsb(e.target.value)} /></td>
                  <td><input className="calcTableInput" aria-label="Scale" value={scale} onChange={e => setScale(e.target.value)} /></td>
                  <td><input className="calcTableInput" aria-label="Offset" value={offset} onChange={e => setOffset(e.target.value)} /></td>
                  <td><input className="calcTableInput" aria-label="Expected Value" value={newValue} onChange={e => setNewValue(e.target.value)} /></td>
                </tr>
              </tbody>
            </Table>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="calculate" type="submit">Calculate</button>
              <button className="clear" type="button" onClick={handleClear}>Clear</button>
            </div>  
          </form>
        </div>
  </>
  )
}