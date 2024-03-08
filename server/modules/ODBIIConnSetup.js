const net = require('net');

const OBD_PORT = 35000;
const OBD_IP = '192.168.0.10';
let isConnected = false;
const initializationCommands = ['AT WS\r', 'AT SP 0\r', 'AT DP\r', 'AT E0\r', 'AT S0\r', 'AT H0\r', 'AT CAF1\r', '09 02\r'];
let commandIndex = 0; 
let retryCount = 0; 
let connectionAttempts = 0;
const maxRetries = 3;

let busInfo = {
    adapterVer: '',
    protocol: '',
    vin: ''
};

const obdClient = new net.Socket()
obdClient.on('timeout', handleTimeout);

function handleTimeout() {
    console.log('Tiempo de espera para conexion agotado. Intentando nuevamente.');
    isConnected = false;
    if (connectionAttempts < maxRetries) {
        // Intenta reconectar después de un tiempo
        connectionAttempts++;
        setTimeout(connectToObd, 5000);
    } else {
        console.log('No se pudo establecer la conexión después de ' + maxRetries + ' intentos');
        maxRetries = 0
        // Aquí puedes agregar el código para detener la ejecución y notificar al usuario
    }
}

function sendCommand() {
    if (commandIndex < initializationCommands.length) {
        obdClient.write(initializationCommands[commandIndex]);
        console.log('Enviado al adaptador: ' + initializationCommands[commandIndex]);
        // Establecer un timeout para este comando
        commandTimeout = setTimeout(handleCommandTimeout, 5000);
    } else {
        // Si hemos terminado con todos los comandos, restablecemos commandIndex y retryCount
        console.log('Secuencia de initializacion terminada.')
        commandIndex = 0;
        retryCount = 0;
    }
}

function handleCommandTimeout() {
    console.log('Tiempo de espera agotado para el comando: ' + initializationCommands[commandIndex]);
    if (retryCount < 1) {
        console.log('Reintentando el comando: ' + initializationCommands[commandIndex]);
        retryCount++;
        sendCommand();
    } else {
        console.log('El comando ha fallado después de 2 intentos: ' + initializationCommands[commandIndex]);
        console.log('Deteniendo la ejecución y notificando al usuario...');
        // Aquí puedes agregar el código para detener la ejecución y notificar al usuario
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
            console.log('Por favor intenta la conexion nuevamente, asegurate de tener la llave de ignicion en ON')
        });
    }
}

obdClient.on('data', function(data) {
    // Cancelar el timeout ya que hemos recibido una respuesta
    clearTimeout(commandTimeout);
    console.log('Recibido del adaptador: ' + data + '\n');
    if (initializationCommands[commandIndex] === 'AT WS\r') {
      busInfo.adapterVer = data.toString();
      console.log(`Contenido de AT WS: ${busInfo.adapterVer}`)
    } else if (initializationCommands[commandIndex] === 'AT DP\r') {
      busInfo.protocol = data.toString();
      console.log(`Contenido de DP: ${busInfo.protocol}`)
    } else if (initializationCommands[commandIndex] === '09 02\r') {
      busInfo.vin = data.toString();
      console.log(`Contenido de VIN: ${busInfo.vin}`)
    }
    // Incrementar commandIndex después de recibir los datos
    commandIndex++;
    // Emitir los datos a todos los clientes conectados a través de WebSockets solo si ya tenemos todas las respuestas que nos interesan
    if (busInfo.adapterVer && busInfo.protocol && busInfo.vin) {
        console.log(busInfo)
        const socket = global.connectedSocket;
        if(socket) socket.emit('obdData', busInfo);
    }
    // Enviar el siguiente comando
    if (commandIndex < initializationCommands.length) {
        setTimeout(sendCommand, 500);
    }
});

module.exports = { connectToObd }