const EventEmitter = require('events');
const MAX_RETRIES = 2;


class SendingMonitorCommands extends EventEmitter {
    constructor(socketConnection, commands) {
        super()
        this.socketConnection = socketConnection
        this.sendingCommands = commands
        this.commandIndex = 0
        this.retryCount = 0 //Command resend attempts
        this.monitorInfo = {
            voltage: '',
            temp: 0,
            revs: 0,
            speed: 0,
            fuel: 0,
        }
        this.buffer = ''
        // Variable de control para el ciclo de comandos
        this.isRunning = false;
        //this.socket = global.connectedSocket;
        // Guardar una referencia a la función con el contexto correcto (Importante que esto sea agregado despues de inicializar las variables a cero)
        this.boundHandleData = this.handleData.bind(this)
        // Configura un manejador de eventos para cuando se reciban datos
        this.socketConnection.on('dataReceived', this.boundHandleData)
    }

    // Método para iniciar el ciclo de comandos
    startCommandCycle() {
        this.isRunning = true;
        this.sendCommand();
    }

    // Método para detener el ciclo de comandos
    stopCommandCycle() {
        this.isRunning = false;
    }

    // Método para enviar comandos
    sendCommand() {
        try {
            if (!this.isRunning) {
                // Cierra la conexión con el socket
                console.log('Emision de comandos terminada.')
                this.commandIndex = 0;
                this.socketConnection.off('dataReceived', this.boundHandleData);
            }
            // Si aún hay comandos por enviar y el ciclo de comandos está activo
            if (this.commandIndex < this.sendingCommands.length && this.isRunning) {
                // Envía el comando actual
                this.socketConnection.send(this.sendingCommands[this.commandIndex]);
                console.log('Enviando comando: ' + this.sendingCommands[this.commandIndex]);
                // Inicia un temporizador que se activará si el comando no se ejecuta correctamente
                this.commandTimeout = setTimeout(this.handleCommandTimeout.bind(this), 5000);
            }
        } catch (err) {
            // Si ocurre un error al enviar el comando, emite un evento de error
            this.emit('error', err);
        }
    }

    // Método para manejar el tiempo de espera de un comando
    handleCommandTimeout() {
        try {
            // Limpia el temporizador
            clearTimeout(this.commandTimeout);
            console.log('Tiempo de espera agotado para el comando: ' + this.sendingCommands[this.commandIndex]);
            // Si el comando ha fallado menos de MAX_RETRIES
            if (this.retryCount < MAX_RETRIES) {
                // Reintenta enviar el comando
                console.log('Reintentando el comando: ' + this.sendingCommands[this.commandIndex]);
                this.retryCount++;
                this.sendCommand();
            } else {
                // Si el comando ha fallado MAX_RETRIES veces, desconecta la conexión y registra un mensaje
                console.log('El comando ha fallado después de ' + MAX_RETRIES + ' intentos: ' + this.sendingCommands[this.commandIndex]);
                this.socketConnection.disconnect();
            }
        } catch (err) {
            // Si ocurre un error al manejar el tiempo de espera, emite un evento de error
            this.emit('error', err);
        }
    }

    // Método para restablecer los valores de monitorInfo
    // resetMonitorInfo() {
    //     this.monitorInfo = {};
    // }

    //Listen responses to commands
    async handleData(data) {
        //const socket = global.connectedScoket;
        try {
            clearTimeout(this.commandTimeout);
            //console.log('Recibido del adaptador:\n' + data + '\n');
            this.buffer += data.toString();
            if (this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer;
                this.buffer = '';
                if (this.sendingCommands[this.commandIndex] === 'AT RV\r') {
                    this.monitorInfo.voltage = completeData.replace(/[^a-zA-Z0-9.\s]|[\r\n]+/g, '');
                    this.monitorInfo.voltage = this.monitorInfo.voltage.replace('AT RV', '')
                    console.log(`Contenido de AT RV: ${this.monitorInfo.voltage}`);
                    // const socket = global.connectedSocket;
                    // if (socket) socket.emit('monitorData', this.monitorInfo)
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
                    // let socket = global.connectedSocket;
                    // if (socket) socket.emit('monitorData', this.monitorInfo)
                } else if (this.sendingCommands[this.commandIndex] === '01 0D 1\r') {
                    // Procesa la respuesta al comando '01 0D' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.speed = par;
                    console.log(`Contenido de Speed: ${this.monitorInfo.speed}`);
                    // const socket = global.connectedSocket;
                    // if (socket) socket.emit('monitorData', this.monitorInfo.speed)
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
                        //this.resetMonitorInfo();
                        console.log("Monitor data sent")
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
