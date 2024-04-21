const { getVehicleDetails } = require('./vinDecoder')
const CommandProcessor = require('./CommandProcessor')

class SendingInitialCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.carInfo = {
            adapterVer: '', 
            protocol: '', 
            vin: '',
            processStatus: true
        }
        this.vinInfo = null
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
                            this.carInfo.vin += String.fromCharCode(parseInt(byte, 16));
                        }
                    }
                    // Limpia el VIN
                    console.log(`VIN Completo: ${this.carInfo.vin}`)
                    this.carInfo.vin = this.carInfo.vin.replace(/[^a-zA-Z0-9]/g, '').substring(1);
                    console.log(`Contenido de VIN: ${this.carInfo.vin}`);
                    // Espera a que getVehicleDetails se complete antes de emitir los datos
                    this.vinInfo = await getVehicleDetails(this.carInfo.vin);
                } else if (this.sendingCommands[this.commandIndex] === 'AT WS\r') {
                    this.carInfo.adapterVer = completeData.replace(/[^a-zA-Z0-9.\s]|[\r\n]+/g, '');
                    this.carInfo.adapterVer = this.carInfo.adapterVer.replace('AT WS', '');
                    console.log(`Contenido de AT WS: ${this.carInfo.adapterVer}`);
                } else if (this.sendingCommands[this.commandIndex] === 'AT DP\r') {
                    this.carInfo.protocol = completeData.replace(/[^a-zA-Z0-9\s]|[\r\n]+/g, '');
                    this.carInfo.protocol = this.carInfo.protocol.replace('AT DP', '');
                    console.log(`Contenido de DP: ${this.carInfo.protocol}`);
                }
                this.commandIndex++;
                // Si se han recibido todas las respuestas necesarias de la informacion del vehiculo, emite los datos a través de Socket.IO
                if (this.carInfo.adapterVer && this.carInfo.protocol && this.carInfo.vin) {
                    console.log(this.carInfo);
                    const socket = global.connectedSocket;
                    if(socket) {
                        socket.emit('obdData', this.carInfo);
                        // Emite los detalles del VIN en un nuevo evento de socket
                        socket.emit('vinData', this.vinInfo);
                        this.resetCarInfo();
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

module.exports = SendingInitialCommands