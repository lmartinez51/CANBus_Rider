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
    const [value, setValue] = useState("")
    const [message, setMessage] = useState(null)
    const [previousChats, setPreviousChats] = useState([])
    const [currentTitle, setCurrentTitle] = useState(null)

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

    useEffect(() => {
        if(!currentTitle && value && message) {
            setCurrentTitle(value)
        }
        if(currentTitle && value && message){
            setValue('')
            setPreviousChats( prevChats => (
                [...prevChats, {
                    title: currentTitle,
                    role: "User:",
                    content: value
                }, {
                    title: currentTitle,
                    role: "Assistant:",
                    content: message
                }]
            ))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, currentTitle])
    
    const getMessages = async () => {
        const options = {
            method: "POST",
            body: JSON.stringify({
                message: value,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }
        try {
            const response = await fetch ('http://localhost:8080/playground', options)
            const data = await response.json()
            setMessage(data.message)
        } catch (error) {
            console.error(error)
        }
    }

    const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle)
 
    return (
        <>
        <div className="Playground">
            {/** DASHBOARD REGION **/}
            <div id="dashboard">
                <div style={{display: "none"}}>
                    <img id="sprite" alt='icons' src={iconos}></img>
                </div>
                <div className="canvas">
                    <Canvas draw={(ctx) => draw(ctx, speed, tacho, gas, mileage, turnSignalsStates, iconsStates)} width={960} height={260}/>
                </div>
                <div id="chatgpt" className="chatgpt">
                    <section className="chat">
                        <h6>BusWhizBot</h6>
                        <ul className="feed">
                            {currentChat?.map((chatMessage, index) => <li key={index}>
                                <p className="role">{chatMessage.role}</p>
                                <p>{chatMessage.content}</p>
                            </li>)}
                        </ul>
                        <div className="bottom-section">
                            <div className="input-container">
                                <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
                                    if (e.code === 'Enter') {
                                        e.preventDefault(); // Previene la acción por defecto del 'Enter'
                                        getMessages();
                                    }
                                }}/>
                                <div id="submit" onClick={getMessages}>➢</div>
                            </div>
                        </div>
                    </section>
                </div>
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
