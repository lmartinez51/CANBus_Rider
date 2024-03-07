const net = require('net');

const OBD_PORT = 35000;
const OBD_IP = '192.168.0.10';
let isConnected = false;
const initializationCommands = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r'];
let commandIndex = 0;

let busInfo = {
    adapterVer: '',   // Aquí guardaremos la respuesta que nos devuelva el adaptador, del comando 'AT WS'
    protocol: '',     // Aquí guardaremos la respuesta que nos devuelva el adaptador, del comando 'AT DP'
    vin: ''           // Aquí guardaremos la respuesta que nos devuelva el adaptador, del comando '09 02'
};

const obdClient = new net.Socket()
obdClient.on('timeout', handleTimeout);


function handleConnectionError(err) {
    console.log('Error de conexión: ', err);
    isConnected = false;
    // Intenta reconectar después de un tiempo
    setTimeout(connectToObd, 5000);
}

function handleTimeout() {
    console.log('Tiempo de espera agotado');
    isConnected = false;
    // Intenta reconectar después de un tiempo
    setTimeout(connectToObd, 5000);
}

function sendCommand() {
    if (commandIndex < initializationCommands.length) {
        obdClient.write(initializationCommands[commandIndex]);
        console.log('Enviado al adaptador: ' + initializationCommands[commandIndex]);
        commandIndex++;
        // Espera 500 milisegundos antes de enviar el siguiente comando
        setTimeout(sendCommand, 500);
    }
}
const connectToObd = () => {
    if (!isConnected) {
        obdClient.connect(OBD_PORT, OBD_IP, function() {
            console.log('Conectado al adaptador OBDII ELM327');
            isConnected = true;
            sendCommand();
        }).on('error', function(err) {
            console.log('Error al intentar conectar: ', err);
        });
    }
}

obdClient.on('data', function(data) {
    console.log('Recibido del adaptador: ' + data);
    // Guardar los datos en busInfo si el comando actual es uno de los que nos interesa
    if (initializationCommands[commandIndex] === 'AT WS\r') {
        busInfo.adapterVer = data.toString();
    } else if (initializationCommands[commandIndex] === 'AT DP\r') {
        busInfo.protocol = data.toString();
    } else if (initializationCommands[commandIndex] === '09 02\r') {
        busInfo.vin = data.toString();
    }
    // Emitir los datos a todos los clientes conectados a través de WebSockets solo si ya tenemos todas las respuestas que nos interesan
    if (busInfo.adapterVer && busInfo.protocol && busInfo.vin) {
        const socket = global.connectedSocket;
        if(socket) socket.emit('obdData', busInfo);
    }
});

module.exports = { connectToObd }