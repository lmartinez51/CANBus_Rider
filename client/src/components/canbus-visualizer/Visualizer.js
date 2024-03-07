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

    const [adapterVer, setAdapaterVer] = useState('1.4v')
    const [protocol, setProtocol] = useState('ISO 15765-4')
    const [vin, setVin] = useState('12345678')

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

        // Manejar errores de conexión del socket
        socket.on('connect_error', (err) => {
            console.log(`Error de conexión del socket: ${err.message}`);
        });

        // Escuchar el evento del socket para actualizar los datos
        socket.on('obdData', (data) => {
            setAdapaterVer(data.adapterVer)
            setProtocol(data.protocol)
            setVin(data.vin)
        });
    
        // Limpiar el evento del socket al desmontar el componente
        return () => {
            socket.off('obdData');
        };
    }, [])

    function handleCanButton() {
        axios.get(canUrl)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error al conectar al adaptador: ', error);
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
                            <button className="connectButton" onClick={handleCanButton}>Connect</button>
                            <Sentra/>
                            <ECUsDiagram />
                        </div>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
