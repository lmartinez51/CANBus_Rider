const PORT = 3001
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/candb').then(() => console.log("Connected to database")).catch(console.error)

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})