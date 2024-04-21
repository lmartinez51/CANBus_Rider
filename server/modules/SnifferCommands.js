const CommandProcessor = require('./CommandProcessor')

class SendingSnifferCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.ecuInfo = {
            ecu: '',
            payload: ''
        }
        this.counter = 0
    }

    startCommandCycle() {
        this.sendCommand()
    }

    processLine(line) {
        let completeData = line.replace(/[\r\n\s]+/g, '')
        let ecu = completeData.slice(0,3)
        let payload = completeData.slice(3).split('<')[0]
        // Verifica si 'ecu' y 'payload' contienen solo caracteres hexadecimales
        const isEcuHexadecimal = /^[0-9A-F]+$/i.test(ecu)
        const isPayloadHexadecimal = /^[0-9A-F]+$/i.test(payload)
        if(completeData.length >= 3 && isEcuHexadecimal && isPayloadHexadecimal && ecu !== '000') {
            this.ecuInfo.ecu = ecu
            this.ecuInfo.payload = payload
            console.log(this.ecuInfo)
            //console.log(`Payload es: ${this.ecuInfo.payload}`)
            const socket = global.connectedSocket
            if(socket) {
                socket.emit('snifferData', this.ecuInfo)
            }
        }
        completeData = ''
    }
    
    //Listen responses to commands
    handleData(data) {
        try {
            clearTimeout(this.commandTimeout)
            console.log('Recibido del adaptador:\n' + data + '\n')
            this.buffer += data.toString()
            if (this.commandIndex < this.sendingCommands.length - 1 && this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer
                console.log(`Respuesta: ${completeData}`)
                this.buffer = ''
                this.commandIndex++;
                setTimeout(this.sendCommand.bind(this), 500)
            } else if (this.commandIndex === this.sendingCommands.length - 1 && this.buffer.includes('\r\n')){
                const lines = this.buffer.split('\r\n')
                const isLastLineComplete = this.buffer.endsWith('\r\n')
                for (let i = 0; i < lines.length; i++) {
                    // Si no es la última línea o si es la última línea y está completa, entonces procesa la línea
                    if (i < lines.length - 1 || (i === lines.length - 1 && isLastLineComplete)) {
                        this.processLine(lines[i])
                    }
                }
                this.buffer = '' // Empty the buffer after processing all lines
            }
        } catch (err) {
            this.emit('error', err)
        }
    }
}

module.exports = SendingSnifferCommands