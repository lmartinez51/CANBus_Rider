const EventEmitter = require('events');
const MAX_RETRIES = 2;

class CommandProcessor extends EventEmitter {
    constructor(socketConnection, commands) {
        super()
        this.socketConnection = socketConnection
        this.sendingCommands = commands
        this.commandIndex = 0
        this.buffer = ''
        this.boundHandleData = this.handleData.bind(this)
        this.socketConnection.on('dataReceived', this.boundHandleData)
    }

    shouldSendCommand() {
        return this.commandIndex < this.sendingCommands.length
    }

    sendCommand() {
        if (this.shouldSendCommand()) {
            this.socketConnection.send(this.sendingCommands[this.commandIndex]);
            console.log('Enviando comando: ' + this.sendingCommands[this.commandIndex])
            this.commandTimeout = setTimeout(() => {
                this.handleCommandTimeout();
            }, 5000)
            if (this.commandIndex === this.sendingCommands.length - 1) {
                this.emit('lastCommandSent');
            }
        } else {
            console.log('Emision de comandos detenida.')
            this.commandIndex = 0
        }
    }    

    handleCommandTimeout() {
        try {
            clearTimeout(this.commandTimeout)
            console.log('Tiempo de espera agotado para el comando: ' + this.sendingCommands[this.commandIndex])
            console.log('El comando ' + this.sendingCommands[this.commandIndex] + ' ha fallado')
            this.commandIndex = 0
            console.log('Desconectando despues de fallar el comando.')
            this.emit('error', new Error('Tiempo de espera agotado para el comando: ' + this.sendingCommands[this.commandIndex]));
        } catch (err) {
            this.emit('error', err)
        }
    }

}

module.exports = CommandProcessor