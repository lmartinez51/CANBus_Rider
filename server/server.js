const PORT = 3001
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
require('dotenv').config()
const MONGODBURI = process.env.MONGODBURI
const vcanconfig = require('./modules/vcanconfig')
const startcangen = require('./modules/cangen')
let pid = ''

app.use(express.json())
app.use(cors())

//Connecting to virtual can bus interface 29-bit
app.get('/vcan', (req,res) => {
	const device = req.query.CAN;
	vcanconfig.initializeVirtualCAN(device);
	pid = startcangen.cangen(device);
	res.send("Virtual CAN Bus 29-bits initialized");
});

// Connect to MongoDB
mongoose.connect(MONGODBURI).then(() => console.log("Connected to the CAN Bus database")).catch(console.error)

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})