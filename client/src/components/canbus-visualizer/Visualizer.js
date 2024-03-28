import "./Visualizer.css"
import Transitions from "../Transitions"
import { ReactComponent as Sentra } from "./assets/Sentra2014.svg"
import axios from 'axios'
import ECUsDiagram from './ECUsDiagram'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const canUrl = 'http://localhost:8080/connectOBD2'
const startMonitorUrl = 'http://localhost:8080/startMonitorVehicle'
const endMonitorUrl = 'http://localhost:8080/stopMonitorVehicle'
const diagnosticsUrl = 'http://localhost:8080/diagnostics'
const ENDPOINT = 'http://localhost:8080/'
let socket;

export default function Visualizer () {

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [status, setStatus] = useState(false)
    const [isStarted, setIsStarted] = useState(false)
    const [isStartButtonActive, setIsStartButtonActive] = useState(false);
    const [isTCButtonActive, setIsTCButtonActive] = useState(false)
    // Adapter Information
    const [adapterVer, setAdapaterVer] = useState('')
    const [protocol, setProtocol] = useState('')
    const [vin, setVin] = useState('')
    // VIN Information
    const [make, setMake] = useState(null);
    const [model, setModel] = useState(null);
    const [modelYear, setModelYear] = useState(null);
    const [vehicleType, setVehicleType] = useState(null);
    const [doors, setDoors] = useState(null);
    const [engineCylinders, setEngineCylinders] = useState(null);
    // Live data
    const [coolantTemp, setCoolantTemp] = useState (0)
    const [revs, setRevs] = useState(0)
    const [speed, setSpeed] = useState(0)
    const [fuel, setFuel] = useState (0)
    const [voltage, setVoltage] = useState('')
    // Hack Codes
    const [ctrlDoors, setCtrlDoors] = useState('Unlocked')
    // Trouble codes
    const [troubleCodeNum, setTroubleCodeNum] = useState(0)
    const [troubleCode, setTroubleCode] = useState('')
    const [troubleDescription, setTroubleDescription] = useState('')

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
        });

        // Asignar un nombre significativo al socket
        socket.on('connect', () => {
            socket.emit('introduce', 'Diagnostics');
        })

        // Manejar errores de conexión del socket
        socket.on('connect_error', (err) => {
            console.log(`Error de conexión del socket: ${err.message}`);
        });

        // Escuchar el evento del socketOBD2 para actualizar los datos
        socket.on('obdData', (data) => {
            console.log(data)
            setAdapaterVer(data.adapterVer)
            setProtocol(data.protocol)
            setVin(data.vin)
            setStatus(data.processStatus)
            // Si processStatus es true, restablecer isConnected e isConnecting
            if (data.processStatus) {
                setIsConnected(false);
                setIsConnecting(false);
            }
        });

        socket.on('monitorData', (data) => {
            console.log(data)
            if(data.voltage !== undefined){
            setVoltage(data.voltage)
            }
            if (data.temp !== undefined) {
            setCoolantTemp(data.temp);
            }
            if (data.revs !== undefined) {
            setRevs(data.revs);
            }
            if (data.speed !== undefined) {
            setSpeed(data.speed);
            }
            if (data.fuel !== undefined) {
            setFuel(data.fuel);
            }
        });

        socket.on('vinData', (data) => {
            console.log(data);
            setMake(data.Make);
            setModel(data.Model);
            setModelYear(data['Model Year']);
            setVehicleType(data['Vehicle Type']);
            setDoors(data.Doors);
            setEngineCylinders(data['Engine Number of Cylinders']);
        })

        socket.on('codesData', (data) => {
            console.log(data)
            setTroubleCodeNum(data.number)
            setTroubleCode(data.codes)
            setTroubleDescription(data.description)
        })

        // Limpiar los eventos del socket al desmontar el componente
        return () => {
            socket.off('obdData')
            socket.off('connect')
            socket.off('connect_error')
            socket.off('monitorData')
            socket.off('vinData')
            socket.off('codesData')
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (status) {
            // Cambia status a false después de un retraso
            const timeoutId = setTimeout(() => {
                setIsTCButtonActive(true) // Habilita el boton 'Get DTCs'
            }, 1000);  // Ajustar el retraso
    
            // Limpia el temporizador si el componente se desmonta
            return () => clearTimeout(timeoutId);
        }
    }, [status]);

    function handleConnectButton() {
        setIsConnecting(true);
        axios.post(canUrl)
            .then(response => {
                setIsConnecting(false);
                if (response.status === 200) {
                    console.log(response.data)
                    setIsConnected(true)
                    alert('Conexión exitosa')
                } 
            })
            .catch(error => {
                setIsConnecting(false)
                console.error('There was an error while attempting to make an HTTP request. ', error)
                setIsConnected(false)
                alert('There was an error while attempting to make an HTTP request. Please verify your network connection. ' + error.message)
            })
    }

    function handleCodesButton() {
        axios.post(diagnosticsUrl)
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                    //alert('Succesfull diagnostics')
                    setIsTCButtonActive(false) //Deshabilita el boton 'Get DTCs'
                    setIsStartButtonActive(true)  // Habilita el botón 'startButton'
                } 
            })
            .catch(error => {
                console.error('There was an error while attempting to make an HTTP request. ', error);
                alert('There was an error while attempting to make an HTTP request for diagnostics. Please verify your network connection. ' + error.message);
            })
    }

    function handleStartButton() {
        setIsStarted(true);
        axios.post(startMonitorUrl)
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data);
                    //alert('Successful connection')
                } 
            })
            .catch(error => {
                console.error('There was an error while attempting to make the request. ', error);
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message);
                setIsStarted(false)
            })
    }
    
    function handleStopButton() {
        axios.post(endMonitorUrl)
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                    setIsStarted(false) // Go to green again
                } 
            })
            .catch(error => {
                alert('There was an error when trying to end the diagnostics. Please verify your network connection and try again. ' + error.message);
            })
    }

    function handleRefreshButton() {
        window.location.reload();
    }

    return (
        <>
            <Transitions>
                <div className='Visualizer'>
                    <div className="map">
                        <div className="carMap">
                            <div className="infoPanel">
                                <p>Adapter Version: {adapterVer}</p>
                                <p>Protocol: {protocol}</p>
                                <p>VIN: {vin}</p>
                                <p>Make: {make}</p>
                                <p>Model: {model}</p>
                                <p>Year: {modelYear}</p>
                                <p>Vehicle Type: {vehicleType}</p>
                                <p>Engine Cylinders: {engineCylinders}</p>
                                <p>Doors: {doors}</p>
                            </div>
                            <div className="troublePanel">
                                <p>Number of TCs: <span style={{ color: 'white', fontWeight: 'bold' }}>{troubleCodeNum}</span></p>
                                <p>Trouble Codes: <span style={{ color: 'red', fontWeight: 'bold' }}>{troubleCode}</span></p>
                                <p>Description: <span style={{color: 'red', fontWeight: 'bold'}}>{troubleDescription}</span></p>
                            </div>
                            <button
                                className={`connectButton ${isConnected ? 'connected' : isConnecting ? 'connecting' : status ? 'statusTrue' : ''}`}
                                onClick={handleConnectButton}
                                disabled={isConnected || isConnecting || status}
                            >
                                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
                            </button>
                            <Sentra/>
                            <ECUsDiagram coolantTemp={coolantTemp} revs={revs} speed={speed} fuel={fuel} voltage={voltage} ctrlDoors={ctrlDoors}/>
                            <button 
                                className= {`troubleCodes ${isTCButtonActive ? 'getting': ''}`}
                                onClick={handleCodesButton} 
                                disabled={!isTCButtonActive}
                            >Get DTCs
                            </button>
                            <button 
                                className={`startButton ${isStarted ? 'started' : ''}`} 
                                onClick={isStarted ? handleStopButton : handleStartButton} 
                                disabled={!isStartButtonActive}
                            >
                                {isStarted ? 'Stop' : 'Start'}
                            </button>
                            <button className= "refresh" onClick={handleRefreshButton}>Refresh</button>
                        </div>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
