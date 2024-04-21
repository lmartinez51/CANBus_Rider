const axios = require('axios');
const https = require('https');

async function getVehicleDetails(VIN) {
    // Verificar si el VIN tiene 17 caracteres
    if (VIN.length !== 17) {
        console.log("VIN Inválido");
        return {
            "Make": "N/A",
            "Model": "N/A",
            "Model Year": "N/A",
            "Vehicle Type": "N/A",
            "Doors": "N/A",
            "Engine Number of Cylinders": "N/A"
        };
    }

    try {
        const agent = new https.Agent({  
            keepAlive: true
        });
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${VIN}?format=json`, {
            timeout: 60000,  // Tiempo de espera de 5 segundos
            httpsAgent: agent
        });
        const data = response.data.Results;
        const details = {};

        for (let item of data) {
            switch (item.Variable) {
                case 'Make':
                    details.Make = item.Value;
                    break;
                case 'Model':
                    details.Model = item.Value;
                    break;
                case 'Model Year':
                    details['Model Year'] = item.Value;
                    break;
                case 'Vehicle Type':
                    details['Vehicle Type'] = item.Value;
                    break;
                case 'Doors':
                    details.Doors = item.Value;
                    break;
                case 'Engine Number of Cylinders':
                    details['Engine Number of Cylinders'] = item.Value;
                    break;
            }
        }
        return details;
    } catch (error) {
        console.error(error);
        return {
            "Make": "N/A",
            "Model": "N/A",
            "Model Year": "N/A",
            "Vehicle Type": "N/A",
            "Doors": "N/A",
            "Engine Number of Cylinders": "N/A"
        };
    }
}

// Exportar la función
module.exports = {getVehicleDetails};