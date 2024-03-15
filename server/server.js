require('dotenv').config()
const HTTPPORT = 8080
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const httpServer = require('http').Server(app)
const MONGODBURI = process.env.MONGODBURI
const initializationCommandsList = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r']
const monitoringCommandsList = ['AT WS\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '01 05 1\r', '01 0C 1\r', '01 0D 1\r'] //Multiple PID request in one line - Coolant Temp and Engine Revs
const SocketOBD2Connection = require('./modules/socketOBD2Connection')
const SendingCommands = require('./modules/sendingCommands')
const play = require('./modules/playPackets')
const viewFile = require('./modules/streamRawFile')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
const { setupSocketIO } = require('./modules/socketIOSetup')
const { SocketCANSetup } = require('./modules/socketcanSetup')
const socketOBD2Connection = new SocketOBD2Connection()
//const socketOBD2Connection2 = new SocketOBD2Connection()

let pid = ''
let fileName = ''
let filters= []

// Dummy data to test connection
//let carInfo = {
//     adapterVer: 'ELM328 v2.3', 
//     protocol: 'Auto', 
//     vin: '3N1B35754099',
//     processStatus: true
// };
// Dummy data to test connection
// let monitorInfo = {
//     temp: 100,
//     revs: 7000,
//     speed: 180
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

// Capture ELM327 OBD2 WiFi adapter connection errors.
socketOBD2Connection.on('error', (err) => {
    console.log('Error:', err.message);
})

// Connect to the ELM327 OBD2 WiFi adapter
app.get('/connectOBD2', (req, res) => {
    let initCommands = new SendingCommands(socketOBD2Connection, initializationCommandsList)
    // Primero, configurar los manejadores de eventos

    // Si ocurre un error durante la conexión, envía una respuesta con el estado 500 y el mensaje de error.
    socketOBD2Connection.once('error', (err) => {
        res.status(500).send('Error: ' + err.message);
        // Remove after testint dummy data is done
        // const socket = global.connectedSocket
        // if(socket) {
        //     socket.emit('obdData', carInfo);
        //     console.log(carInfo)
        // }
    });

    // Si la conexión es exitosa, envía un comando y luego envía una respuesta con el estado 200 y el mensaje 'Successful Connection!'.
    socketOBD2Connection.once('connected', () => {
        console.log('Conexion exitosa!')
        res.status(200).send('Successful Connection!');
        initCommands.sendCommand();
    });

    socketOBD2Connection.on('disconnected', () => {
        console.log("Cerrando conexion...");
        initCommands = null;
        // socketOBD2Connection.removeAllListeners('error');
        // socketOBD2Connection.removeAllListeners('connected');
        // socketOBD2Connection.removeAllListeners('disconnected');

    })

    // Luego, establecer la conexión
    socketOBD2Connection.connect();
})

// Capture ELM327 OBD2 WiFi adapter connection errors. 2nd Connection. Si solo realizo una sola conexion no necesito otro
// socketOBD2Connection.on('error', (err) => {
//     console.log('Error:', err.message);
// })

app.get('/monitorVehicle', (req, res) => {
    let monitoringCommands = new SendingCommands(socketOBD2Connection, monitoringCommandsList)

    // Si ocurre un error durante la conexión, envía una respuesta con el estado 500 y el mensaje de error.
    socketOBD2Connection.once('error', (err) => {
        res.status(500).send('Error: ' + err.message);
        // Remove after testint dummy data is done
        //const socket = global.connectedSocket
        // if(socket) {
        //     socket.emit('monitorData', monitorInfo);
        //     console.log(monitorInfo)
        // }
    });

    // Si la conexión es exitosa, envía un comando y luego envía una respuesta con el estado 200 y el mensaje 'Successful Connection!'.
    socketOBD2Connection.once('connected', () => {
        console.log('Segunda Conexion exitosa!')
        monitoringCommands.sendCommand();
        res.status(200).send('Successful Connection!');
    });

    socketOBD2Connection.on('disconnected', () => {
        console.log("Cerrando conexion.");
        monitoringCommands = null;

    })

    // Luego, establecer la conexión
    socketOBD2Connection.connect();
})

// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the MONGODB CAN Bus database")).catch(console.error)

httpServer.listen(HTTPPORT, () => {
    console.log(`Server is running on port: ${HTTPPORT}`)
})