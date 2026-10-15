import CANTable from "./Table"
import SignalContext from "./Helpers/SignalContext"
import Canvas from "./Helpers/Canvas"
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
  },
  autoConnect: true,
  reconnection: true, // Habilitar la reconexión automática
  reconnectionAttempts: Infinity, // Número de intentos de reconexión
  reconnectionDelay: 1000, // Tiempo de espera antes de intentar la reconexión
})

export default function Playground() {

    const [tacho, setTacho] = useState(0)  //Divide revs rpm / 8000.0.25=2, 0.5=4, 1=8
    const [speed, setSpeed] = useState(0)    //Divide speed km/h / 200 0.5 = 100; 0.25 = 50
    const [brake, setBrake] = useState(0)
    const [cruiseCtrl, setCruiseCtrl] = useState(0)
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
        'hazzard':    0,
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
    const [iconsLoaded, setIconsLoaded] = useState(false) // Nuevo estado para manejar la carga de los iconos
    const [isTextareaEmpty, setIsTextareaEmpty] = useState(true)
    const [showHelpAndButtons, setShowHelpAndButtons] = useState(true)
    const [signal, setSignal] = useState('WheelBasedVehicleSpeed');

    useEffect(() => {
        // Escuchar el evento del socket para actualizar los datos
        socket.on('message', (data) => {
            //console.log(data)
            setTacho(data.revs)
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
                    role: "Mike:",
                    content: message
                }]
            ))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, currentTitle])

    useEffect(() => {
        // Crea una nueva instancia de Image
        const img = new Image();

        // Define el manejador del evento onload
        img.onload = () => {
            // Una vez que la imagen se ha cargado, actualiza el estado
            setIconsLoaded(true);
        };

        // Inicia la carga de la imagen
        img.src = iconos;
    }, []); // Este efecto se ejecuta una vez cuando el componente se monta
    
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
                <div style={{display: "none"}}>
                    <img id="sprite" alt='icons' src={iconos}></img>
                </div>
                <div className="canvas">
                    {iconsLoaded && <Canvas draw={(ctx) => draw(ctx, speed, tacho, gas, mileage, turnSignalsStates, iconsStates)} width={920} height={310}/>}
                </div>
                <div id="chatgpt" className="chatgpt">
                    <section className="chat">
                        <h5>Mike The Mechanic's Chat Box</h5>
                        {showHelpAndButtons && (
                            <>
                                <div className="help-text">How can I help you today?</div>
                                <div className="projection-buttons-container">
                                    <div className="projection-button">
                                            <span data-projection-id="46">
                                                <button className="btn" aria-label={`Find description of the ${signal} signal`} data-title="Click to send" onClick={handleButtonClick}>
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
                                            <button className="btn" aria-label={`Find LSB, scale and offset of the ${signal} signal`} data-title="Click to send" onClick={handleButtonClick}>
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
                                <button disabled={isTextareaEmpty} onClick={() => getMessages(value)} className="custom-button" aria-label="Send message" data-testid="send-button">
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