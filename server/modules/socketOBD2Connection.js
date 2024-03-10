const net = require('net');
const EventEmitter = require('events');

class SocketOBD2Connection extends EventEmitter{
    constructor(host = '192.168.0.10', port = 35000) {
        super();
        this.OBD_PORT = port;
        this.OBD_IP = host;
        this.isConnected = false;
        this.socket = new net.Socket();
        this.socket.on('error', (err) => this.emit('error', err));
        this.socket.on('connect', () => this.emit('connected'));
    }

    //To connect to socket
    connect() {
        return new Promise((resolve, reject) => {
            this.socket.connect(this.OBD_PORT, this.OBD_IP, () => {
                console.log('Conectando al adaptador OBDII ELM327');
                this.isConnected = true;
                this.emit('connected');
                console.log('Conexion exitosa!')
                resolve();
            }).on('error', (err) => {
                console.log(err);
                this.isConnected = false;
                this.emit('error', err);
                this.socket.end();
                reject(err);
            });
        });
    }    

    disconnect() {
        try {
            this.isConnected = false;
            this.socket.end();
        } catch (err) {
            this.emit('error', err);
        }
    }
    
    send(data) {
        try {
            this.socket.write(data);
        } catch (err) {
            this.emit('error', err);
        }
    }

}

module.exports = SocketOBD2Connection;
