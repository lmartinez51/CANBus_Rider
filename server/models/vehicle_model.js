const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Schema definition
const vehicleSchema = new Schema({
    _id: Schema.Types.ObjectId,
    vin: {
		type: String,
        unique:true,
		required: true
	},
    projectName: {
        type: String,
        required: true,
    },
    deviceHost: {
        type: String,
        required: true
    },
    devicePort: {
        type: String,
        required: true,
    },

    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    modelYear: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    doors: {
        type: String,
        required: true
    },
    engineCylinders: {
        type: String,
        required: true
    },
    diagramData: {
        type: String,
        required: true
    }
})

//Export model
const Project = mongoose.model("Project", vehicleSchema)
module.exports = Project