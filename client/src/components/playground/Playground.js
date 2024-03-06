import CANTable from "./Table"
import Speedometer from "./Helpers/Speedometer"
import Tachometer from "./Helpers/Tachometer"
import Thermometer from "./Helpers/Thermometer"
import FuelGauge from "./Helpers/FuelGauge"
import SignalContext from "./Helpers/SignalContext"
import React, { useEffect, useState } from 'react'
import "./Playground.css"
import io from 'socket.io-client'

const ENDPOINT = 'http://localhost:8080/'
const socket = io(ENDPOINT, {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  },
  autoConnect: true,
  reconnection: true, // Habilitar la reconexión automática
  reconnectionAttempts: Infinity, // Número de intentos de reconexión
  reconnectionDelay: 1000, // Tiempo de espera antes de intentar la reconexión
})

export default function Playground() {

    const [revs, setRevs] = useState(0)  //Divide revs rpm / 8000.0.25=2, 0.5=4, 1=8
    const [speed, setSpeed] = useState(0)    //Divide speed km/h / 200 0.5 = 100; 0.25 = 50
    const [distance, setDistance] = useState(0)
    const [engTemp, setEngTemp] = useState(0)
    const [engLamp, setEngLamp] = useState(0)
    const [hazardLamp, setHazardLamp] = useState(0)
    const [fuel, setFuel] = useState(100)
    const [value, setValue] = useState("")
    const [message, setMessage] = useState(null)
    const [previousChats, setPreviousChats] = useState([])
    const [currentTitle, setCurrentTitle] = useState(null)
    const [isTextareaEmpty, setIsTextareaEmpty] = useState(true)
    const [showHelpAndButtons, setShowHelpAndButtons] = useState(true)
    const [signal, setSignal] = useState('WheelBasedVehicleSpeed')

    useEffect(() => {
        // Escuchar el evento del socket para actualizar los datos
        socket.on('message', (data) => {
            setRevs(data.revs);
            setSpeed(data.speed)
            setDistance(data.dist)
            setEngTemp(data.engCoolantTemp)
            setFuel(data.fuelLevel)
            setEngLamp(data.engLamp)
            setHazardLamp(data.hazardLamp)
        });
    
        // Limpiar el evento del socket al desmontar el componente
        return () => {
          socket.off('message');
        };
     }, [])

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
                    role: "Mike:",
                    content: message
                }]
            ))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, currentTitle])
    
    const getMessages = async (message) => {
        console.log(`Mensaje a enviar: ${message}`)
        setShowHelpAndButtons(false)
        const options = {
            method: "POST",
            body: JSON.stringify({
                message: message,
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
    
    const handleButtonClick = (e) => {
        // Prevenir la acción por defecto del botón
        e.preventDefault();

        // Prevenir la propagación del evento
        e.stopPropagation();
    
        // Obtener el texto de los dos <div> dentro de .flex3
        const text1 = e.currentTarget.querySelector('.truncateText1').textContent;
        const text2 = e.currentTarget.querySelector('.truncateText2').textContent;

        // Concatenar los dos textos
        const buttonValue = text1 + ' ' + text2;
        // Llamar a la función getMessages con buttonValue
        // Actualizar el estado value
        setValue(buttonValue);

        getMessages(buttonValue);
    }    

    const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle)
    return (
        <SignalContext.Provider value={{ signal, setSignal }}>
        <div className="Playground">
            {/** DASHBOARD REGION **/}
            <div id="dashboard">
                <div className="canvas">
                    <Tachometer revs={revs} engLamp={engLamp} />
                    <div className="centralGauges">
                        <Thermometer engTemp={engTemp} />
                        <FuelGauge fuel={fuel} />
                    </div>
                    <Speedometer speed={speed} distance={distance} hazardLamp={hazardLamp}/>
                </div>
                <div id="chatgpt" className="chatgpt">
                    <section className="chat">
                        <h5>Mike The Mechanic's Chat Box</h5>
                        {showHelpAndButtons && (
                            <>
                                <div className="help-text">How can 'AI' help you today?</div>
                                <div className="projection-buttons-container">
                                    <div className="projection-button">
                                            <span data-projection-id="46">
                                                <button className="btn" data-title="Click to send" onClick={handleButtonClick}>
                                                    <div className="flex1">
                                                        <div className="flex2">
                                                            <div className="flex3">
                                                                <div className="truncateText1">Find the description</div>
                                                                <div className="truncateText2">of the {signal} signal.</div>
                                                            </div>
                                                            <div className="absolute">
                                                                <span className="span1" data-state="closed">
                                                                    <div className="rounded1">
                                                                        <svg viewBox="0 0 24 24" fill="none" className="icon-sm text-token-text-primary">
                                                                            <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                        </svg>
                                                                    </div>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </span>
                                        </div>
                                    <div className="projection-button">
                                        <span data-projection-id="46">
                                            <button className="btn" data-title="Click to send" onClick={handleButtonClick}>
                                                <div className="flex1">
                                                    <div className="flex2">
                                                        <div className="flex3">
                                                            <div className="truncateText1">Find the LSB, scale and offset</div>
                                                            <div className="truncateText2">of the {signal} signal.</div>
                                                        </div>
                                                        <div className="absolute">
                                                            <span className="span1" data-state="closed">
                                                                <div className="rounded1">
                                                                    <svg viewBox="0 0 24 24" fill="none" className="icon-sm text-token-text-primary">
                                                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                    </svg>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        <ul className="feed">
                            {currentChat?.map((chatMessage, index) => <li key={index}>
                                <p className="role">{chatMessage.role}</p>
                                <p>{chatMessage.content}</p>
                            </li>)}
                        </ul>
                        <div className="bottom-section">
                            <div className="input-container">
                                <textarea id="txtChatArea" value={value} onChange={(e) => {setValue(e.target.value); setIsTextareaEmpty(e.target.value === '')}} onKeyDown={(e) => {
                                    if (e.code === 'Enter') {
                                        e.preventDefault(); // Previene la acción por defecto del 'Enter'
                                        getMessages(value);
                                    }
                                }} rows="1" cols={10} placeholder="Message Mike..."/>
                                <button disabled={isTextareaEmpty} onClick={() => getMessages(value)} className="custom-button" data-testid="send-button">
                                    <span className="span2" data-state="closed">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white dark:text-black">
                                            <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        </svg>
                                    </span>
                                </button>
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
        </SignalContext.Provider>
    )
}