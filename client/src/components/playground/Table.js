import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import { DropdownSubmenu, NavDropdownMenu} from "react-bootstrap-submenu";
import React, { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { useTable, useGlobalFilter, useSortBy } from 'react-table'
import Table from 'react-bootstrap/Table'
import { FixedSizeList as List } from 'react-window'
import {COLUMNS} from './Helpers/Columns'
import ContextValues from './Helpers/SignalContext'
import { MVECUs } from "./Helpers/MVECUs"
import "./Table.css"
import { GlobalFilter } from './Helpers/GlobalFilter'
import axios from 'axios'
const url = 'http://localhost:8080/upload'
const playUrl = 'http://localhost:8080/play'
const viewFileUrl = 'http://localhost:8080/viewFile'
let eventSource
const filterData = {
  'DashFilters': MVECUs,
  'NoFilters': ['0:0'],
  'EngineFilters': {} // Reemplazar esto con datos para 'EngineFilters' si se agregan mas ECUs despues
}

export default function CANTable() {
  
  const [message, setMessage] = useState([])
  const [ecuState, setEcuState] = useState("")
  const [info, setInfo] = useState([])
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
  const [filters, setFilters] = useState([])

  // Modifica el nombre de la clase dependiendo del valor de ecuState
  let ecuClass = `ecuValue ${ecuState ? 'withValue' : 'withoutValue'}`;
  let hexValueClass = `hexValue ${result ? 'withValue' : 'withoutValue'}`;  
  let bitPosClass = `bitPosValue ${bitPosition ? 'withValue' : 'withoutValue'}`;
  // Acceder a la descripción correspondiente en el objeto MVECUs
  const ecuDescription = MVECUs[ecuState]?.ecuDescription;

  useEffect(() => {
    if (!logFileName) {
      return; // No hacer nada si no hay archivo seleccionado.
    }
    let url;
    if (filters.length === 0) {
      url = viewFileUrl; // Usar viewFileUrl si no hay filtros
    } else {
      url = playUrl; // Usar playUrl si hay filtros
    }
  
    const playEventSource = new EventSource(url);
    let data = [];
  
    playEventSource.addEventListener('message', function(e) {
      const parsedData = JSON.parse(e.data);
      data = [...data, parsedData];
      setInfo(data);
    });
  
    playEventSource.addEventListener('close', function(e) {
      playEventSource.close();
      console.log("canplayer connection closed");
    });
  
    playEventSource.addEventListener('error', function(e) {
      console.error("An error occurred: ", e);
    });
  
    return () => {
      console.log('Component unmounted. Event Source finished');
      playEventSource.close();
    };
  }, [logFileName, filters]); // Dependencia en filters para re-crear el EventSource cuando cambien los filtros. 
  //Recordar que si tiene dependencias el useEffect se dispara cada que cambia el valor de esa dependencia en este caso el valor de 'filters'

  /* Effect to handle the click of the mouse to close the Copy Row context menu */
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

  /* HEX CALCULATOR SECTION */
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

  // Helper function to clear values
  const handleClear = () => {
    setLsb('')
    setScale('')
    setOffset('')
    setNewValue('')
    setResult('')
    setBitPosition('')
  }

  // Function to caculate hex values
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
  
  /* TABLES SECTION */
  // Helper function to display decoded messages
  const handleMessage = (ecu, values) => {
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

  // Helper function to handle the mouse rigth click to copy row content
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

  //Function to copy raw row content
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

  //Helper Function to manage filters before pass them to the main function
  function handleFilterSelection(filterKey) {
    let filters = [];
    if (filterKey === 'DashFilters') {
      // Extraer solo los valores de 'filter' de cada índice en MVECUs
      filters = Object.values(MVECUs).map(item => item.filter);
    } else if (filterKey === 'NoFilters') {
      filters = filterData.NoFilters;
    }
    // Llamar a handleOpenPlay con los filtros seleccionados
    handleOpenPlay(filters);
  }

  //Function to open, play and decode filtered raw log files (Dashboard Filters)
  async function handleOpenPlay (newFilters) {
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
      const [fileHandle] = await window.showOpenFilePicker(options)
      setLogFileName(fileHandle.name)
      const fileName = fileHandle.name // Almacena el nombre del archivo en una variable local
      // Reset table values
      setInfo([])
      setMessage([])
      setEcuState("")
      // Send the file name to the backend
      console.log(`Sending File Name: ${fileName}`) 
      const data = {params: {fileName: fileName, filters: newFilters}}

      axios.post(url, data).then((response) => {
        console.log(response.data.message) // Response from the backend to confirm the file name and the filters was received
      })
      .catch((error) => {
        console.log(error)
      })
    } catch (err) {
      console.error(err);
    }
    setFilters(newFilters)
  }

  /* Function to view raw log files NO PROCESSING / NO FILTERS */
  async function handleViewRawFiles () {
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
      const [fileHandle] = await window.showOpenFilePicker(options)
      setLogFileName(fileHandle.name)
      const fileName = fileHandle.name // Almacena el nombre del archivo en una variable local
      // Reset table values
      setInfo([])
      setMessage([])
      setEcuState("")  
      // Send the file name to the backend
      console.log(`File Name: ${fileName}`) 
      const data = {params: {fileName: fileName}}
      axios.post(url, data).then((response) => {
        console.log(response.data.message) // Response from the backend to confirm the file name and the filters was received
      })
      .catch((error) => {
        console.log(error)
      })

    } catch (err) {
      console.error(err);
    }
    setFilters([])
  }

  // Function to save raw log files
  async function handleSaveRawFiles () {
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
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log("Log Raw file saved.");
    return handle;
    } catch (err) {
      console.error(err.name, err.message)
    }
  }
  
  // Function to replay raw log files
  function handleReplayRawFiles () {
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

  // Function to play live traffic from the CAN Bus
  function handlePlayTraffic () {
    eventSource = new EventSource(playUrl)
    //Reset table values
    setInfo([]);
    setMessage([]);
    eventSource.onmessage = (e) => {
      const parsedData = JSON.parse(e.data)
      setInfo((data) => [...data,parsedData])
    }
  }
  
  // Function to stop play live traffic from the CAN Bus
  function handleStopTraffic () {
    eventSource.close(); 
    console.log("Connection closed");
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
                    <NavDropdown.Item onClick={handleViewRawFiles}>
                      View Log File
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={handleSaveRawFiles}>
                      Save Log File
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdownMenu title="Actions" id="packets-dropdown">
                    <DropdownSubmenu title="Play And Decode">
                      <NavDropdown.Item onClick={() => handleFilterSelection('DashFilters')}>
                        Dashboard Filters
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={()=> handleFilterSelection('NoFilters')}>
                        Without Filters
                      </NavDropdown.Item>
                    </DropdownSubmenu>
                      <NavDropdown.Item>
                        Hack (cansend)
                      </NavDropdown.Item>
                  </NavDropdownMenu>
                  <NavDropdown title="Live Traffic">
                    <NavDropdown.Item onClick = {handlePlayTraffic}>
                      Start
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick = {handleStopTraffic}>
                      Stop
                    </NavDropdown.Item>
                  </NavDropdown>
                  {logFileName && <span className="logFileName">File Name: {logFileName}</span>}
                  <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter}/>
                </Nav>
              </div>
            </Navbar.Collapse>
        </Navbar>
        </div>
        {/* TABLES*/}
        <div {...getTableProps()} className="rawDataTable marginBottom">
          <div className="tableHeader">
            {headerGroups.map(headerGroup => (
              <div {...headerGroup.getHeaderGroupProps()} className="headerContainer">
                <div style={{width: '40px', borderRight: '1px solid #4d5154', textAlign: 'center', paddingTop: '6px'}}>No.</div>
                {headerGroup.headers.map((column, i) => {
                  const headerClass = `header${i}`;
                  return (
                    <div {...column.getHeaderProps(column.getSortByToggleProps())} className={`headerLine ${headerClass}`}>
                      {column.render('Header')}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div {...getTableBodyProps()} className="listBody">
            <List
              height={265} // Alto de la ventana
              itemCount={rows.length}
              itemSize={37.8} // Alto de cada renglon
              width={969} // Ancho de la ventana
            >
              {({ index, style }) => {
                const row = rows[index]
                prepareRow(row)
                return (
                  <div {...row.getRowProps({ style })} className="listRow" onClick = {(event) => {
                    if (event.target.nodeName !== 'INPUT') {
                      handleMessage(row.original.ecu, row.original.values);
                    }
                  }} onContextMenu={(event) => handleRightClick(event, row)}>
                    <div className="indexCell">{index + 1}</div>
                    {row.cells.map((cell, i) => {
                      const cellClass = `listCell${i}`;
                      return (
                        <div {...cell.getCellProps()} className={`${cellClass} listCells`}>{cell.render('Cell')}</div>
                      )
                    })}
                  </div>
                )
              }}
            </List>
          </div>
        </div>
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
                  <th className={ecuClass} colSpan={2}>{ecuState} {ecuDescription ? `(${ecuDescription})` : ''}</th>
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
                  <td><input className="calcTableInput" value={lsb} onChange={e => setLsb(e.target.value)} /></td>
                  <td><input className="calcTableInput" value={scale} onChange={e => setScale(e.target.value)} /></td>
                  <td><input className="calcTableInput" value={offset} onChange={e => setOffset(e.target.value)} /></td>
                  <td><input className="calcTableInput" value={newValue} onChange={e => setNewValue(e.target.value)} /></td>
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