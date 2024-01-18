import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavDropdown from "react-bootstrap/NavDropdown"
import React, { useState, useMemo } from 'react'
import { useTable, useGlobalFilter, useSortBy } from 'react-table'
import Table from 'react-bootstrap/Table';
import {COLUMNS} from './Columns'
import "./Table.css"
import { GlobalFilter } from './GlobalFilter'
import axios from 'axios'
const url = 'http://localhost:8080/upload'
const playUrl = 'http://localhost:8080/play'
let eventSource;  

export default function CANTable() {
  
  const [message, setMessage] = useState([])
  const [info, setInfo] = useState([])
  const [fileName, setFileName] = useState('')
  const [logFileName, setLogFileName] = useState('')

  const handleMessage = (ecu, values) => {
    setMessage([]);
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
    };
  };

  async function handleSavePackets () {
    var packet = ''
    info.map((x,y)=> (
      packet+=x.time+" "+x.can+" "+x.id+"#"+x.dt1+x.dt2+x.dt3+x.dt4+x.dt5+x.dt6+x.dt7+x.dt8+"\n"))
    const blob = new Blob([packet], {type:"text/plain"});
    try {
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
    };
    const handle = await window.showSaveFilePicker(options);
    setFileName(handle.name);
    //setDisable(false);
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
    const [fileHandle] = await window.showOpenFilePicker(options);
    setLogFileName(fileHandle.name)
    // Send the file name to the backend
    const data = {params: {fileName: logFileName}}
    axios.post(url, data).then((response) => {
      console.log(response.data.message)
    })
    .catch((error) => {
      console.log(error)
    })
    // Reset table values
    setInfo([]);
    setMessage([]);
    
    // Create a file reader
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      // Split the file content by new line
      const lines = event.target.result.split('\n');
      // Iterate over each line
      lines.forEach((line) => {
        // Skip empty lines
        if (line.trim() === '') return;
        // Parse the line and add it to the info array
        const parsedData = parseLine(line);
        setInfo((data) => [...data, parsedData]);
      });
    };
    
    // Read the file
    const file = await fileHandle.getFile();
    fileReader.readAsText(file);
  }
  // Function to parse a line
  function parseLine(line) {
    // Split the line by space and extract the relevant parts
    const parts = line.split(' ');
    const time = parts[0];
    const can = parts[1];
    const id = parts[2].split('#')[0];
    const data = parts[2].split('#')[1];
    // Split the data into 8 parts
    const dt = data.match(/.{1,2}/g);
    // Return an object with the parsed data
    return { time, can, id, dt1: dt[0], dt2: dt[1], dt3: dt[2], dt4: dt[3], dt5: dt[4], dt6: dt[5], dt7: dt[6], dt8: dt[7] };
  }
    
  function handleReplayPackets () {
    //Reset table values
    setInfo([])
    setMessage([])
    const replayEventSource = new EventSource(playUrl)
    replayEventSource.addEventListener('message', function(e) {
      const parsedData = JSON.parse(e.data)
      setInfo((data) => [...data,parsedData])
    })
    replayEventSource.addEventListener('close', function(e) {
      replayEventSource.close();
      console.log("canplayer connection closed")
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
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
              <Navbar.Collapse>
                <div className="navigationBottomBar">
                  <Nav>
                    <NavDropdown title="File" id="file-dropdown">
                      <NavDropdown.Item>
                        Save Project
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={handleOpenPackets}>
                        Open Saved Packets
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Packets" id="packets-dropdown">
                      <NavDropdown.Item href="#Modal" data-toggle="Modal">
                        Edit Packets
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={handleReplayPackets}>
                        Replay Packets
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={handleSavePackets}>
                        Save Packets
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        Annotate Packets
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Play Traffic">
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
          <Table className="rawTable" striped bordered hover responsive variant = "dark" {...getTableProps()}>
              <thead>
              {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
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
                  <tr key={i} className="rawrow" onClick = {() => handleMessage(row.original.ecu, row.original.values)} {...row.getRowProps()}>
                      <td width='40'>{i+1}</td>
                      {row.cells.map(cell => {
                      return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      })}
                  </tr>
                  )
              })}
              </tbody>
          </Table>
          <Table className="decodedTable" striped bordered hover responsive variant = "dark">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Values</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
            {message.map(({Signal, Value, Unit}, idx) => (
              <tr key={idx} className= 'signals'>
                <td>{Signal}</td>
                <td>{Value}</td>
                <td>{Unit}</td>
              </tr>
              ))}
            </tbody>
          </Table>
    </>
    )
  }