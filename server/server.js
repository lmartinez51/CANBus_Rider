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
const play = require('./modules/playPackets')
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
const chatAssistant = require('./chatAssistant')
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

let now = new Date()
let fileName = ''

app.use(express.json())
app.use(cors())

app.post('/playground', chatAssistant.createChatCompletion)

io.on('connection', (socket) => {
	console.log(`Client Connected: ${socket.id}`)

	socket.on('disconnect', ()=> {
		console.log("Client Disconnected")
	})

	setInterval(() => {
		socket.emit('message', decodedInfo)
	}, 2.75);
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
channel.addListener("onMessage", dumpPacket)

//Helper function. Emulates candump -L 
function toHex(number) {
	return ("00000000" + number.toString(16)).slice(-8);
}

// Dump raw packets to file
function dumpPacket(msg) {
	let timestamp = now.toISOString().replace(/[-:.]/g, '')
	let filename = './packets/' + timestamp + '.log'
	let writeStream = fs.createWriteStream(filename, {flags: 'a'});
	let data = '(' + (msg.ts_sec + msg.ts_usec / 1000000).toFixed(6) + ')  ' + 'vcan0  ' +
	toHex(msg.id).toUpperCase() + '  [8]  ' + msg.data.toString('hex').toUpperCase() + '\r\n';
	writeStream.write(data) //This works perfectly to write the stream on a file
	writeStream.end()
  
	// This is here incase any errors occur
	writeStream.on('error', function (err) {
	  console.log(err)
	})
}

// Recieve file name from the front-end
app.post('/upload', (req, res) => {
	fileName = req.body.params.fileName
	console.log(`File name: ${fileName}`)
	res.status(200).send({ message: 'File name received' })
  })

app.get('/play', (req, res) => {
  play(req, res, fileName)
})

//Connecting to virtual can bus interface 29-bit
app.get('/vcan', (req,res) => {
	const device = req.query.CAN;
	vcanconfig.initializeVirtualCAN(device)
	startcangen.cangen(device)
	res.send("Virtual CAN Bus 29-bits initialized")
})

//Store Decoded Information in a list
var decodedInfo ={}
decodedInfo.revs = 0
decodedInfo.dist = 0
decodedInfo.torque = 0
decodedInfo.additional = 0
decodedInfo.drv = 0
decodedInfo.starter = 0
decodedInfo.tmode = 0
decodedInfo.address = 0
decodedInfo.demand = 0
decodedInfo.trip = 0
decodedInfo.speed = 0
decodedInfo.cruisectrl = 0
decodedInfo.parking = 0

//Register a listener to get any value updates
db_bus.messages["EEC1"].signals["ActualEngPercentTorque"].onUpdate(function(s) {
	decodedInfo.torque=(s.value)
})
 
db_bus.messages["EEC1"].signals["ActlEngPrcntTrqueHighResolution"].onUpdate(function(s) {
	decodedInfo.additional=(s.value)
})
 
db_bus.messages["EEC1"].signals["DriversDemandEngPercentTorque"].onUpdate(function(s) {
	decodedInfo.drv=(s.value)
})
 
db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate(function(s) {
	 decodedInfo.revs=(s.value)
})
 
db_bus.messages["EEC1"].signals["EngStarterMode"].onUpdate(function(s) {
	decodedInfo.starter=(s.value)
})
 
db_bus.messages["EEC1"].signals["EngTorqueMode"].onUpdate(function(s) {
	decodedInfo.tmode=(s.value)
})
 
db_bus.messages["EEC1"].signals["SrcAddrssOfCtrllngDvcFrEngCntrl"].onUpdate(function(s) {
	decodedInfo.address=(s.value)
})
 
db_bus.messages["EEC1"].signals["EngDemandPercentTorque"].onUpdate(function(s) {
	decodedInfo.demand=(s.value)
})
 
db_bus.messages["VDHR"].signals["HghRslutionTotalVehicleDistance"].onUpdate(function(s) {
	 decodedInfo.dist=(s.value)
})
 
db_bus.messages["VDHR"].signals["HighResolutionTripDistance"].onUpdate(function(s) {
	decodedInfo.trip=(s.value)
});
 
db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate(function(s) {
	decodedInfo.speed=(s.value)
})

db_bus.messages["CCVS"].signals["CruiseCtrlActive"].onUpdate(function(s) {
	decodedInfo.cruisectrl=(s.value)
})

db_bus.messages["CCVS"].signals["ParkingBrakeSwitch"].onUpdate(function(s) {
	decodedInfo.parking=(s.value)
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