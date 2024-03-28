const EventEmitter = require('events');
const MAX_RETRIES = 2;

class CommandProcessor extends EventEmitter {
    constructor(socketConnection, commands) {
        super()
        this.socketConnection = socketConnection
        this.sendingCommands = commands
        this.commandIndex = 0
        this.retryCount = 0 //Command resend attempts
        //this.info = info
        this.buffer = ''
        this.boundHandleData = this.handleData.bind(this)
        this.socketConnection.on('dataReceived', this.boundHandleData)
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
                this.retryCount = 0
            }
        } catch (err) {
            this.emit('error', err)
        }
    }

    handleCommandTimeout() {
        try {
            clearTimeout(this.commandTimeout)
            console.log('Tiempo de espera agotado para el comando: ' + this.sendingCommands[this.commandIndex])
            if (this.retryCount < MAX_RETRIES) {
                console.log('Reintentando el comando: ' + this.sendingCommands[this.commandIndex])
                this.retryCount++
                this.sendCommand()
            } else {
                console.log('El comando ha fallado después de ' + MAX_RETRIES + ' intentos: ' + this.sendingCommands[this.commandIndex])
                this.socketConnection.disconnect()
                this.socketConnection.off('dataReceived', this.boundHandleData)
            }
        } catch (err) {
            this.emit('error', err)
        }
    }
}

module.exports = CommandProcessor