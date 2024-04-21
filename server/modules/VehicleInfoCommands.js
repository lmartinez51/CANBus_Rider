const { getVehicleDetails } = require('./vinDecoder')
const CommandProcessor = require('./CommandProcessor')

class SendingVehicleInfoCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.vin = ''
        this.vinInfo = null
    }

    //Listen responses to commands
    async handleData(data) {
        try {
            clearTimeout(this.commandTimeout);
            console.log('Recibido del adaptador:\n' + data + '\n');
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
                            this.vin += String.fromCharCode(parseInt(byte, 16));
                        }
                    }
                    // Limpia el VIN
                    console.log(`VIN Completo: ${this.vin}`)
                    this.vin = this.vin.replace(/[^a-zA-Z0-9]/g, '').substring(1);
                    console.log(`Contenido de VIN: ${this.vin}`);
                    // Espera a que getVehicleDetails se complete antes de emitir los datos
                    this.vinInfo = await getVehicleDetails(this.vin);
                    this.vinInfo.vin = this.vin     //Add vin to the object
                }
                this.commandIndex++;
                // Si se han recibido las respuestas necesarias de la informacion del vehiculo, emite los datos a través de Socket.IO
                if (this.vinInfo) {
                    console.log(this.vinInfo)
                    const socket = global.connectedSocket;
                    if(socket) {
                        // Emite los detalles del VIN en un nuevo evento de socket
                        socket.emit('vinData', this.vinInfo);
                        this.vinInfo = null
                    }
                }
                if (this.commandIndex < this.sendingCommands.length) {
                    setTimeout(this.sendCommand.bind(this), 500);
                }
                // Verifica si terminaron de enviarse todos los comandos y cierra el socket
                if (this.commandIndex >= this.sendingCommands.length) {
                    // Cierra la conexión con el socket
                    console.log('Inicializacion terminada.')
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

module.exports = SendingVehicleInfoCommands