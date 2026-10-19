require('dotenv').config({ path: "./.env" })
const axios = require('axios');
const { response } = require('express');
const {OpenAI} = require("openai")
const openai = new OpenAI({
	apiKey: process.env.CHATGPT_API_KEY || "dummy_key_for_test"
})
const canWizardID = process.env.CAN_WIZARD_ID
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
            const user = (req.body && req.body.user) ? req.body.user : "Lorenzo";
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
            console.error(error)
            res.status(500).send({ error: error.message || 'Internal Server Error' })
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
            throw error
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
            throw error
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
            while (true) {
                run = await axios.get(run_url, { headers: run_headers })
                console.log(`Status Actual: ${run.data.status}`)
                if (run.data.status === "completed") {
                    console.log("Run is completed.")
                    break
                }
                if (run.data.status === "failed" || run.data.status === "cancelled" || run.data.status === "expired") {
                    console.log(`Run ${run.data.status}. Try again.`)
                    throw new Error("Assistant run failed")
                }
                await self.delay(20000) // Consider making this delay configurable
            }     
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    
    // Function to delay the inquires to the assistant - (Just in case I need it )
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
}
