// sendingCommands.js
const EventEmitter = require('events');
const MAX_RETRIES = 2;

class SendingCommands extends EventEmitter {
    constructor(socketConnection, commands) {
        super();
        this.socketConnection = socketConnection;
        this.sendingCommands = commands;
        // Configura un manejador de eventos para cuando se reciban datos
        this.socketConnection.on('dataReceived', this.handleData.bind(this));
        this.commandIndex = 0;
        this.retryCount = 0; //Command resend attempts
        this.carInfo = {
            adapterVer: '', 
            protocol: '', 
            vin: '',
            processStatus: true
        };
        //this.processStatus = false
        this.monitorInfo = {}
        this.buffer = '';
    }

    // Método para enviar comandos
    sendCommand() {
        try {
            // Si aún hay comandos por enviar
            if (this.commandIndex < this.sendingCommands.length) {
                // Envía el comando actual
                this.socketConnection.send(this.sendingCommands[this.commandIndex]);
                console.log('Enviando comando: ' + this.sendingCommands[this.commandIndex]);
                // Inicia un temporizador que se activará si el comando no se ejecuta correctamente
                this.commandTimeout = setTimeout(this.handleCommandTimeout.bind(this), 5000);
            } else {
                // Si todos los comandos se han enviado, registra un mensaje y reinicia los contadores
                console.log('Secuencia de comandos de inicialización terminada.')
                this.commandIndex = 0;
                this.retryCount = 0;
                // this.socketConnection.disconnect()  //Comprobar si esta instruccion es necesaria, puesto que hay otro disconect al final de handleData
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

    // Método para restablecer los valores de busInfo
    resetCarInfo() {
        this.carInfo = {
            adapterVer: '', 
            protocol: '', 
            vin: '',
            processStatus: true
        };
    }

        // Método para restablecer los valores de busInfo
    // resetMonitorInfo() {
    //     this.monitorInfo = {};
    // }

    //Listen responses to commands
    handleData(data) {
        try {
            clearTimeout(this.commandTimeout);
            //console.log('Recibido del adaptador:\n' + data + '\n');
            this.buffer += data.toString();
            if (this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer;
                this.buffer = '';
                if (this.sendingCommands[this.commandIndex] === '09 02\r') {
                    // Divide la respuesta en líneas
                    let lines = completeData.split('\r');
                    // Se eliminan lineas vacias
                    lines = lines.filter(line => line.trim() !== '');
                    // Ignora las primeras dos líneas y procesa las demás
                    for (let i = 2; i < lines.length; i++) {
                        // Elimina el prefijo de cada línea
                        const line = lines[i].substring(lines[i].indexOf(':') + 1);
                        // Procesa la línea en pares de caracteres
                        for (let j = 0; j < line.length; j += 2) {
                            const byte = line.substring(j, j + 2);
                            this.carInfo.vin += String.fromCharCode(parseInt(byte, 16));
                        }
                    }
                    // Limpia el VIN
                    this.carInfo.vin = this.carInfo.vin.replace(/[^a-zA-Z0-9]/g, '').substring(1);
                    console.log(`Contenido de VIN: ${this.carInfo.vin}`);
                } else if (this.sendingCommands[this.commandIndex] === 'AT WS\r') {
                    this.carInfo.adapterVer = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    this.carInfo.adapterVer = this.carInfo.adapterVer.replace('AT WS', '');
                    console.log(`Contenido de AT WS: ${this.carInfo.adapterVer}`);
                } else if (this.sendingCommands[this.commandIndex] === 'AT DP\r') {
                    this.carInfo.protocol = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    this.carInfo.protocol = this.carInfo.protocol.replace('AT DP', '');
                    console.log(`Contenido de DP: ${this.carInfo.protocol}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 05 1\r') {
                    // Divide la respuesta en líneas
                    //let lines = completeData.split('\r');
                    // Procesa la respuesta al comando '01 05\r' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    console.log('Temp: ' + datos)
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.temp = (par - 40);
                    console.log(`Contenido de Coolant Temperature: ${this.monitorInfo.temp}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 0C 1\r') {
                    // Procesa la respuesta al comando '01 05\r' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    console.log('Engine RPM: ' + datos)
                    let lastPair = datos.substring(4, 8);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.revs = (par/4);
                    console.log(`Contenido de Revs: ${this.monitorInfo.revs}`);
                } else if (this.sendingCommands[this.commandIndex] === '01 0D 1\r') {
                    // Procesa la respuesta al comando '01 05\r' Usa solo los dos ultimos pares de datos
                    let datos = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    console.log('Velocidad: ' + datos)
                    let lastPair = datos.substring(4, 6);
                    let par = parseInt(lastPair, 16);
                    this.monitorInfo.speed = par;
                    console.log(`Contenido de Speed: ${this.monitorInfo.speed}`);
                }
                this.commandIndex++;
                // Si se han recibido todas las respuestas necesarias, emite los datos a través de Socket.IO
                if (this.carInfo.adapterVer && this.carInfo.protocol && this.carInfo.vin) {
                    console.log(this.carInfo);
                    const socket = global.connectedSocket;
                    if(socket) {
                        socket.emit('obdData', this.carInfo);
                        // Llama al método para restablecer los valores de busInfo
                        this.resetCarInfo();
                    }
                }
                // Si se ha recibido la temperatura del refrigerante, emite los datos a través de Socket.IO
                if (this.monitorInfo.temp !== undefined && this.monitorInfo.revs !== undefined && this.monitorInfo.speed !== undefined) {
                    console.log(this.monitorInfo)
                    const socket = global.connectedSocket;
                    console.log('Scoket: ' + socket)
                    if(socket) {
                        socket.emit('monitorData', this.monitorInfo);
                        //this.resetMonitorInfo();
                        console.log("Monitor data sent")
                    }
                }
                if (this.commandIndex < this.sendingCommands.length) {
                    setTimeout(this.sendCommand.bind(this), 500);
                }
                // Verifica si terminaron de enviarse todos los comandos y cierra el socket
                if (this.commandIndex >= this.sendingCommands.length) {
                    // Cierra la conexión con el socket
                    this.socketConnection.disconnect();
                }
            }
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = SendingCommands
