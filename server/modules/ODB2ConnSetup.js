const net = require('net')
const EventEmitter = require('events')

class ObdClient extends EventEmitter {
    constructor() {
        super();
        this.OBD_PORT = 35000;
        this.OBD_IP = '192.168.0.10';
        this.isConnected = false;
        this.initializationCommands = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r'];
        this.commandIndex = 0; 
        this.retryCount = 0; 
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.busInfo = {
            adapterVer: '', 
            protocol: '', 
            vin: '' 
        };
        this.obdClient = new net.Socket();
        this.obdClient.on('timeout', this.handleTimeout.bind(this));
    }

    handleError(err) {
        console.log('Error de conexión: ', err);
        this.isConnected = false;
        this.emit('error', err);
    }

    handleTimeout() {
        console.log('Tiempo de espera agotado');
        this.isConnected = false;
        setTimeout(this.connectToObd.bind(this), 5000);
    }

    sendCommand() {
        if (this.commandIndex < this.initializationCommands.length) {
            this.obdClient.write(this.initializationCommands[this.commandIndex]);
            console.log('Enviado al adaptador: ' + this.initializationCommands[this.commandIndex]);
            this.commandTimeout = setTimeout(this.handleCommandTimeout.bind(this), 5000);
        } else {
            console.log('Secuencia de initializacion terminada.')
            this.commandIndex = 0;
            this.retryCount = 0;
        }
    }

    handleCommandTimeout() {
        console.log('Tiempo de espera agotado para el comando: ' + this.initializationCommands[this.commandIndex]);
        if (this.retryCount < 1) {
            console.log('Reintentando el comando: ' + this.initializationCommands[this.commandIndex]);
            this.retryCount++;
            this.sendCommand();
        } else {
            console.log('El comando ha fallado después de 2 intentos: ' + this.initializationCommands[this.commandIndex]);
            this.emit('error', new Error('El comando ha fallado después de 2 intentos: ' + this.initializationCommands[this.commandIndex]));
            this.obdClient.end();
        }
    }

    connectToObd() {
        if (!this.isConnected) {
            this.obdClient.connect(this.OBD_PORT, this.OBD_IP, () => {
                console.log('Conectando al adaptador OBDII ELM327');
                this.isConnected = true;
                this.emit('connected');
                console.log('Conexion exitosa!')
                this.sendCommand();
            }).on('error', (err) => {
                console.log(err);
                this.emit('error', err);
                this.obdClient.end();
            });
        }
    }

    handleData(data) {
        clearTimeout(this.commandTimeout);
        console.log('Recibido del adaptador: ' + data + '\n');
        if (this.initializationCommands[this.commandIndex] === '09 02\r') {
            // Divide la respuesta en líneas
            const lines = data.toString().split('\r');
            // Ignora la primera línea y procesa las demás
            for (let i = 1; i < lines.length; i++) {
                // Elimina el prefijo de cada línea
                const line = lines[i].substring(lines[i].indexOf(':') + 2);
                // Divide la línea en bytes y convierte cada byte a su valor ASCII correspondiente
                const bytes = line.split(' ');
                for (let j = 0; j < bytes.length; j++) {
                    this.busInfo.vin += String.fromCharCode(parseInt(bytes[j], 16));
                }
            }
            console.log(`Contenido de VIN: ${this.busInfo.vin}`)
        } else if (this.initializationCommands[this.commandIndex] === 'AT WS\r') {
            this.busInfo.adapterVer = data.toString();
            console.log(`Contenido de AT WS: ${this.busInfo.adapterVer}`)
        } else if (this.initializationCommands[this.commandIndex] === 'AT DP\r') {
            this.busInfo.protocol = data.toString();
            console.log(`Contenido de DP: ${this.busInfo.protocol}`)
        }
        this.commandIndex++;
        if (this.busInfo.adapterVer && this.busInfo.protocol && this.busInfo.vin) {
            console.log(this.busInfo)
            const socket = global.connectedSocket;
            if(socket) socket.emit('obdData', this.busInfo);
        }
        if (this.commandIndex < this.initializationCommands.length) {
            setTimeout(this.sendCommand.bind(this), 500);
        }
    }
    

    start() {
        this.obdClient.on('data', this.handleData.bind(this));
        this.connectToObd();
    }
}

module.exports = { ObdClient }
