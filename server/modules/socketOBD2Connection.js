const net = require('net')
const EventEmitter = require('events')

class SocketOBD2Connection extends EventEmitter{
  constructor(host = '192.168.0.10', port = 35000) {  // Default HW Device IP/Port
    super()
    this.OBD_PORT = port
    this.OBD_IP = host
    this.socket = new net.Socket()

    // Guardar una referencia a la función con el contexto correcto
    this.boundListen = this.listen.bind(this)

    this.socket.on('error', (err) => {
      this.socket.end()
      this.emit('error', err)
    })
    this.socket.on('connect', () => {
      this.emit('connected')
      this.socket.setTimeout(120000)  // Establece el tiempo de espera del socket en un minuto
    })
    this.socket.on('close', () => {
      console.log('Iniciando desconexion...') // Mensaje de cierre
      this.emit('disconnected')
    })
    this.socket.on('data', this.boundListen)
    this.socket.on('timeout', () => {
      console.log('Socket timeout')
      this.disconnect()
    })
  }

  connect() {
    console.log('Conectando al adaptador OBDII ELM327 WiFi')
    this.socket.connect(this.OBD_PORT, this.OBD_IP, () => {
      this.emit('connected')
    })
  }

  disconnect() {
    this.socket.off('data', this.boundListen)
    this.socket.end()
  }
   
  send(data) {
      this.socket.write(data)
  }

  listen(data) {
    // Personalized event to listen for data
    this.emit('dataReceived', data)
  }

}

module.exports = SocketOBD2Connection;
