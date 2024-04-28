const EventEmitter = require('events');
const MAX_RETRIES = 2;

class CommandProcessor extends EventEmitter {
    constructor(socketConnection, commands) {
        super()
        this.socketConnection = socketConnection
        this.sendingCommands = commands
        this.commandIndex = 0
        //this.retryCount = 0 //Command resend attempts
        this.buffer = ''
        this.boundHandleData = this.handleData.bind(this)
        this.socketConnection.on('dataReceived', this.boundHandleData)
        // Añade un manejador de eventos para 'disconnected'
        this.socketConnection.on('disconnected', () => {
            console.log('Comprobacion. El socket se ha desconectado.')
        })
    }

    shouldSendCommand() {
        return this.commandIndex < this.sendingCommands.length
    }

    sendCommand() {
        try {
            if (this.shouldSendCommand()) {
                this.socketConnection.send(this.sendingCommands[this.commandIndex]);
                console.log('Enviando comando: ' + this.sendingCommands[this.commandIndex])
                this.commandTimeout = setTimeout(this.handleCommandTimeout.bind(this), 5000)
            } else {
                console.log('Emision de comandos detenida.')
                this.commandIndex = 0
                //this.retryCount = 0
            }
        } catch (err) {
            this.emit('error', err)
        }
    }

    handleCommandTimeout() {
        try {
            clearTimeout(this.commandTimeout)
            console.log('Tiempo de espera agotado para el comando: ' + this.sendingCommands[this.commandIndex])
            console.log('El comando ha fallado: ' + this.sendingCommands[this.commandIndex])
            this.commandIndex = 0
            this.socketConnection.disconnect()
            console.log('Desconectando despues de fallar el comando.')
            this.socketConnection.off('dataReceived', this.boundHandleData) // dataReceived
            this.socketConnection = null
        } catch (err) {
            this.emit('error', err)
        }
    }
}

module.exports = CommandProcessor