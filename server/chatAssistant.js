require('dotenv').config("./.env")
const axios = require('axios');
const { response } = require('express');
const {OpenAI} = require("openai")
const openai = new OpenAI({
	apiKey: process.env.CHATGPT_API_KEY
})
const canWizardID = process.env.CAN_WIZARD_ID
const user = "Lorenzo"
let conversations = {}

class Contacts {
    constructor() {
        this.contacts = new Set();
    }

    add_contacts(contact) {
        this.contacts.add(contact);
    }

    search_names(contact) {
        let ordered_contacts = Array.from(this.contacts).sort();
        console.log(`Connected contacts: ${ordered_contacts}`);
        return this.contacts.has(contact);
    }
}

const contacts = new Contacts()

let self = module.exports = {
    async createChatCompletion(req, res) {
        try {
            // Step 1: Retrive the assisant. (I already have the assistant ID)
            let check_user = contacts.search_names(user)
            let user_thread;
            if (check_user) {
                console.log(`Usuario encontrado: ${user}`)
                await self.create_message(conversations[user], req.body.message)
            } else {
                console.log('Usuario no encontrado. Creando nuevo usuario...')
                contacts.add_contacts(user)
                // Step 2, 3: Create a thread and then a message
                user_thread = await self.create_thread(user, req.body.message)
            }
            //Step 4, 5: Run the assistant and check the status
            await self.run_assistant(conversations[user], canWizardID)
            // Step 6: Display the Assistant's Response
            const url = `https://api.openai.com/v1/threads/${conversations[user]}/messages`
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            }
            await self.delay(5000);  // Wait for 5 seconds (Suppose to fix failed errors)
            let response = await axios.get(url, { headers: headers })
            console.log(`Assitant response: ${response.data.data[0].content[0].text.value}`)
            res.send({ message: response.data.data[0].content[0].text.value })
        } catch (error) {
            console.log(error)
        }
    },

    async create_thread(user, context) {
        const url = 'https://api.openai.com/v1/threads'
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
            'OpenAI-Beta': 'assistants=v1'
        }
        try {
            const response = await axios.post(url, {}, { headers: headers })
            const user_thread = response.data
            await self.create_message(user_thread.id, context)
            conversations[user] = user_thread.id
            return user_thread
        } catch (error) {
            console.error(error)
        }
    },

    async create_message(thread_id, context) {
        const url = `https://api.openai.com/v1/threads/${thread_id}/messages`
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
            'OpenAI-Beta': 'assistants=v1'
        }
        const data = {
            "role": "user",
            "content": context
        }   
        try {
            await axios.post(url, data, { headers: headers })
        } catch (error) {
            console.error(error)
        }
    },
    
    async run_assistant(user_thread_id, assistant_id) {
        const url = `https://api.openai.com/v1/threads/${user_thread_id}/runs`
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
            'OpenAI-Beta': 'assistants=v1'
        }
        const data = {
            'assistant_id': assistant_id
        }
        try {
            const response = await axios.post(url, data, { headers: headers })
            let run  = response.data
            console.log(`Asistente corriendo: \n ${run.id}`)
            /* Retrieve Run End Point */
            const run_url = `https://api.openai.com/v1/threads/${user_thread_id}/runs/${run.id}`
            const run_headers = {
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            }
            const action_url = `https://api.openai.com/v1/threads/${user_thread_id}/runs/${run.id}/submit_tool_outputs`
            const action_headers = {
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
                'OpenAI-Beta': 'assistants=v1'
            }
            while (true) {
                try {
                    run = await axios.get(run_url, { headers: run_headers })
                    console.log(`Status Actual: ${run.data.status}`)
                } catch (error) {
                    console.error(error)
                    // Consider adding error handling logic here
                }
                if (run.data.status === "completed") {
                    console.log("Run is completed.")
                    break
                }
                if (run.data.status === "failed") {
                    console.log("Run failed. Try again.")
                    break
                }
                if (run.data.status === 'requires_action') {
                    const tools_outputs = [];
                    console.log(`Requiriendo la accion`)
                    for (const tool_call of run.data.required_action.submit_tool_outputs.tool_calls) {
                        if (tool_call.function.name === "can_bus_message_decoder") {
                            const toolArguments = JSON.parse(tool_call.function.arguments);
                            console.log(`Running tool - '${tool_call.function.name}' | With args - ${JSON.stringify(toolArguments)}`);
                            console.log(`Message ID: ${toolArguments.query.message_id}`)
                            console.log(`LSB: ${toolArguments.query.lsb}`)
                            console.log(`Bit Length: ${toolArguments.query.bit_length}`)
                            const output = self.can_bus_message_decoder(toolArguments.query.message_id, toolArguments.query.lsb, toolArguments.query.bit_length, toolArguments.query.scale, toolArguments.query.offset);
                            console.log(output.length, output);     
                            const tool_output = { tool_call_id: tool_call.id, output: JSON.stringify(output) };
                            tools_outputs.push(tool_output);
                        }
                    }
                    console.log("Submit output");
                    await axios.post(action_url, tools_outputs, {headers: action_headers})
                }
                await self.delay(20000) // Consider making this delay configurable                    
            }
            
        } catch (error) {
            console.error(error)
            // Consider adding error handling logic here
        }
    },

    delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    can_bus_message_decoder(message_id, lsb, bitLength, scale, offset) {
        // Divide la cadena hexadecimal en pares
        let hexPairs = Array.from({length: message_id.length / 2}, (_, i) => message_id.slice(i*2, i*2 + 2));
        
        // Convierte cada par a binario y guarda cada bit individualmente en un array
        let binArray = hexPairs.map(pair => Array.from({length: 8}, (_, i) => (parseInt(pair, 16) >> (7 - i)) & 1));
        
        // Aplique la máscara
        let maskedArray = Array.from({length: binArray.length}, () => Array(8).fill(0));
        for (let i = lsb; i < lsb + bitLength; i++) {
            let row = Math.floor(i / 8);
            let col = 7 - (i % 8);  // Corrección: los bits se cuentan de derecha a izquierda
            maskedArray[row][col] = 1;  // Corrección: establece el bit en 1
        }
    
        // Convierte cada línea de binario a hexadecimal
        let hexArray = maskedArray.map(row => row.reduce((acc, bit, i) => acc + bit * (1 << (7 - i)), 0).toString(16).padStart(2, '0'));
        
        // Aplica la función de Excel transformada a Python a cada línea de la cadena
        let resultArray = hexPairs.map((a, i) => hexArray[i] !== "00" ? (parseInt(a, 16) & parseInt(hexArray[i], 16)).toString(16) : "0");
    
        let nonZeroValues = [];
    
        // Recorre el array de derecha a izquierda
        for (let value of resultArray.reverse()) {
            // Si el valor no es cero o ya encontraste un valor no cero, guárdalo
            if (value !== '0' || nonZeroValues.length) {
                nonZeroValues.push(value);
            }
        }
    
        let finalValues = [];
    
        // Recorre el array de derecha a izquierda
        for (let value of nonZeroValues.reverse()) {
            // Si el valor no es cero o ya encontraste un valor no cero, guárdalo
            if (value !== '0' || finalValues.length) {
                finalValues.push(value);
            }
        }
    
        // Como los valores se recorrieron de derecha a izquierda, revierte el resultado para obtener el orden original
        finalValues = finalValues.reverse();
    
        let formattedValues = finalValues.map(value => value.padStart(2, '0'));
        let result = formattedValues.join('');
        
        // Realizar el desplazamiento de bits a la derecha
        result = parseInt(result, 16) >> (lsb % 8);
        
        // Convierte el resultado a decimal
        result = parseInt(result.toString(16), 16);
        
        // Aplica la función de Excel transformada a Python
        result = scale * result + offset;
        
        return result;
    }
    
}