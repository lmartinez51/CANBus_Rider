import CANTable from "./Table"
import Canvas from "./Canvas"
import React, { useEffect, useState } from 'react'
import "./Playground.css"
import { draw } from "./DrawFunctions"
import iconos from './assets/icons.svg'
import io from 'socket.io-client'


const ENDPOINT = 'http://localhost:8080/'
const socket = io(ENDPOINT, {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
})

export default function Playground() {

    const [tacho, setTacho] = useState(0)  //Divide revs rpm / 8000.0.25=2, 0.5=4, 1=8
    const [speed, setSpeed] = useState(0)    //Divide speed km/h / 200 0.5 = 100; 0.25 = 50
    const [gas, setGas] = useState(1)
    const [mileage, setMileage] = useState(0)
    const [turnSignalsStates, setTurnSignal] = useState({
        'left':  false,
        'right': false
    })
    const [iconsStates, setIcons] = useState({
        'dippedBeam': 0,
        'brake':      0,
        'drift':      0,
        'highBeam':   0,
        'lock':       0,
        'seatBelt':   0,
        'engineTemp': 0,
        'stab':       0,
        'abs':        0,
        'gas':        0,
        'trunk':      0,
        'bonnet':     0,
        'doors':      0,
        'battery':    0,
        'oil':        0,
        'engineFail': 0
    })

    useEffect(() => {
        // Escuchar el evento del socket para actualizar los datos
        socket.on('message', (data) => {
            console.log(data)
            setTacho(data.revs/8000)
            setMileage(data.dist)
        });
    
        // Limpiar el evento del socket al desmontar el componente
        return () => {
          socket.off('message');
        };
      }, []); // Dependencia vacía para ejecutarlo solo una vez
    

    return (
        <>
        <div className="Playground">
            {/** DASHBOARD REGION **/}
            <div id="dashboard">
                <div style={{display: "none"}}>
                    <img id="sprite" alt='icons' src={iconos}></img>
                </div>
                <Canvas draw={(ctx) => draw(ctx, speed, tacho, gas, mileage, turnSignalsStates, iconsStates)} width={740} height={260}/>
            </div>
            {/** DATA REGION **/}
            <div className="data">
                {/* TABLE */}
                <div className="rawTable">
                    <CANTable />
                </div>
            </div>
        </div>
        </>
    )
}
