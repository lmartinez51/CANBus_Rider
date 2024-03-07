const HTTPPORT = 8080
const can = require('socketcan')
const fs = require('fs')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const httpServer = require('http').Server(app)
require('dotenv').config()
const MONGODBURI = process.env.MONGODBURI
const { connectToObd } = require('./modules/ODBIIConnSetup')
const play = require('./modules/playPackets')
const viewFile = require('./modules/streamRawFile')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
//const { setupSocketIO } = require('./modules/socketIOSetup')
//const { setupSocketCAN } = require('./modules/socketcanSetup')
//const saveRawPackets = require('./modules/dataSaver')
const io = require("socket.io")(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		allowedHeaders: ["my-custom-header"],
		credentials: true
	  },
	  pingTimeout: 90000,
})

let pid = ''
//let now = new Date()
let fileName = ''
let filters= []

app.use(express.json())
app.use(cors())

app.post('/playground', chatAssistant.createChatCompletion)
//setupSocketIO(httpServer)
//setupSocketCAN()

io.on('connection', (socket) => {
	console.log(`Client Connected: ${socket.id}`)  
	// Almacenar el socket en una variable global o similar
	global.connectedSocket = socket;
	socket.on('disconnect', ()=> {
		console.log("Client Disconnected")
	})
})

// Parse CAN signals database
var network = can.parseNetworkDescription("./dbc-files/j1939.kcd")
//Create channel to listen interface vcan0
var channel = can.createRawChannel('vcan0',true)
var db_bus = new can.DatabaseService(channel, network.buses["Private"])
// Start listening channel
channel.start()
// Save raw packets
//saveRawPackets() // This works to save raw packets in a file. Just uncomment const saveRawPackets on top of this file

//Listen for messgages to dump it into a file
// channel.addListener("onMessage", dumpPacket)

//Helper function. Emulates candump -L 
// function toHex(number) {
// 	return ("00000000" + number.toString(16)).slice(-8);
// }

// Dump raw packets to file
// function dumpPacket(msg) {
// 	let timestamp = now.toISOString().replace(/[-:.]/g, '')
// 	let filename = './packets/' + timestamp + '.log'
// 	let writeStream = fs.createWriteStream(filename, {flags: 'a'});
// 	let data = '(' + (msg.ts_sec + msg.ts_usec / 1000000).toFixed(6) + ')  ' + 'vcan0  ' +
// 	toHex(msg.id).toUpperCase() + '  [8]  ' + msg.data.toString('hex').toUpperCase() + '\r\n';
// 	writeStream.write(data) //This works perfectly to write the stream on a file
// 	writeStream.end()
  
// 	// This is here incase any errors occur
// 	writeStream.on('error', function (err) {
// 	  console.log(err)
// 	})
// }

// Recieve file name from the front-end
app.post('/upload', (req, res) => {
	fileName = req.body.params.fileName
	filters = req.body.params.filters
	console.log(`File name to process: ${fileName}`)
	res.status(200).send({ message: 'File name and filters received' })
})

app.get('/play', (req, res) => {
  play(req, res, fileName, filters)
})

app.get('/viewFile', (req, res) => {
	resetDecodedInfo()
	const socket = global.connectedSocket
	if (socket) socket.emit('message', decodedInfo)
	viewFile(req, res, fileName)
})

//Connecting to virtual can bus interface 29-bit
app.get('/vcan', (req,res) => {
	const device = req.query.CAN;
	vcanconfig.initializeVirtualCAN(device)
	pid = startcangen.cangen(device)
	res.send("Virtual CAN Bus 29-bits initialized")
})

app.get('/can', (req, res) => {
    res.send('Intentando conectar al adaptador OBDII ELM327...')
	connectToObd()
})

//Store Decoded Information in a list. Initial default values
let decodedInfo = {
	revs: 0,
	dist: 0,
	speed: 0,
	engCoolantTemp: 0,
	fuelLevel: 100,
	engLamp: 0,
	hazardLamp: 0
};
  
// Inicializa una variable para almacenar el último momento en que se recibió una señal
let lastSignalTime = Date.now();
  
// Inicializa un temporizador
let timer = null;
  
// Función para resetear todos los valores a cero, excepto fuelLevel que se resetea a 100
function resetDecodedInfo() {
	for (let key in decodedInfo) {
	  if (key === 'fuelLevel') {
	    decodedInfo[key] = 100;
	  } else {
	    decodedInfo[key] = 0;
	  }
	}
}

function handleSignalUpdate(value, key, socket) {
    clearTimeout(timer); // Cancela el temporizador anterior
    lastSignalTime = Date.now(); // Actualiza el último momento en que se recibió una señal

    if (key === 'revs') {
        const roundedValue = Math.round(value);
        if (decodedInfo[key] !== undefined && Math.abs(roundedValue - decodedInfo[key]) <= 2) {
            // Si el nuevo valor es solo mayor en dos unidades o menos, no emitir mensaje (no es necesario emitir tantos mensajes)
            return;
        }
        decodedInfo[key] = roundedValue;
    } else {
        decodedInfo[key] = Math.round(value);
    }

    if (socket) socket.emit('message', decodedInfo);

    // Inicia un nuevo temporizador, en caso que no se reciban valores despues de 5 sec, limpiar decodedInfo
    timer = setTimeout(() => {
        resetDecodedInfo();
    }, 5000);
}


//Register a listener to get any value updates
db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'revs', socket);
})

db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'speed', socket);
})
 
db_bus.messages["VDHR"].signals["HghRslutionTotalVehicleDistance"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'dist', socket);
})
 
db_bus.messages["ET1"].signals["EngCoolantTemp"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'engCoolantTemp', socket);
})

db_bus.messages["DD"].signals["FuelLevel1"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'fuelLevel', socket);
})

db_bus.messages["DLCC1"].signals["EngRedStopLampCmd"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'engLamp', socket);
})

db_bus.messages["OEL"].signals["HazardLightSwitch"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'hazardLamp', socket);
})

db_bus.messages["OEL"].signals["HazardLightSwitch"].onUpdate(function(s, socket = global.connectedSocket) {
	handleSignalUpdate(s.value, 'hazardLamp', socket);
})

/* Esta seccion es para imprimir las senales en la terminal
// Asegurarse de poner todas las senales de cada mensaje para no ver tantos mensajes de error
db_bus.messages["ASC1"].signals["DoorRelease"].onUpdate(function(s) {
    console.log("Door Release: " + (s.value === 1 ? "Door Opened" : s.value === 0 ? "Door closed" : "Not available"));
})

db_bus.messages["EEC2"].signals["AccelPedalPos2"].onUpdate(function(s) {
    console.log("Accelerator Pedal 2 Position: " + s.value)
})

db_bus.messages["EEC2"].signals["RemoteAccelPedalPos"].onUpdate(function(s) {
    console.log("Remote Accelerator Pedal Position: " + s.value)
})

db_bus.messages["EEC2"].signals["AccelPedalPos1"].onUpdate(function(s) {
    console.log("Accelerator Pedal Position: " + s.value)
})

db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate(function(s) {
    console.log("Engine Speed: " + s.value)
})

db_bus.messages["CCVS"].signals["CruiseCtrlActive"].onUpdate(function(s) {
	console.log("Cruise Control: " + s.value)
})

db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate(function(s) {
    console.log("Wheel Based Vehicle Speed: " + s.value)
})

db_bus.messages["CCVS"].signals["CruiseCtrlSetSpeed"].onUpdate(function(s) {
    console.log("Cruise Control Set Speed: " + s.value)
})

db_bus.messages["CCVS"].signals["ParkingBrakeSwitch"].onUpdate(function(s) {
	console.log("Parking Brake Switch: " + s.value)
})

db_bus.messages["CCVS"].signals["BrakeSwitch"].onUpdate(function(s) {
	console.log("Brake Switch: " + s.value)
})

db_bus.messages["CCVS"].signals["ClutchSwitch"].onUpdate(function(s) {
	console.log("Clutch Switch: " + s.value)
})

db_bus.messages["VD"].signals["TotalVehicleDistance"].onUpdate(function(s) {
    console.log("Total Vehicle Distance: " + s.value)
})

db_bus.messages["VD"].signals["TripDistance"].onUpdate(function(s) {
	console.log("Trip Distance: " + s.value)
}) */

// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the MONGODB CAN Bus database")).catch(console.error)

httpServer.listen(HTTPPORT, () => {
    console.log(`Server is running on port: ${HTTPPORT}`)
})