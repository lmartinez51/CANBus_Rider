// initializationCommands.js
const EventEmitter = require('events');

class InitializationCommands extends EventEmitter {
    constructor(socketConnection, commands) {
        super();
        this.socketConnection = socketConnection;
        this.initializationCommands = commands
        this.commandIndex = 0;
        this.retryCount = 0; //Command resend attempts
        this.busInfo = {
            adapterVer: '', 
            protocol: '', 
            vin: '' 
        };
        this.buffer = '';
    }

    sendCommand() {
        try {
            if (this.commandIndex < this.initializationCommands.length) {
                this.socketConnection.send(this.initializationCommands[this.commandIndex]);
                console.log('Sending command: ' + this.initializationCommands[this.commandIndex]);
                this.commandTimeout = setTimeout(this.handleCommandTimeout.bind(this), 5000);
            } else {
                console.log('Secuencia de initializacion terminada.')
                this.commandIndex = 0;
                this.retryCount = 0;
            }
        }catch (err) {
            this.emit('error', err);
        }
    }

    handleCommandTimeout() {
        clearTimeout(this.commandTimeout);
        console.log('Tiempo de espera agotado para el comando: ' + this.initializationCommands[this.commandIndex]);
        if (this.retryCount < 1) {
            console.log('Reintentando el comando: ' + this.initializationCommands[this.commandIndex]);
            this.retryCount++;
            this.sendCommand();
        } else {
            console.log('El comando ha fallado después de 2 intentos: ' + this.initializationCommands[this.commandIndex]);
            this.emit('commandError', new Error('El comando ha fallado después de 2 intentos: ' + this.initializationCommands[this.commandIndex]));
            this.socketConnection.end();
        }
    }

    //Listen socket
    handleData(data) {
        try {
            clearTimeout(this.commandTimeout);
            console.log('Recibido del adaptador:\n' + data + '\n');
            this.buffer += data.toString();
            if (this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer;
                this.buffer = '';
                if (this.initializationCommands[this.commandIndex] === '09 02\r') {
                    // Divide la respuesta en líneas
                    let lines = completeData.split('\r');
                    // Se eliminan lineas vacias
                    lines = lines.filter(line => line.trim() !== '');
                    // Ignora las primeras dos líneas y procesa las demás
                    for (let i = 2; i < lines.length; i++) {
                        // Elimina el prefijo de cada línea
                        const line = lines[i].substring(lines[i].indexOf(':') + 1);
                        console.log('Linea: ' + line + '\n')
                        // Procesa la línea en pares de caracteres
                        for (let j = 0; j < line.length; j += 2) {
                            const byte = line.substring(j, j + 2);
                            this.busInfo.vin += String.fromCharCode(parseInt(byte, 16));
                        }
                    }
                    // Limpia el VIN
                    this.busInfo.vin = this.busInfo.vin.replace(/[^a-zA-Z0-9]/g, '').substring(1);
                    console.log(`Contenido de VIN: ${this.busInfo.vin}`);
                } else if (this.initializationCommands[this.commandIndex] === 'AT WS\r') {
                    this.busInfo.adapterVer = completeData.replace(/[^a-zA-Z0-9\s]/g, '');
                    console.log(`Contenido de AT WS: ${this.busInfo.adapterVer}`);
                } else if (this.initializationCommands[this.commandIndex] === 'AT DP\r') {
                    this.busInfo.protocol = completeData.replace(/[^a-zA-Z0-9\s]/g, '');
                    console.log(`Contenido de DP: ${this.busInfo.protocol}`);
                }
                this.commandIndex++;
                if (this.busInfo.adapterVer && this.busInfo.protocol && this.busInfo.vin) {
                    console.log(this.busInfo);
                    const socket = global.connectedSocket;
                    if(socket) socket.emit('obdData', this.busInfo);
                }
                if (this.commandIndex < this.initializationCommands.length) {
                    setTimeout(this.sendCommand.bind(this), 500);
                }
                // Verifica si terminaron de enviarse todos los comandos y cierra el socket
                if (this.commandIndex >= this.initializationCommands.length) {
                    // Cierra la conexión con el socket
                    this.socketConnection.end();
                }
            }
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = InitializationCommands;
