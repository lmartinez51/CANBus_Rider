require('dotenv').config()
const HTTPPORT = 8080
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const httpServer = require('http').Server(app)
const MONGODBURI = process.env.MONGODBURI
const initializationCommandsList = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r']
const monitoringCommandsList = ['AT RV\r', '01 05 1\r', '01 0C 1\r', '01 0D 1\r', '01 2F 1\r'] //Multiple PID request in one line - Coolant Temp and Engine Revs
const troubleCodeList = ['AT WS\r', 'AT E0\r', 'AT H0\r', '01 01\r', '03\r']
const canCommandsList = ['AT WS\r', 'AT L1\r', 'AT H1\r', 'AT E0\r', 'AT S1\r', 'AT AL\r', 'AT CSM0\r', 'AT CRA 60D\r', 'AT MA\r']
const stopCommand = ['S\r']
const SocketOBD2Connection = require('./modules/socketOBD2Connection')
const SendingInitialCommands = require('./modules/InitializationCommands')
const SendingMonitorCommands = require('./modules/MonitorCommands')
const SendingTroubleCodesCommands = require('./modules/TroubleCodesCommands')
const play = require('./modules/playPackets')
const viewFile = require('./modules/streamRawFile')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
const { setupSocketIO } = require('./modules/socketIOSetup')
const { SocketCANSetup } = require('./modules/socketcanSetup')
//const socketOBD2Connection3 = new SocketOBD2Connection()
//const { getVehicleDetails } = require('./modules/vinDecoder')

let pid = ''
let fileName = ''
let filters= []
let socketOBD2Connection
let sendingCommands

// Dummy data to test connection
//let carInfo = {
//     adapterVer: 'ELM327 v2.1', 
//     protocol: 'ISO 15765-4 CAN 11/500', 
//     vin: '3N1AB7AP6EY234095',
//     processStatus: true
// }
// Dummy data to test connection
// let monitorInfo = {
//     temp: 100,
//     revs: 7000,
//     speed: 180,
//     fuel: 75,
//     voltage: '12.6V'
// }

app.use(express.json())
app.use(cors())

setupSocketIO(httpServer)

const socketCANSetup = new SocketCANSetup();
socketCANSetup.setup();

// Run the AI Assistant
app.post('/playground', chatAssistant.createChatCompletion)

// Recieve file name from the front-end
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

// View file only
app.get('/viewFile', (req, res) => {
    socketCANSetup.resetDecodedInfo(); // Primero reseteas los valores
    const decodedInfo = socketCANSetup.getDecodedInfo(); // Luego obtienes los valores reseteados
	const socket = global.connectedSocket
	if (socket) socket.emit('message', decodedInfo)
	viewFile(req, res, fileName)
})

// Connecting to virtual can bus interface 29-bit
app.get('/vcan', (req,res) => {
	const device = req.query.CAN;
	vcanconfig.initializeVirtualCAN(device)
	pid = startcangen.cangen(device)
	res.send("Virtual CAN Bus 29-bits initialized")
})


app.post('/connectOBD2', (req, res) => {
    socketOBD2Connection = new SocketOBD2Connection()
    sendingCommands = new SendingInitialCommands(socketOBD2Connection, initializationCommandsList)
    // Define los manejadores de eventos
    const errorHandler = async (err) => {
        console.log('Error:', err.message);
        res.status(500).send('Error: ' + err.message);
        // Comment/Uncomment only for testing dummy data.. Also remove the word async from the function
        // const vinInfo = await getVehicleDetails('3N1AB7AP6EY234095')
        // const socket = global.connectedSocket
        // if(socket) {
        //     socket.emit('obdData', carInfo)
        //     socket.emit('vinData', vinInfo)
        // }
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
        console.log("Desconectado del adaptador OBDII ELM327 WiFi.")
        sendingCommands = null
        socketOBD2Connection = null
    });

    // Luego, establecer la conexión
    socketOBD2Connection.connect()
})

app.post('/diagnostics', (req, res) => {
    socketOBD2Connection = new SocketOBD2Connection()
    sendingCommands = new SendingTroubleCodesCommands(socketOBD2Connection, troubleCodeList)
    // Define los manejadores de eventos
    const errorHandler = async (err) => {
        console.log('Error:', err.message);
        res.status(500).send('Error: ' + err.message);
    }
    const connectedHandler = () => {
        console.log('Iniciando Diagnosticos')
        res.status(200).send('Getting Diagnostics!')
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
        console.log("Desconectado del adaptador OBDII ELM327 WiFi.")
        sendingCommands = null
        socketOBD2Connection = null
    })

    // Luego, establecer la conexión
    socketOBD2Connection.connect()

})

app.post('/startMonitorVehicle', (req, res) => {
    if (!socketOBD2Connection) {
        socketOBD2Connection = new SocketOBD2Connection();
    }
    ///const socketOBD2Connection = new SocketOBD2Connection()
    sendingCommands = new SendingMonitorCommands(socketOBD2Connection, monitoringCommandsList)
    // Elimina los manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('connected')
    socketOBD2Connection.removeAllListeners('disconnected')
    socketOBD2Connection.removeAllListeners('error')

    socketOBD2Connection.once('error', (err) => {
        console.log("Error al enviar los comandos.")
        res.status(500).send('Error: ' + err.message)
        // const socket = global.connectedSocket
        // if(socket) {
        //     socket.emit('monitorData', monitorInfo)
        // }
    })

    socketOBD2Connection.once('connected', () => {
        console.log('Comenzando emision de comandos.')
        res.status(200).send('Command cycle started!')
        sendingCommands.startCommandCycle()
    })

    socketOBD2Connection.on('disconnected', () => {
        console.log("Desconectado del adaptador OBDII ELM327 WiFi.")
    })

    // Conectarse al socket
    socketOBD2Connection.connect()
})

app.post('/stopMonitorVehicle', (req, res) => {
    // Elimina los posibles manejadores de eventos existentes
    socketOBD2Connection.removeAllListeners('disconnected')

    socketOBD2Connection.once('disconnected', () => {
        console.log('Deteniendo emision de comandos.')
        res.status(200).send('Command cycle stopped!')
        console.log("Desconectado del adaptador OBDII ELM327 WiFi.")
        sendingCommands = null
    })

    if (socketOBD2Connection) {
        socketOBD2Connection.disconnect();
        socketOBD2Connection = null;
    }

    // Detener ahora el ciclo de comandos
    sendingCommands.stopCommandCycle()
})

// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the MONGODB CAN Bus database")).catch(console.error)

httpServer.listen(HTTPPORT, () => {
    console.log(`Server is running on port: ${HTTPPORT}`)
})