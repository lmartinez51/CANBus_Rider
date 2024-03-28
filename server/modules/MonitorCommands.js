const CommandProcessor = require('./CommandProcessor')

class SendingMonitorCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.monitorInfo = {
            voltage: '',
            temp: 0,
            revs: 0,
            speed: 0,
            fuel: 0,
        }
        this.isRunning = false;
    }

    shouldSendCommand() {
        return this.isRunning && super.shouldSendCommand()
    }

    startCommandCycle() {
        this.isRunning = true
        this.sendCommand()
    }

    stopCommandCycle() {
        this.isRunning = false
        this.commandIndex = 0
    }

    //Listen responses to commands
    handleData(data) {
        //const socket = global.connectedScoket;
        try {
            clearTimeout(this.commandTimeout);
            this.buffer += data.toString();
            if (this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer;
                this.buffer = '';
                if (this.sendingCommands[this.commandIndex] === 'AT RV\r') {
                    this.monitorInfo.voltage = completeData.replace(/[^a-zA-Z0-9.\s]|[\r\n]+/g, '');
                    this.monitorInfo.voltage = this.monitorInfo.voltage.replace('AT RV', '')
                    console.log(`Contenido de AT RV: ${this.monitorInfo.voltage}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 05 1\r') {
                    // Procesa la respuesta al comando '01 05' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.temp = (par - 40);
                    console.log(`Contenido de Coolant Temperature: ${this.monitorInfo.temp}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 0C 1\r') {
                    // Procesa la respuesta al comando '01 0C' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    let lastPair = datos.substring(4, 8);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.revs = (par/4);
                    console.log(`Contenido de Revs: ${this.monitorInfo.revs}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 0D 1\r') {
                    // Procesa la respuesta al comando '01 0D' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.speed = par;
                    console.log(`Contenido de Speed: ${this.monitorInfo.speed}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 2F 1\r') {
                    // Procesa la respuesta al comando '01 2F' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.fuel = parseFloat((par * 0.392).toFixed(2));
                    console.log(`Contenido de Fuel: ${this.monitorInfo.fuel}`);
                }
                // Si se han recibido todos los datos del monitoreo en vivo, emitirlos a través de Socket.IO
                if (this.monitorInfo.voltage !== undefined && this.monitorInfo.temp !== undefined && this.monitorInfo.revs !== undefined && this.monitorInfo.speed !== undefined && this.monitorInfo.fuel !== undefined) {
                    console.log(this.monitorInfo)
                    const socket = global.connectedSocket;
                    if(socket) {
                        socket.emit('monitorData', this.monitorInfo);
                    }
                }
                if (this.isRunning) {
                    this.commandIndex++;
                    if (this.commandIndex >= this.sendingCommands.length) {
                        // Si todos los comandos se han enviado y el ciclo de comandos está activo, reinicia los contadores y vuelve a empezar
                        console.log('Secuencia de comandos terminada. Reiniciando...') 
                        this.commandIndex = 0;
                    }
                    setTimeout(this.sendCommand.bind(this), 500);
                }
            }
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = SendingMonitorCommands