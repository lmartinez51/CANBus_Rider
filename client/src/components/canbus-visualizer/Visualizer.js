import "./Visualizer.css"
import Transitions from "../Transitions"
import { ReactComponent as Sentra } from "./assets/Sentra2014.svg"
import axios from 'axios'
import ECUsDiagram from './ECUsDiagram'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const canUrl = 'http://localhost:8080/connectOBD2'
const commandsUrl = 'http://localhost:8080/monitorVehicle'
const ENDPOINT = 'http://localhost:8080/'
let socket;

export default function Visualizer () {

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [status, setStatus] = useState(false)
    const [isStarted, setIsStarted] = useState(false)
    const [isStartButtonActive, setIsStartButtonActive] = useState(false);
    const [adapterVer, setAdapaterVer] = useState('')
    const [protocol, setProtocol] = useState('')
    const [vin, setVin] = useState('')

    const [coolantTemp, setCoolantTemp] = useState (0)
    const [revs, setRevs] = useState(0)
    const [speed, setSpeed] = useState(0)

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
            socket.emit('introduce', 'Visualizer');
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
            if (data.temp !== undefined) {
            setCoolantTemp(data.temp);
            }
            if (data.revs !== undefined) {
            setRevs(data.revs);
            }
            if (data.speed !== undefined) {
            setSpeed(data.speed);
            }
        });

        // Limpiar el evento del socket al desmontar el componente
        return () => {
            socket.off('obdData');
            socket.off('connect');
            socket.off('connect_error');
            socket.off('monitorData');
            socket.disconnect();
        };
    }, [])

    useEffect(() => {
        if (status) {
            // Cambia status a false después de un retraso
            const timeoutId = setTimeout(() => {
                //setStatus(false);
                setIsStartButtonActive(true);  // Habilita el botón 'startButton'
            }, 1000);  // Puedes ajustar el retraso según tus necesidades
    
            // Limpia el temporizador si el componente se desmonta
            return () => clearTimeout(timeoutId);
        }
    }, [status]);
    

    function handleCanButton() {
        setIsConnecting(true);
        axios.get(canUrl)
            .then(response => {
                setIsConnecting(false);
                if (response.status === 200) {
                    console.log(response.data);
                    setIsConnected(true);
                    alert('Conexión exitosa');
                } 
            })
            .catch(error => {
                setIsConnecting(false);
                console.error('There was an error while attempting to make an HTTP request. ', error);
                setIsConnected(false);
                alert('There was an error while attempting to make an HTTP request. Please verify your network connection. ' + error.message);
            });
    }

    function handleStartButton() {
        setIsStarted(true);
        axios.get(commandsUrl)
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data);
                } 
            })
            .catch(error => {
                console.error('There was an error while attempting to make the request. ', error);
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message);
            })
            .finally(() => {
                setIsStarted(false);
            });
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
                            </div>
                            <button
                                className={`connectButton ${isConnected ? 'connected' : isConnecting ? 'connecting' : status ? 'statusTrue' : ''}`}
                                onClick={handleCanButton}
                                disabled={isConnected || isConnecting || status}
                            >
                                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
                            </button>
                            <button className= "refresh" onClick={handleRefreshButton}>Refresh</button>
                            <Sentra/>
                            <ECUsDiagram coolantTemp={coolantTemp} revs={revs} speed={speed}/>
                            <button className={`startButton ${isStarted ? 'started' : ''}`} onClick={handleStartButton} disabled={!isStartButtonActive}>
                                {isStarted ? 'Stop' : 'Start'}
                            </button>
                        </div>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
