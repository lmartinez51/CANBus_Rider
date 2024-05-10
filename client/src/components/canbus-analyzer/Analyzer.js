import "./Analyzer.css"
import Transitions from "../Transitions"
import ConnectModal from '../modals/ConnectModal'
import VehiclesListModal from '../modals/VehiclesListModal'
import RangeModal from '../modals/RangeModal'
import ECUsDiagram from './ECUsDiagram'
import React, { useEffect, useState, useRef } from 'react'
import { ReactComponent as Car } from "./assets/carSvg.svg"
import axios from 'axios'
import io from 'socket.io-client'

const snifferUrl = 'http://localhost:8080/startSniffer'
const endSnifferUrl = 'http://localhost:8080/stopSniffer'
const connectUrl = 'http://localhost:8080/connectOBD2'
const singleECUUrl = 'http://localhost:8080/sniffECU'
const getAllVehiclesUrl = 'http://localhost:8080/projects'
const addVehicleUrl = 'http://localhost:8080/project/new'
const getVehicleUrl = 'http://localhost:8080/project/'
const updateVehicleUrl = 'http://localhost:8080/project/update/'
const ENDPOINT = 'http://localhost:8080/'
let socket

export default function Analyzer() {

    // Buttons states
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isStarted, setIsStarted] = useState(false)
    const [activeRange, setActiveRange] = useState(null)
    const [connectButtonStatus, setConnectButtonStatus] = useState(false)
    const [isNewProject, setIsNewProject] = useState(false)
    const [isButtonToggled, setIsButtonToggled] = useState(false) // Reload Button
    const isStartedRef = useRef(false)
    // Data (ecu - payload)
    const [data, setData] = useState([])
    // Vehicle Information
    const [vin, setVin] = useState('')
    const [make, setMake] = useState(null)
    const [model, setModel] = useState(null)
    const [modelYear, setModelYear] = useState(null)
    const [vehicleType, setVehicleType] = useState(null)
    const [doors, setDoors] = useState(null);
    const [engineCylinders, setEngineCylinders] = useState(null)
    // Modals
    const [connectModalShow, setConnectModalShow] = useState(false)
    const [connectOption, setConnectOption] = useState({ host: '192.168.0.10', port: '35000' })
    const [vehicleModalShow, setVehicleModalShow] = useState(false)
    const [rangeModalShow, setRangeModalShow] = useState(false)
    const [customRange, setCustomRange] = useState({ filter: '000', mask: '0FF' })
    // Diagram
    const diagramRef = useRef(null)
    const [isDBDiagramLoaded, setIsDBDiagramLoaded] = useState(false)
    // Database related
    const [projects, setProjects] = useState([])
    const [projectID, setProjectID] = useState('')
    // Shared variables between Analyzer and ECUsDiagrama
    const [isSniffing, setIsSniffing] = useState(false)

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
            if (data.ecu !== undefined && data.payload !== undefined) {
                setData(prevData => [...prevData, { ecu: data.ecu, payload: data.payload }]) // Agrega el nuevo objeto al array 'data'
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

        socket.on('disconnection', (message) => {
            console.log(message) // "Socket Connection Timeout" or Buffer Full
            // Aquí puedes manejar la desconexión del socket como prefieras
            alert('The socket has been disconnected due to a ' + message + ' event.')
            setActiveRange(null)
            setIsStarted(false) // Activate range buttons
            isStartedRef.current = false
        })

        socket.on('disconnectionOnSingleSniff', (message) => {
            console.log(message)
            alert('The socket has been disconnected. ' + message)
            isStartedRef.current = false
        })

        // Limpiar los eventos del socket al desmontar el componente
        return () => {
            socket.off('connect')
            socket.off('connect_error')
            socket.off('snifferData')
            socket.off('vinData')
            socket.off('disconnection')
            socket.off('disconnectionOnSingleSniff')
            socket.disconnect()
        }
    }, [])

    function handleConnectButton() {
        setConnectModalShow(true)
        setIsNewProject(true)
        // Si el diagrama ha sido cargado previamente, 'limpiarlo'.
        if (isDBDiagramLoaded) {
            diagramRef.current.clearDiagram()
            setIsDBDiagramLoaded(false) 
        }
    }

    function handleCustomButton() {
        setRangeModalShow(true)
    }

    function handleCustomRange(range) {
        if(isDBDiagramLoaded) {
            setIsButtonToggled(true)
        } else {
            setActiveRange('custom')
            setIsStarted(true)
        }
        setRangeModalShow(false)
        setCustomRange({ filter: range.filter, mask: range.mask })
        isStartedRef.current = true
        axios.post(snifferUrl, { range: 'custom', option: connectOption, customRange: customRange })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data)
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert('There is currently no established socket connection.')
                    if(isDBDiagramLoaded){
                        setIsButtonToggled(false)
                    }
                } else {
                    alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                }
                setIsStarted(false)
                isStartedRef.current = false
            })
    }

    function handleOptionSelected(option) {
        setConnectModalShow(false)
        setIsConnecting(true)
        setConnectOption({ host: option.host, port: option.port })
        axios.post(connectUrl, { option: option, component: 'analyzer' })
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
        axios.post(snifferUrl, { range: range, option: connectOption })
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
                        if(isButtonToggled){
                            setIsButtonToggled(false)
                            isStartedRef.current = false
                        } else {
                            setActiveRange(null)
                            setIsStarted(false) // Activate range buttons
                            isStartedRef.current = false
                        }
                        resolve()
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 400) {
                        alert('The process has been halted. You may now proceed.')
                        //If it was a new diagram, reactivate ranges
                        if(!isDBDiagramLoaded){
                            setActiveRange(null)
                            setIsStarted(false) // Activate range buttons
                        } else {
                            if(isButtonToggled){
                                setIsButtonToggled(false)
                            }
                        }
                    } else {
                        alert('There was an error when trying to end data monitoring. Please verify your network connection and try again. ' + error.message)
                    }
                    reject(error) // Rechaza la promesa aquí y se ejecuta el catch en el render de ECUsDiagram
                })
        })
    }

    function handleNodeSniff(ecu) {
        return new Promise((resolve, reject) => { // Devuelve una nueva promesa
            setConnectOption(currentConnectOption => {
                if (isStartedRef.current) {
                    handleStopButton().then(() => {
                        setActiveRange(null)
                        setIsStarted(true) // Deactivate range buttons
                        // Luego, envía el ECU al backend
                        axios.post(singleECUUrl, { ecu: ecu, option: currentConnectOption })
                            .then(response => {
                                if (response.status === 200) {
                                    console.log(response.data)
                                    resolve() // Resuelve la promesa cuando la petición es exitosa
                                }
                            })
                            .catch(error => {
                                if (error.response && error.response.status === 500) {
                                    console.error('Error sniffing the selected ECU:', error)
                                    alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                                } else {
                                    alert('There was an error when trying to start data monitoring. Please verify your network connection and try again. ' + error.message)
                                }
                                reject() // Rechaza la promesa cuando hay un error
                            })
                            .finally(() => {
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
                    axios.post(singleECUUrl, { ecu: ecu, option: currentConnectOption })
                        .then(response => {
                            if (response.status === 200) {
                                console.log(response.data)
                                resolve() // Resuelve la promesa cuando la petición es exitosa
                            }
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 500) {
                                console.error('Error sending the ECU name to the server:', error)
                                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                            } else {
                                alert('There was an error when trying to start data monitoring. Please verify your network connection and try again. ' + error.message)
                            }
                            reject() // Rechaza la promesa cuando hay un error
                        })
                        .finally(() => {
                            // Restablece isStartedRef a false en todos los casos
                            isStartedRef.current = false
                        })
                }
                return currentConnectOption // Devuelve el mismo valor para no cambiar el estado
            })
        })
    }

    function handleResetAllButton() {
        window.location.reload()
    }

    const handleSaveButton = (event) => {
        event.preventDefault()          // Prevents the 'Save' button from refreshing the page
        let diagramData = diagramRef.current.saveDiagram()
        const data = {
            projectName: model + modelYear,
            deviceHost: connectOption.host,
            devicePort: connectOption.port,
            vin: vin,
            make: make,
            model: model,
            modelYear: modelYear,
            vehicleType: vehicleType,
            doors: doors,
            engineCylinders: engineCylinders,
            diagramData: diagramData
        }
        axios.post(addVehicleUrl, data).then((response) => {
            if (response.status === 200) {
                console.log(response.data)
                alert('New Vehicle Informacion Saved into the Database')
                setIsNewProject(false)
            }
        })
            .catch(error => {
                console.error('Error saving vehicle info into the database:', error)
                if (error.response && error.response.status === 500) {
                    alert('There was an issue while attempting to save the vehicle information into the database. ' + error.message)
                } else {
                    alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
                }
            })
    }

    const handleUpdateButton = (event) => {
        event.preventDefault()
        let diagramData = diagramRef.current.saveDiagram()
        const data = {
            diagramData: diagramData
        }
        axios.post(`${updateVehicleUrl}${projectID}`, data).then((response) => {
            if (response.status === 200) {
                console.log(response.data)
                alert('Vehicle Information Updated!')
            }
        })
            .catch(error => {
                console.error('Error updating vehicle info in the database:', error)
                alert('There was an error when trying to make a request. Please verify your network connection. ' + error.message)
            })
    }

    async function handleOpenButton() {
        if(isConnected) {
            setIsConnected(false) //Desactivar boton New
        }
        const success = await handleVehicleList() // Carga la lista de proyectos cuando se abre el modal
        if (success) {
            setVehicleModalShow(true)
        }
    }

    async function handleVehicleList() {
        try {
            const response = await axios.get(getAllVehiclesUrl)
            setProjects(response.data)
            return true // Devuelve true si la llamada fue exitosa
        } catch (error) {
            console.error('Error loading projects from the database: ', error)
            alert('There was an error when trying to make a request. Please verify your network and database connection. ' + error.message)
            return false // Devuelve false si la llamada falló
        }
    }

    async function handleVehicleSelected(option) {
        const projectId = option
        setProjectID(projectId)
        await axios.get(`${getVehicleUrl}${projectId}`)
            .then(response => {
                const project = response.data
                diagramRef.current.loadDiagram(project.diagramData)
                setVin(project.vin)
                setMake(project.make)
                setModel(project.model)
                setModelYear(project.modelYear)
                setVehicleType(project.vehicleType)
                setDoors(project.doors)
                setEngineCylinders(project.engineCylinders)
                setIsDBDiagramLoaded(true) // Establece isDBDiagramLoaded en true después de cargar el diagrama
                setConnectOption({ host: project.deviceHost, port: project.devicePort })
            })
            .catch(error => {
                console.error('Error loading project from the database:', error)
                alert('There was an error when trying to make a request. Please verify your network and database connection. ' + error.message)
            })
    }

    return (
        <>
            <Transitions>
                <ConnectModal
                    show={connectModalShow}
                    handleClose={() => setConnectModalShow(false)}
                    handleOptionSelected={handleOptionSelected}
                />
                <VehiclesListModal
                    show={vehicleModalShow}
                    handleClose={() => setVehicleModalShow(false)}
                    projects={projects} // Pasa la lista de proyectos al modal
                    handleVehicleSelected={handleVehicleSelected} // Pasa la función al modal
                />
                <RangeModal
                    show={rangeModalShow}
                    handleClose={() => setRangeModalShow(false)}
                    handleCustomRange={handleCustomRange} // Pasa la función al modal
                />
                <div className='Analyzer'>
                    <div className="carBackground">
                        <div className="vehicleInfo">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>Make: {make}</p>
                                <p>Model: {model}</p>
                                <p>Year: {modelYear}</p>
                            </div>
                            <p>VIN: {vin}</p>
                            <p>Vehicle Type: {vehicleType}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>Engine Cylinders: {engineCylinders}</p>
                                <p>Doors: {doors}</p>
                            </div>
                        </div>
                        <Car className='carSvg' />
                        <ECUsDiagram ref={diagramRef} data={data} onNodeSniff={handleNodeSniff} connectOption={connectOption} onStopSniff={handleStopButton} isSniffing={isSniffing} setIsSniffing={setIsSniffing}/>
                        <div className="buttonGroup1">
                            <button disabled={isNewProject} className="openButton" onClick={handleOpenButton}>Load Diagram</button>
                            <button disabled={!isDBDiagramLoaded || isNewProject} className="updateButton" onClick={handleUpdateButton}>Update Diagram</button>
                            <button disabled={!isDBDiagramLoaded || isNewProject} className={`reloadButton ${isButtonToggled ? 'toggled' : 'reloadButton'}`} onClick={() => isButtonToggled ? handleStopButton() : handleCustomButton()}>
                            {isButtonToggled ? 'Stop' : (
                                <>
                                    Reload Diag
                                    <span style={{ fontSize: '12px', display: 'block' }}>Custom Range</span>
                                </>
                            )}
                            </button>
                            <button className="resetAll" onClick={handleResetAllButton}>Reset All</button>
                        </div>
                        <button
                            className={`connectButton ${isConnected ? 'connected' : isConnecting ? 'connecting' : connectButtonStatus ? 'statusTrue' : ''}`}
                            onClick={handleConnectButton}
                            disabled={isConnected || isConnecting || connectButtonStatus}
                        >
                            {isConnected ? 'Ready' : isConnecting ? 'Connecting...' : 'New Diag'}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'first') || isDBDiagramLoaded}
                            className={`range1Button ${activeRange === 'first' ? 'started' : ''}`}
                            onClick={activeRange === 'first' ? handleStopButton : () => handleStartButton('first')}
                        >
                            {activeRange === 'first' ? 'Stop' : 'Range 1'}
                            {activeRange !== 'first' && <span style={{ fontSize: '12px', display: 'block' }}>(000 - 0FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'second') || isDBDiagramLoaded}
                            className={`range2Button ${activeRange === 'second' ? 'started' : ''}`}
                            onClick={activeRange === 'second' ? handleStopButton : () => handleStartButton('second')}
                        >
                            {activeRange === 'second' ? 'Stop' : 'Range 2'}
                            {activeRange !== 'second' && <span style={{ fontSize: '12px', display: 'block' }}>(100 - 17F)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'third') || isDBDiagramLoaded}
                            className={`range3Button ${activeRange === 'third' ? 'started' : ''}`}
                            onClick={activeRange === 'third' ? handleStopButton : () => handleStartButton('third')}
                        >
                            {activeRange === 'third' ? 'Stop' : 'Range 3'}
                            {activeRange !== 'third' && <span style={{ fontSize: '12px', display: 'block' }}>(180 - 1FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'fourth') || isDBDiagramLoaded}
                            className={`range4Button ${activeRange === 'fourth' ? 'started' : ''}`}
                            onClick={activeRange === 'fourth' ? handleStopButton : () => handleStartButton('fourth')}
                        >
                            {activeRange === 'fourth' ? 'Stop' : 'Range 4'}
                            {activeRange !== 'fourth' && <span style={{ fontSize: '12px', display: 'block' }}>(200 - 27F)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'fifth') || isDBDiagramLoaded}
                            className={`range5Button ${activeRange === 'fifth' ? 'started' : ''}`}
                            onClick={activeRange === 'fifth' ? handleStopButton : () => handleStartButton('fifth')}
                        >
                            {activeRange === 'fifth' ? 'Stop' : 'Range 5'}
                            {activeRange !== 'fifth' && <span style={{ fontSize: '12px', display: 'block' }}>(280 - 2FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'sixth') || isDBDiagramLoaded}
                            className={`range6Button ${activeRange === 'sixth' ? 'started' : ''}`}
                            onClick={activeRange === 'sixth' ? handleStopButton : () => handleStartButton('sixth')}
                        >
                            {activeRange === 'sixth' ? 'Stop' : 'Range 6'}
                            {activeRange !== 'sixth' && <span style={{ fontSize: '12px', display: 'block' }}>(300 - 3FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'seventh') || isDBDiagramLoaded}
                            className={`range7Button ${activeRange === 'seventh' ? 'started' : ''}`}
                            onClick={activeRange === 'seventh' ? handleStopButton : () => handleStartButton('seventh')}
                        >
                            {activeRange === 'seventh' ? 'Stop' : 'Range 7'}
                            {activeRange !== 'seventh' && <span style={{ fontSize: '12px', display: 'block' }}>(400 - 5FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'eighth') || isDBDiagramLoaded}
                            className={`range8Button ${activeRange === 'eighth' ? 'started' : ''}`}
                            onClick={activeRange === 'eighth' ? handleStopButton : () => handleStartButton('eighth')}
                        >
                            {activeRange === 'eighth' ? 'Stop' : 'Range 8'}
                            {activeRange !== 'eighth' && <span style={{ fontSize: '12px', display: 'block' }}>(600 - 7FF)</span>}
                        </button>
                        <button
                            disabled={!isConnected || (isStarted && activeRange !== 'custom') || isDBDiagramLoaded}
                            className={`customRangeButton ${activeRange === 'custom' ? 'started' : ''}`}
                            onClick={activeRange === 'custom' ? handleStopButton : handleCustomButton}
                        >
                            {activeRange === 'custom' ? 'Stop' : 'Custom Range'}
                        </button>
                        <button disabled={!isConnected || isDBDiagramLoaded} className="saveButton" onClick={handleSaveButton}>Save New Diagram</button>
                    </div>
                </div>
            </Transitions>
        </>
    )
}
