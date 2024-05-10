require('dotenv').config()
const HTTPPORT = 8080
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const httpServer = require('http').Server(app)
const MONGODBURI = process.env.MONGODBURI
const initializationCommandsList = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r']
const troubleCodeList = ['AT WS\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', '01 01\r', '03\r']
const monitoringCommandsList = ['AT RV\r', '01 05 1\r', '01 0C 1\r', '01 0D 1\r', '01 2F 1\r'] //Multiple PID request in one line - Coolant Temp and Engine Revs
const resetTroubleCodeCommand = ['AT WS\r', 'AT E0\r', '04\r']
//const initList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r'] // 'AT CRA 60D\r',
// Filters Commands
const firstFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 001\r', 'AT CM 700\r', 'AT MA\r']
const secondFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 100\r', 'AT CM 780\r', 'AT MA\r']
const thirdFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 180\r', 'AT CM 780\r', 'AT MA\r']
const fourthFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 200\r', 'AT CM 780\r', 'AT MA\r']
const fifthFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 280\r', 'AT CM 780\r', 'AT MA\r']
const sixthFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 300\r', 'AT CM 700\r', 'AT MA\r']
const seventhFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 400\r', 'AT CM 600\r', 'AT MA\r']
const eighthFilterList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', 'AT CF 600\r', 'AT CM 600\r', 'AT MA\r']
const SocketOBD2Connection = require('./modules/socketOBD2Connection')
const SendingDiagnosticsCommands = require('./modules/DiagnosticsCommands')
const SendingAnalyzerCommands = require('./modules/AnalyzerCommands')
const SendingSnifferCommands = require('./modules/SnifferCommands')
const SendingMonitorCommands = require('./modules/MonitorCommands')
const SendingTroubleCodesCommands = require('./modules/TroubleCodesCommands')
const SendingResetCodesCommands = require('./modules/ResetCommands')
const play = require('./modules/playPackets')
const viewFile = require('./modules/streamRawFile')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
const { setupSocketIO } = require('./modules/socketIOSetup')
const { SocketCANSetup } = require('./modules/socketcanSetup')

let pid = ''
let fileName = ''
let filters= []
let socketOBD2Connection
let sendingCommands

app.use(express.json())
app.use(cors())

setupSocketIO(httpServer)

const socketCANSetup = new SocketCANSetup();
socketCANSetup.setup();

// Run the AI Assistant
app.post('/playground', chatAssistant.createChatCompletion)

// Recieve log file name from the front-end
app.post('/upload', (req, res) => {
	fileName = req.body.params.fileName
	filters = req.body.params.filters
	console.log(`File name to process: ${fileName}`)
	res.status(200).send({ message: 'File name and filters received' })
})

// Play and decode log-files
app.get('/play', (req, res) => {
  play(req, res, fileName, filters)
})

// View log file only
app.get('/viewFile', (req, res) => {
    socketCANSetup.resetDecodedInfo(); // Primero reseteas los valores
    const decodedInfo = socketCANSetup.getDecodedInfo(); // Luego obtienes los valores reseteados
	const socket = global.connectedSocket
	if (socket) socket.emit('message', decodedInfo)
	viewFile(req, res, fileName)
})

// Connect to the virtual CAN Bus interface 29-bit
app.get('/vcan', (req,res) => {
	const device = req.query.CAN;
	vcanconfig.initializeVirtualCAN(device)
	pid = startcangen.cangen(device)
	res.send("Virtual CAN Bus 29-bits initialized")
})

// Connect to OBD2 ELM327 WiFi Adapter and run commands
app.post('/connectOBD2', (req, res) => {
    const host = req.body.option.host
    const port = req.body.option.port
    const component = req.body.component
    socketOBD2Connection = new SocketOBD2Connection(host, port)
    switch(component) {
        case 'analyzer':
            sendingCommands = new SendingAnalyzerCommands(socketOBD2Connection, initializationCommandsList)
            break
        case 'diagnostics':
            // Connect Diagnostics
            sendingCommands = new SendingDiagnosticsCommands(socketOBD2Connection, initializationCommandsList)
            break
        case 'troubleCodes':
            //Run OBD2 Trouble Codes Diagnostics
            sendingCommands = new SendingTroubleCodesCommands(socketOBD2Connection, troubleCodeList)
            break
        case 'resetCodes':
            // Clear Vehicle Diagnostic Trouble Codes
            sendingCommands = new SendingResetCodesCommands(socketOBD2Connection, resetTroubleCodeCommand)
            break
    }
    // Define los manejadores de eventos
    const errorHandler = async (err) => {
        console.log('Error:', err.message)
        res.status(500).send('Error: ' + err.message)
    }

    const connectedHandler = () => {
        console.log('Conexion exitosa!')
        res.status(200).send('Successful Connection!')
        sendingCommands.sendCommand()
    }

    // Elimina los manejadores de eventos existentes
    socketOBD2Connection.off('error', errorHandler)
    socketOBD2Connection.off('connected', connectedHandler)
    socketOBD2Connection.removeAllListeners('disconnected')

    // Agrega los manejadores de eventos
    socketOBD2Connection.once('error', errorHandler)
    socketOBD2Connection.once('connected', connectedHandler)

    socketOBD2Connection.on('disconnected', () => {
        console.log("Desconectado del adaptador OBDII ELM327.")
        //Agregar aqui enviar una respuesta al frontend para cuando se desconecte por timeout
        //res.status(408),send("Socket Connection Timeout")
        sendingCommands = null
        socketOBD2Connection = null
    });

    // Luego, establecer la conexión
    socketOBD2Connection.connect()
})

// Start Vehicule Live Data (RPM, Speed, Engine Temp, Fuel, Battery Voltage)
app.post('/startMonitorVehicle', (req, res) => {
    const host = req.body.option.host
    const port = req.body.option.port
    if (!socketOBD2Connection) {
        socketOBD2Connection = new SocketOBD2Connection(host, port)
    }
    sendingCommands = new SendingMonitorCommands(socketOBD2Connection, monitoringCommandsList)
    // Elimina los manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('connected')
    socketOBD2Connection.removeAllListeners('disconnected')
    socketOBD2Connection.removeAllListeners('error')

    // Agrega los manejadores de eventos
    socketOBD2Connection.once('error', (err) => {
        console.log("Error al enviar los comandos.")
        res.status(500).send('Error: ' + err.message)
    })

    socketOBD2Connection.once('connected', () => {
        console.log('Comenzando emision de comandos.')
        res.status(200).send('Command cycle started!')
        sendingCommands.startCommandCycle()
    })

    socketOBD2Connection.on('disconnected', () => {
        console.log("Desconectado del adaptador OBDII ELM327.")
    })

    // Conectarse al socket
    socketOBD2Connection.connect()
})

// Stop Vehicle Live Data
app.post('/stopMonitorVehicle', (req, res) => {
    // Elimina los posibles manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('disconnected')

    socketOBD2Connection.once('disconnected', () => {
        console.log('Deteniendo emision de comandos.')
        res.status(200).send('Command cycle stopped!')
        console.log("Desconectado del adaptador OBDII ELM327.")
        sendingCommands = null
    })

    if (socketOBD2Connection) {
        socketOBD2Connection.disconnect();
        socketOBD2Connection = null;
    }

    // Detener ahora el ciclo de comandos
    sendingCommands.stopCommandCycle()
})

// Start CAN Bus sniffing
app.post('/startSniffer', (req, res) => {
    const range = req.body.range
    const host = req.body.option.host
    const port = req.body.option.port
    let filter, mask;

    // Verifica si customRange está definido antes de acceder a sus propiedades
    if (req.body.customRange) {
        filter = req.body.customRange.filter
        mask = req.body.customRange.mask
    }

    console.log(`Rango: ${range}`)
    let snifferCommandsList
    switch(range) {
        case 'first':
            snifferCommandsList = firstFilterList
            break
        case 'second':
            snifferCommandsList = secondFilterList
            break
        case 'third':
            snifferCommandsList = thirdFilterList
            break
        case 'fourth':
            snifferCommandsList = fourthFilterList
            break
        case 'fifth':
            snifferCommandsList = fifthFilterList
            break
        case 'sixth':
            snifferCommandsList = sixthFilterList
            break
        case 'seventh':
            snifferCommandsList = seventhFilterList
            break
        case 'eighth':
            snifferCommandsList = eighthFilterList
            break
        case 'custom':
            // Asegurarse de que filter y mask están definidos antes de usarlos
            if (filter && mask) {
                snifferCommandsList = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', `AT CF ${filter}\r`, `AT CM ${mask}\r`, 'AT MA\r']
            } else {
                res.status(400).send('Filtro o máscara no definidos')
                return
            }
            break
        default:
            res.status(400).send('Invalid range')
            return
    }

    if (!socketOBD2Connection) {
        socketOBD2Connection = new SocketOBD2Connection(host, port)
    }
    sendingCommands = new SendingSnifferCommands(socketOBD2Connection, snifferCommandsList)
    // Elimina los manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('connected')
    socketOBD2Connection.removeAllListeners('disconnected')
    socketOBD2Connection.removeAllListeners('error')

    // Manejadores de eventos
    socketOBD2Connection.once('error', (err) => {
        console.log("Error al enviar los comandos.")
        res.status(400).send('Error: ' + err.message)
        socketOBD2Connection.disconnect()
        socketOBD2Connection = null
        sendingCommands = null
    })

    socketOBD2Connection.once('connected', () => {
        console.log('Comenzando emision de comandos.')
        res.status(200).send('Command cycle started!')
        sendingCommands.startCommandCycle()
    })

    socketOBD2Connection.once('disconnected', () => {
        console.log("Desconectado del adaptador OBDII ELM327. Time Out")
        // Emitir un evento de 'desconexión' usando el socketIO global en lugar de enviar una respuesta HTTP
        const socket = global.connectedSocket
        socket.emit('disconnection', "Socket Connection Timeout")
        sendingCommands = null
        socketOBD2Connection = null
    })

    // Conectarse al socket
    socketOBD2Connection.connect()
})

app.post('/stopSniffer', (req, res) => {
    if (!socketOBD2Connection) {
        console.log('Socket desconectado.')
        res.status(400).send('The process has been halted. You may now proceed.')
        return
    }

    // Elimina los posibles manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('disconnected')

    socketOBD2Connection.once('disconnected', () => {
        console.log('Deteniendo emision de comandos.')
        res.status(200).send('Command cycle stopped!')
        console.log("Desconectado del adaptador OBDII ELM327.")
        sendingCommands = null
        socketOBD2Connection = null
    })

    socketOBD2Connection.send('$\r')
    // Añade un retardo antes de desconectar el socket
    setTimeout(() => {
        socketOBD2Connection.disconnect()
    }, 1500)  // Ajusta el retardo según sea necesario
})

app.post('/sniffECU', (req, res) => {
    const ecu = req.body.ecu
    const host = req.body.option.host
    const port = req.body.option.port
    let sniffSingleECUCommands = ['AT WS\r', 'AT E0\r', 'AT L1\r', 'AT H1\r', 'AT S0\r', 'AT CSM0\r', `AT CRA ${ecu}\r`, 'AT MA\r'] 
    if (!socketOBD2Connection) {
        socketOBD2Connection = new SocketOBD2Connection(host, port)
    }
    sendingCommands = new SendingSnifferCommands(socketOBD2Connection, sniffSingleECUCommands)
    // Elimina los manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('connected')
    socketOBD2Connection.removeAllListeners('disconnected')
    socketOBD2Connection.removeAllListeners('error')

    // Manejadores de eventos
    socketOBD2Connection.on('error', (err) => {
        console.log("Error al enviar los comandos.")
        socketOBD2Connection.disconnect()
        socketOBD2Connection = null
        sendingCommands = null
    })

    socketOBD2Connection.once('connected', async () => {
        console.log(`Monitoring ${ecu}`)
        console.log('Comenzando emision de comandos.')
        try {
            await sendingCommands.startCommandCycle();
            res.status(200).send('Sniffing Single Command!')
        } catch (err) {
            console.log("Error durante el envio de comandos.")
            res.status(500).send('Error: ' + err.message)
            socketOBD2Connection.disconnect()
            socketOBD2Connection = null
            sendingCommands = null
        }
    })

    socketOBD2Connection.on('disconnected', () => {
        console.log("Desconectado del adaptador OBDII ELM327.")
        // Emitir un evento de 'desconexión' usando el socketIO global en lugar de enviar una respuesta HTTP
        const socket = global.connectedSocket
        socket.emit('disconnectionOnSingleSniff', "An error has occurred, which may have been caused by a timeout. Press 'Stop' and try again")
        socketOBD2Connection = null
        sendingCommands = null
    })

    // Conectarse al socket
    socketOBD2Connection.connect()
})

// Database Models
const Project = require('./models/vehicle_model')

/* Vehicle Database Endpoints */

// Saving Project to MongoDB database
app.post('/project/new', async (req, res) => {
    const project = new Project({ 
        _id: new mongoose.Types.ObjectId(),
        projectName: req.body.projectName,
        deviceHost: req.body.deviceHost,
        devicePort: req.body.devicePort,
        vin: req.body.vin,
        make: req.body.make,
        model: req.body.model,
        modelYear: req.body.modelYear,
        vehicleType: req.body.vehicleType,
        doors: req.body.doors,
        engineCylinders: req.body.engineCylinders,
        diagramData: req.body.diagramData
    })
    try {
        await project.save()
        res.status(200).send('Vehicle Information Saved!')
        console.log('New Vehicle Information Saved!')
    } catch (error) {
        res.status(500).send('Error saving the project: ' + error.message)
        console.log("Error saving vechicle information:" + error.message)
    }
})

// Get all the projects from database
app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find()
        res.json(projects)
    } catch (error) {
        res.status(500).send('Error fetching projects: ' + error.message)
        console.log("Error fectching vechicle information:" + error.message)
    }
})  

// Get specific project from the database by project id
app.get('/project/:id', async (req, res) => {
    const projectId = req.params.id
    console.log(`Project ID: ${projectId}`)
    try {
        const project = await Project.findById(projectId)
        if (project) {
            res.json(project)
        } else {
            res.status(404).send('Project not found')
        }
    } catch (error) {
        res.status(500).send('Error fetching the project: ' + error.message)
        console.log("Error fectching vechicle information:" + error.message)
    }
})

// Update project
app.post('/project/update/:id', async (req, res) => {
    const projectId = req.params.id
    const newData = req.body
    console.log(`ID del proyecto a actualizar: ${projectId}`)
    try {
        const project = await Project.findOneAndUpdate({ _id: projectId }, newData, { new: true })
        if (project) {
            res.status(200).send('Vehicle Information Updated!')
            console.log('Vehicle Information Updated!')
        } else {
            res.status(404).send('Project not found. No changes were made.')
        }

    } catch (error) {
        res.status(500).send('Error updating the project: ' + error.message)
        console.log("Error fectching vechicle information:" + error.message)
    }
})
  
// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the MONGODB CAN Bus database")).catch(console.error)

httpServer.listen(HTTPPORT, () => {
    console.log(`Server is running on port: ${HTTPPORT}`)
})