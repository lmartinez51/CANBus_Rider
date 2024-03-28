const CommandProcessor = require('./CommandProcessor')
const pcodes = require('./codes/codes.json')

class SendingTroubleCodesCommands extends CommandProcessor {
    constructor(socketConnection, commands) {
        super(socketConnection, commands)
        this.codesInfo = {
            number: 0,
            codes: '',
            description: ''
        }
        this.isRunning = false
    }

    // Método para restablecer los valores codesInfo
    resetCodesInfo() {
        this.codesInfo = {
            number: 0,
            codes: 'No TCs',
            description: 'N/A'
        }
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
                if (this.sendingCommands[this.commandIndex] === '01 01\r') {
                    let stringTCNumber = completeData.replace(/[^a-zA-Z0-9.\s]|[\r\n]+/g, '');
                    console.log(`Esto tiene: ${stringTCNumber}`)
                    let pairs = stringTCNumber.split(' ');
                    let thirdPair = pairs[2]; // e.g. '81'
                    
                    // Convertir de hexadecimal a decimal
                    let decimalNumber = parseInt(thirdPair, 16); // 129
                    
                    // Restar 129
                    let result = decimalNumber - 129;
                    // Guardar el resultado en 'this.codeInfo.number'
                    this.codesInfo.number = result
                    console.log(`Contenido del numero de errores: ${this.codesInfo.number}`);
                } else if (this.sendingCommands[this.commandIndex] === '03\r') {
                    let troubleString = completeData.replace(/[^a-zA-Z0-9.\s]|[\r\n]+/g, '');
                    let pairs = troubleString.split(' ');
                    let secondAndThirdPair = pairs[1] + pairs[2]; // '0133'
                    
                    // Crear un objeto para mapear los reemplazos
                    let replacements = {
                      '0': 'P0',
                      '1': 'P1',
                      '2': 'P2',
                      '3': 'P3',
                      '4': 'C0',
                      '5': 'C1',
                      '6': 'C2',
                      '7': 'C3',
                      '8': 'B0',
                      '9': 'B1',
                      'A': 'B2',
                      'B': 'B3',
                      'C': 'U0',
                      'D': 'U1',
                      'E': 'U2',
                      'F': 'U3'
                    };
                    
                    // Obtener el primer caracter
                    let firstChar = secondAndThirdPair[0];
                    
                    // Reemplazar el primer caracter
                    let finalString = replacements[firstChar] + secondAndThirdPair.slice(1);
                    
                    // Guardar el resultado en 'this.codesInfo.codes'
                    this.codesInfo.codes = finalString

                    this.codesInfo.description = pcodes[finalString] ? pcodes[finalString] : "n/a"; // Aquí agregamos la descripción

                    console.log(`Contenido de codes: ${this.codesInfo.codes}`);
                    console.log(`Descripción de codes: ${this.codesInfo.description}`);
                }
                this.commandIndex++;
                if (this.commandIndex >= this.sendingCommands.length) {
                    // Si se han recibido todas las respuestas necesarias de la informacion del vehiculo, emite los datos a través de Socket.IO
                    if (this.codesInfo.number <= 0 && this.codesInfo.codes !== undefined) {
                        this.isRunning = false
                        this.resetCodesInfo();
                        console.log(this.codesInfo);
                        const socket = global.connectedSocket;
                        if(socket) {
                            socket.emit('codesData', this.codesInfo);
                            this.socketConnection.disconnect();
                            this.socketConnection.off('dataReceived', this.boundHandleData);
                        }
                    } else if (this.codesInfo.number !== undefined && this.codesInfo.codes !== undefined && this.codesInfo.description !== undefined) {
                        console.log(this.codesInfo);
                        const socket = global.connectedSocket;
                        if(socket) {
                            socket.emit('codesData', this.codesInfo);
                        }
                    }
                }
                if (this.commandIndex < this.sendingCommands.length) {
                    setTimeout(this.sendCommand.bind(this), 500);
                }
                // Verifica si terminaron de enviarse todos los comandos y cierra el socket
                if (this.commandIndex >= this.sendingCommands.length) {
                    // Cierra la conexión con el socket
                    console.log('Secuencia de diagnostico terminada.')
                    this.socketConnection.disconnect();  // Desconectarse primero asegurarse que no se emitan mas eventos.
                    this.socketConnection.off('dataReceived', this.boundHandleData)
                    this.commandIndex = 0
                }
            }
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = SendingTroubleCodesCommands