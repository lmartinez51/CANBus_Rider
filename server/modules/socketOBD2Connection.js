const net = require('net');
const EventEmitter = require('events');

class SocketOBD2Connection extends EventEmitter{
    constructor(host = '192.168.0.10', port = 35000) {
        super();
        this.OBD_PORT = port;
        this.OBD_IP = host;
        this.isConnected = false;
        this.socket = new net.Socket();
        this.socket.on('error', (err) => {
            this.isConnected = false;
            this.socket.end();
            this.emit('error', err);
        });
        this.socket.on('connect', () => this.emit('connected'));
        this.socket.on('close', () => {
            // this.emit('disconnected'); // Parece no ser necesario, vamos a probarlo
            console.log('Desconectado del adaptador OBDII ELM327 WiFi'); // Mensaje de cierre
        });
        this.socket.on('data', this.listen.bind(this));
    }

    connect() {
        console.log('Conectando al adaptador OBDII ELM327 WiFi');
        this.socket.connect(this.OBD_PORT, this.OBD_IP, () => {
            this.isConnected = true;
            this.emit('connected');
        });
    }

    disconnect() {
        this.isConnected = false;
        this.socket.end();
        this.socket.on('end', () => {
            this.emit('disconnected');
        });
    }
    
    send(data) {
        try {
            this.socket.write(data);
        } catch (err) {
            this.emit('error', err);
        }
    }

    listen(data) {
        // Personalized event to listen for data
        this.emit('dataReceived', data);
    }

}

module.exports = SocketOBD2Connection;
