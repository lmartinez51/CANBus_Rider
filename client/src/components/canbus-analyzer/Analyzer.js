import "./Analyzer.css"
import Transitions from "../Transitions"
import ECUsDiagram from './ECUsDiagram'
import React, { useEffect, useState, useRef } from 'react'
import { ReactComponent as Car } from "./assets/carSvg.svg"
import axios from 'axios'
import io from 'socket.io-client'

const snifferUrl = 'http://localhost:8080/startSniffer'
const endSnifferUrl = 'http://localhost:8080/stopSniffer'
const vehicleInfoUrl = 'http://localhost:8080/vehicleInfo'
const singleECUUrl = 'http://localhost:8080/sniffECU'
const ENDPOINT = 'http://localhost:8080/'
let socket

export default function Analyzer () {

    // Buttons states
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isStarted, setIsStarted] = useState(false)
    const [activeRange, setActiveRange] = useState(null)
    const [connectButtonStatus, setConnectButtonStatus] = useState(false)
    const isStartedRef = useRef(false)
    // Data (ecu - payload)
    const [data, setData] = useState([]) 
    // VIN Information
    const [vin, setVin] = useState('')
    const [make, setMake] = useState(null)
    const [model, setModel] = useState(null)
    const [modelYear, setModelYear] = useState(null)
    const [vehicleType, setVehicleType] = useState(null)
    const [doors, setDoors] = useState(null);
    const [engineCylinders, setEngineCylinders] = useState(null)

    // useEffect(() => {
    //     console.log(`La variable isStarted tiene valor ${isStarted}`);
    //   }, [isStarted])

    useEffect(() => {
        // Conectar el socket al servidor
        socket = io(ENDPOINT, {
            withCredentials: true,
            extraHeaders: {
                "my-custom-header": "abcd"
            },
            autoConnect: true,
            reconnection: true, // Habilitar la reconexión automática
            reconnectionAttempts: Infinity, // Número de intentos de reconexión
            reconnectionDelay: 1000, // Tiempo de espera antes de intentar la reconexión
        })

        // Asignar un nombre significativo al socket
        socket.on('connect', () => {
            socket.emit('introduce', 'Analyzer');
        })

        // Manejar errores de conexión del socket
        socket.on('connect_error', (err) => {
            console.log(`Error de conexión del socket: ${err.message}`)
        })

        socket.on('snifferData', (data) => {
            //console.log(data)
            if(data.ecu !== undefined && data.payload !== undefined){
              setData(prevData => [...prevData, { ecu: data.ecu, payload: data.payload }]); // Agrega el nuevo objeto al array 'data'
            }
        })

        socket.on('vinData', (data) => {
            console.log(data)
            setVin(data.vin)
            setMake(data.Make)
            setModel(data.Model)
            setModelYear(data['Model Year'])
            setVehicleType(data['Vehicle Type'])
            setDoors(data.Doors)
            setEngineCylinders(data['Engine Number of Cylinders'])
            setIsConnected(true)
            setIsConnecting(false)
        })

        // Limpiar los eventos del socket al desmontar el componente
        return () => {
            socket.off('connect')
            socket.off('connect_error')
            socket.off('snifferData')
            socket.off('vinData')
            socket.disconnect()
        }
    }, [])

    function handleVehicleButton(range) {
        setIsConnecting(true)
        axios.post(vehicleInfoUrl, { range: range })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                    alert('Successful connection!')
                    setTimeout(() => {
                        setConnectButtonStatus(true)
                    }, 2000)
                } 
            })
            .catch(error => {
                setIsConnecting(false)
                setIsConnected(false)
                setConnectButtonStatus(false)
                console.error('There was an error while attempting to make the request. ', error)
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
            })
    }

    function handleStartButton(range) {
        setActiveRange(range)
        setIsStarted(true)
        isStartedRef.current = true
        axios.post(snifferUrl, { range: range })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                }
            })
            .catch(error => {
                console.error('There was an error while attempting to make the request. ', error)
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                setIsStarted(false)
            })
    }

    function handleStopButton() {
        return new Promise((resolve, reject) => {
          axios.post(endSnifferUrl)
            .then(response => {
              if (response.status === 200) {
                console.log(response.data)
                setActiveRange(null)
                setIsStarted(false) // Activate range buttons
                isStartedRef.current = false
                resolve()
              }
            })
            .catch(error => {
              if (error.response && error.response.status === 400) {
                alert('There is currently no established socket connection.')
              } else {
                alert('There was an error when trying to end data monitoring. Please verify your network connection and try again. ' + error.message)
              }
              //reject(error)
            })
        })
    }

    function handleNodeSniff(ecu) {
        // Verifica si el proceso está corriendo antes de intentar detenerlo
        if (isStartedRef.current) {
            handleStopButton().then(() => {
                setActiveRange(null)
                setIsStarted(true) // Deactivate range buttons
                // Luego, envía el ECU al backend
                axios.post(singleECUUrl, { ecu: ecu }).then(response => {
                    if (response.status === 200) {
                        console.log(response.data)
                    }
                })
                .catch(error => {
                    console.error('Error sending the ECU name to the server:', error)
                    alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                })
                .finally(() => {
                    // Restablece isStartedRef a false en todos los casos
                    isStartedRef.current = false
                })
            }).catch(error => {
                console.error('Error stopping the process:', error)
                alert('There was an error when trying to stop the process. Please verify your network connection and try again. ' + error.message)
            })
        } else {
            setActiveRange(null)
            setIsStarted(true) // Deactivate range buttons
            // Si el proceso no está corriendo, simplemente envía el ECU al backend
            axios.post(singleECUUrl, { ecu: ecu }).then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                }
            })
            .catch(error => {
                console.error('Error sending the ECU name to the server:', error)
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
            })
            .finally(() => {
                // Restablece isStartedRef a false en todos los casos
                isStartedRef.current = false
            })
        }
    }

    function handleResetAllButton() {
        window.location.reload()
    }

    return (
        <>
            <Transitions>
                <div className='Analyzer'>

                    <div className="carBackground">
                        <div className="vehicleData">
                            <p>VIN: {vin}</p>
                            <p>Make: {make}</p>
                            <p>Model: {model}</p>
                            <p>Year: {modelYear}</p>
                            <p>Vehicle Type: {vehicleType}</p>
                            <p>Engine Cylinders: {engineCylinders}</p>
                            <p>Doors: {doors}</p>
                        </div>
                        <Car className='carSvg'/>
                        <ECUsDiagram data={data} onNodeSniff={handleNodeSniff} onStopSniff={handleStopButton}/>
                        <button
                            className={`connectButton ${isConnected ? 'connected' : isConnecting ? 'connecting' : connectButtonStatus ? 'statusTrue' : ''}`}
                            onClick={() => handleVehicleButton('getData')} 
                            disabled={isConnected || isConnecting || connectButtonStatus}
                            >
                            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'first')}
                            className={`range1Button ${activeRange === 'first' ? 'started' : ''}`} 
                            onClick={activeRange === 'first' ? handleStopButton : () => handleStartButton('first')} 
                        >
                            {activeRange === 'first' ? 'Stop' : 'Range 1'}
                            {activeRange !== 'first' && <span style={{fontSize: '12px', display: 'block'}}>(000 - 0FF)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'second')}
                            className={`range2Button ${activeRange === 'second' ? 'started' : ''}`} 
                            onClick={activeRange === 'second' ? handleStopButton : () => handleStartButton('second')} 
                        >
                            {activeRange === 'second' ? 'Stop' : 'Range 2'}
                            {activeRange !== 'second' && <span style={{fontSize: '12px', display: 'block'}}>(100 - 17F)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'third')}
                            className={`range3Button ${activeRange === 'third' ? 'started' : ''}`} 
                            onClick={activeRange === 'third' ? handleStopButton : () => handleStartButton('third')} 
                        >
                            {activeRange === 'third' ? 'Stop' : 'Range 3'}
                            {activeRange !== 'third' && <span style={{fontSize: '12px', display: 'block'}}>(180 - 1FF)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'fourth')}
                            className={`range4Button ${activeRange === 'fourth' ? 'started' : ''}`} 
                            onClick={activeRange === 'fourth' ? handleStopButton : () => handleStartButton('fourth')}
                        >
                            {activeRange === 'fourth' ? 'Stop' : 'Range 4'}
                            {activeRange !== 'fourth' && <span style={{fontSize: '12px', display: 'block'}}>(200 - 27F)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'fifth')}
                            className={`range5Button ${activeRange === 'fifth' ? 'started' : ''}`} 
                            onClick={activeRange === 'fifth' ? handleStopButton : () => handleStartButton('fifth')} 
                        >
                            {activeRange === 'fifth' ? 'Stop' : 'Range 5'}
                            {activeRange !== 'fifth' && <span style={{fontSize: '12px', display: 'block'}}>(280 - 2FF)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'sixth')}
                            className={`range6Button ${activeRange === 'sixth' ? 'started' : ''}`} 
                            onClick={activeRange === 'sixth' ? handleStopButton : () => handleStartButton('sixth')} 
                        >
                            {activeRange === 'sixth' ? 'Stop' : 'Range 6'}
                            {activeRange !== 'sixth' && <span style={{fontSize: '12px', display: 'block'}}>(300 - 3FF)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'seventh')}
                            className={`range7Button ${activeRange === 'seventh' ? 'started' : ''}`} 
                            onClick={activeRange === 'seventh' ? handleStopButton : () => handleStartButton('seventh')} 
                        >
                            {activeRange === 'seventh' ? 'Stop' : 'Range 7'}
                            {activeRange !== 'seventh' && <span style={{fontSize: '12px', display: 'block'}}>(400 - 5FF)</span>}
                        </button>
                        <button 
                            disabled={!isConnected || (isStarted && activeRange !== 'eighth')}
                            className={`range8Button ${activeRange === 'eighth' ? 'started' : ''}`} 
                            onClick={activeRange === 'eighth' ? handleStopButton : () => handleStartButton('eighth')} 
                        >
                            {activeRange === 'eighth' ? 'Stop' : 'Range 8'}
                            {activeRange !== 'eighth' && <span style={{fontSize: '12px', display: 'block'}}>(600 - 7FF)</span>}
                        </button>
                        <button className= "resetAll" onClick={handleResetAllButton}>Reset All</button>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
