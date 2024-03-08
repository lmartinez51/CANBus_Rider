import "./Visualizer.css"
import Transitions from "../Transitions"
import { ReactComponent as Sentra } from "./assets/Sentra2014.svg"
import axios from 'axios'
import ECUsDiagram from './ECUsDiagram'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const canUrl = 'http://localhost:8080/can'
const ENDPOINT = 'http://localhost:8080/'
let socket;

export default function Visualizer () {

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [adapterVer, setAdapaterVer] = useState('')
    const [protocol, setProtocol] = useState('')
    const [vin, setVin] = useState('0')

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

        // Escuchar el evento del socket para actualizar los datos
        socket.on('obdData', (data) => {
            console.log(data)
            setAdapaterVer(data.adapterVer)
            setProtocol(data.protocol)
            setVin(data.vin)
        });

        // Limpiar el evento del socket al desmontar el componente
        return () => {
            socket.off('obdData');
            socket.off('connect');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [])

    function handleCanButton() {
        setIsConnecting(true);
        axios.get(canUrl)
            .then(response => {
                setIsConnecting(false);
                if (response.status === 200) {
                    console.log(response.data);
                    setIsConnected(true);
                    alert('Conexión exitosa');
                } else {
                    console.error('Error al conectar al adaptador: ', response.data);
                    setIsConnected(false);
                    alert('Error al conectar al adaptador: ' + response.data);
                }
            })
            .catch(error => {
                setIsConnecting(false);
                console.error('There was an error while attempting to make an HTTP request. ', error);
                setIsConnected(false);
                alert('There was an error when trying to make an HTTP request. Please verify your network connection. ' + error.message);
            });
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
                            <button className={`connectButton ${isConnected ? 'connected' : isConnecting ? 'connecting' : ''}`} onClick={handleCanButton}>
                                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
                            </button>
                            <Sentra/>
                            <ECUsDiagram />
                        </div>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
