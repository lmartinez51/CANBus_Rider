// OBDIIConnSetup.js
import { Socket } from 'net';
let isConnected = false;

const obdClient = new Socket();
obdClient.on('error', function(err) {
    console.log('Error de conexión: ', err);
    isConnected = false;
});

obdClient.on('timeout', function() {
    console.log('Tiempo de espera agotado');
    isConnected = false;
});

function connectToObd() {
    if (!isConnected) {
        obdClient.connect(35000, '192.168.0.10', function() {
            console.log('Conectado al adaptador OBDII ELM327');
            isConnected = true;
            obdClient.write('AT WS\r');
        });
    }

    obdClient.on('data', function(data) {
        console.log('Recibido del adaptador: ' + data);
        // Emitir los datos a todos los clientes conectados a través de WebSockets
        const socket = global.connectedSocket;
        if(socket) socket.emit('obdData', data.toString());
    });
}

export default { connectToObd }
