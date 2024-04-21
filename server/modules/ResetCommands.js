const CommandProcessor = require('./CommandProcessor')

class SendingResetCodesCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.resetInfo = null
        this.isRunning = false
    }

    //Listen responses to commands
    handleData(data) {
        try {
            clearTimeout(this.commandTimeout);
            console.log('Recibido del adaptador:\n' + data + '\n');
            this.buffer += data.toString();
            if (this.buffer.includes('>')) {
                // Procesa los datos completos
                const completeData = this.buffer;
                this.buffer = '';
                // Inicializa un array vacío para almacenar los resultados
                //let results = []; // Es posible que haya varias lineas de errores
                if (this.sendingCommands[this.commandIndex] === '04\r') {
                    this.resetInfo = completeData.replace(/[^a-zA-Z0-9]|[\r\n]+/g, '');
                    console.log(`Contenido de reset: ${this.resetInfo}`);
                }
                this.commandIndex++;
                // Si se han recibido todas las respuestas necesarias de la informacion del vehiculo, emite los datos a través de Socket.IO
                if (this.resetInfo) {
                    console.log(this.resetInfo);
                    const socket = global.connectedSocket;
                    if(socket) {
                        socket.emit('resetData', this.resetInfo);
                    }
                }
                if (this.commandIndex < this.sendingCommands.length) {
                    setTimeout(this.sendCommand.bind(this), 500);
                }
                // Verifica si terminaron de enviarse todos los comandos y cierra el socket
                if (this.commandIndex >= this.sendingCommands.length) {
                    // Cierra la conexión con el socket
                    console.log('Reset de codigos de error terminado.')
                    this.socketConnection.disconnect();  // Desconectarse primero asegurarse que no se emitan mas eventos.
                    this.socketConnection.off('dataReceived', this.boundHandleData)  //Dato anterior: dataReceived
                    this.commandIndex = 0
                }
            }
        } catch (err) {
                this.emit('error', err);
        }
    }
}

module.exports = SendingResetCodesCommands