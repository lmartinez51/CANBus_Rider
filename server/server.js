const HTTPPORT = 8080
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const httpServer = require('http').Server(app)
require('dotenv').config()
const MONGODBURI = process.env.MONGODBURI
const initializationCommandsList = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r'];
const SocketOBD2Connection = require('./modules/socketOBD2Connection');
const InitializationCommands = require('./modules/InitializationCommands');
const play = require('./modules/playPackets')
const viewFile = require('./modules/streamRawFile')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
const { setupSocketIO } = require('./modules/socketIOSetup')
const { SocketCANSetup } = require('./modules/socketcanSetup');
const socketOBD2Connection = new SocketOBD2Connection();
const initializationCommands = new InitializationCommands(socketOBD2Connection, initializationCommandsList);

let pid = ''
let fileName = ''
let filters= []

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
    console.log('Error: ', err.message);
});

// Connect to the ELM327 OBD2 WiFi adapter
app.get('/connectOBD2', (req, res) => {
    socketOBD2Connection.connect().then(() => {
        socketOBD2Connection.on('connected', () => {
            initializationCommands.sendCommand().then(() => {
                res.status(200).send('Successful Connection!');
            }).catch((err) => {
                res.status(500).send('Error: ' + err.message);
            });
        });
        initializationCommands.on('commandError', (err) => {
            res.status(500).send('Error: ' + err.message);
        });
    }).catch((err) => {
        res.status(500).send('Error: ' + err.message);
    });
});

// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the MONGODB CAN Bus database")).catch(console.error)

httpServer.listen(HTTPPORT, () => {
    console.log(`Server is running on port: ${HTTPPORT}`)
})